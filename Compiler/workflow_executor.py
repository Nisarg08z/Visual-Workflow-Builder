import os
import json
import sys
from typing import TypedDict, Annotated, List, Dict, Any
from datetime import datetime

from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool 
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.mongodb import MongoDBSaver
from pymongo import MongoClient

class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], lambda a, b: a + b] 
    tool_calls: List[Dict] 
    tool_response: Any
    current_workflow_data: Dict[str, Any]
    workflow_logs: Annotated[List[Dict[str, Any]], lambda a, b: a + b] 

try:
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY environment variable not set.")
    llm = ChatOpenAI(model="gpt-4o", temperature=0.7, api_key=OPENAI_API_KEY)
except Exception as e:
    print(json.dumps({"status": "failed", "error": f"Failed to initialize OpenAI LLM: {e}", "logs": [{"level": "error", "message": f"LLM Init Error: {e}"}]}), file=sys.stderr)
    sys.exit(1)

@tool
def simple_data_processor(data: str) -> str:
    """Processes a simple string input by converting to uppercase and adding a suffix."""
    processed = data.upper() + "_PROCESSED"
    log_entry = {"timestamp": datetime.now().isoformat(), "level": "info", "message": f"Processed data: {data} -> {processed}"}
    return processed, log_entry

tools = [simple_data_processor]
llm_with_tools = llm.bind_tools(tools)

def call_llm_node(state: AgentState):
    """
    Node that calls the LLM with the current message history.
    It can be configured to use tools if the LLM is capable.
    """
    messages = state["messages"]
    logs = state.get("workflow_logs", [])
    logs.append({"timestamp": datetime.now().isoformat(), "level": "info", "message": "Calling LLM with messages."})

    try:
        response = llm_with_tools.invoke(messages) 
        logs.append({"timestamp": datetime.now().isoformat(), "level": "info", "message": f"LLM response received. Type: {type(response).__name__}"})

        if response.tool_calls:
            logs.append({"timestamp": datetime.now().isoformat(), "level": "info", "message": f"LLM requested tool calls: {response.tool_calls}"})
            return {"messages": [response], "tool_calls": response.tool_calls, "workflow_logs": logs}
        else:
            return {"messages": [response], "workflow_logs": logs}
    except Exception as e:
        logs.append({"timestamp": datetime.now().isoformat(), "level": "error", "message": f"Error calling LLM: {e}"})
        raise e 

def execute_tools_node(state: AgentState):
    """
    Node that executes the tools identified by the LLM.
    """
    tool_calls = state["tool_calls"]
    logs = state.get("workflow_logs", [])
    messages = state["messages"] 
    tool_responses = []

    for tool_call in tool_calls:
        tool_name = tool_call['name']
        tool_args = tool_call['args']
        logs.append({"timestamp": datetime.now().isoformat(), "level": "info", "message": f"Executing tool: {tool_name} with args: {tool_args}"})
        try:
           
            selected_tool = next((t for t in tools if t.name == tool_name), None)
            if selected_tool:
                result, tool_log = selected_tool.invoke(tool_args) 
                tool_responses.append(result)
                messages.append(AIMessage(content=f"Tool {tool_name} executed. Result: {result}"))
                logs.append(tool_log) 
            else:
                raise ValueError(f"Tool '{tool_name}' not found.")
        except Exception as e:
            logs.append({"timestamp": datetime.now().isoformat(), "level": "error", "message": f"Error executing tool {tool_name}: {e}"})
            raise e 

    return {"tool_response": tool_responses, "messages": messages, "workflow_logs": logs}

def end_workflow_node(state: AgentState):
    logs = state.get("workflow_logs", [])
    logs.append({"timestamp": datetime.now().isoformat(), "level": "info", "message": "Workflow reached end node."})
    return {"workflow_logs": logs}

def should_continue(state: AgentState) -> str:
    """
    Conditional edge logic: decide whether to continue calling tools or end.
    """
    last_message = state["messages"][-1]
    if "tool_calls" in last_message.additional_kwargs and last_message.additional_kwargs["tool_calls"]:
        return "continue" 
    return "end" 

def build_and_run_langgraph_workflow(workflow_definition: Dict[str, Any], initial_input: str, thread_id: str, mongo_uri: str):
    """
    Dynamically builds and runs a LangGraph workflow.
    `workflow_definition`: JSON representing the nodes and edges from the frontend.
    `initial_input`: The initial message/input from the user.
    `thread_id`: Unique ID for checkpointing (e.g., the WorkflowExecution _id).
    `mongo_uri`: MongoDB connection string for the checkpointer.
    """
    logs = [{"timestamp": datetime.now().isoformat(), "level": "info", "message": "Python executor started."}]

    try:

        client = MongoClient(mongo_uri)

        checkpointer = MongoDBSaver(client)
        logs.append({"timestamp": datetime.now().isoformat(), "level": "info", "message": "MongoDB checkpointer initialized."})

        workflow_builder = StateGraph(AgentState)

        workflow_builder.add_node("llm_caller", call_llm_node)
        workflow_builder.add_node("tool_executor", execute_tools_node)
        workflow_builder.add_node("end_node", end_workflow_node)

        workflow_builder.set_entry_point("llm_caller")

        workflow_builder.add_conditional_edges(
            "llm_caller",     
            should_continue,   
            {
                "continue": "tool_executor",
                "end": END                 
            }
        )
        workflow_builder.add_edge("tool_executor", "llm_caller") 

        app = workflow_builder.compile(checkpointer=checkpointer)
        logs.append({"timestamp": datetime.now().isoformat(), "level": "info", "message": "LangGraph compiled with MongoDB checkpointer."})

        initial_messages = [HumanMessage(content=initial_input)]

        config = {"configurable": {"thread_id": thread_id}}
        logs.append({"timestamp": datetime.now().isoformat(), "level": "info", "message": f"Running LangGraph with thread_id: {thread_id}"})

        final_state = None
        for s in app.stream({"messages": initial_messages, "current_workflow_data": workflow_definition, "workflow_logs": logs}, config=config):
            final_state = s
            
        execution_status = "success"
        output_data = {}
        error_message = None
        final_logs = []

        if final_state:
            final_messages = final_state.get("messages", [])
            final_output_message = final_messages[-1].content if final_messages else "No final message."
            output_data = {"final_response": final_output_message, "all_messages": [msg.dict() for msg in final_messages]}
            final_logs = final_state.get("workflow_logs", [])
            logs.extend(final_logs) 

        logs.append({"timestamp": datetime.now().isoformat(), "level": "info", "message": "LangGraph execution completed."})

    except Exception as e:
        execution_status = "failed"
        error_message = str(e)
        output_data = {"error": error_message}
        logs.append({"timestamp": datetime.now().isoformat(), "level": "error", "message": f"Workflow execution failed: {error_message}"})
        print(f"Python script encountered an error: {e}", file=sys.stderr)

    finally:
     
        if 'client' in locals() and client:
            client.close()
            logs.append({"timestamp": datetime.now().isoformat(), "level": "info", "message": "MongoDB client closed."})


    return {
        "status": execution_status,
        "output_data": output_data,
        "logs": logs,
        "error": error_message
    }

if __name__ == "__main__":

    if len(sys.argv) < 4:
        print(json.dumps({"status": "failed", "error": "Missing arguments. Usage: python workflow_executor.py <workflow_json> <initial_input> <thread_id> <mongo_uri>"}), file=sys.stderr)
        sys.exit(1)

    workflow_json_str = sys.argv[1]
    initial_input_str = sys.argv[2]
    thread_id_arg = sys.argv[3]
    mongo_uri_arg = sys.argv[4] 

    try:
        workflow_def = json.loads(workflow_json_str)
    except json.JSONDecodeError:
        print(json.dumps({"status": "failed", "error": "Invalid workflow JSON provided."}), file=sys.stderr)
        sys.exit(1)

    result = build_and_run_langgraph_workflow(workflow_def, initial_input_str, thread_id_arg, mongo_uri_arg)
    print(json.dumps(result)) 
