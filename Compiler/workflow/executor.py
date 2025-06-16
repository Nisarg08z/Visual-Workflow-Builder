import json
from langgraph.graph import StateGraph, END
from agent.state import AgentState
from agent.nodes import call_llm_node, execute_tools_node, end_workflow_node
from agent.conditionals import should_continue
from utils.mongo import get_mongo_checkpointer

def build_and_run_langgraph_workflow(workflow_def, initial_input_str, thread_id, mongo_uri):
    try:
        initial_input = json.loads(initial_input_str)
    except json.JSONDecodeError:
        return {
            "status": "failed",
            "error": "Invalid initial input JSON",
            "logs": []
        }

    try:
        client, checkpointer = get_mongo_checkpointer(mongo_uri)

        # Define the workflow
        builder = StateGraph(AgentState)
        builder.add_node("llm", call_llm_node)
        builder.add_node("tool_executor", execute_tools_node)
        builder.add_node("end", end_workflow_node)

        builder.set_entry_point("llm")
        builder.add_conditional_edges(
            "llm",
            should_continue,
            {
                "continue": "tool_executor",
                "end": "end"
            }
        )
        builder.add_edge("tool_executor", "llm")
        builder.add_edge("end", END)

        graph = builder.compile()
        app = graph.with_config({"checkpointer": checkpointer})

        inputs = {
            "messages": [],
            "tool_calls": [],
            "tool_response": None,
            "workflow_logs": [],
            "current_workflow_data": initial_input
        }

        final_state = app.invoke(inputs, config={"configurable": {"thread_id": thread_id}})

        return {
            "status": "success",
            "output_data": final_state.get("current_workflow_data", {}),
            "logs": final_state.get("workflow_logs", [])
        }

    except Exception as e:
        return {
            "status": "failed",
            "error": str(e),
            "logs": []
        }
