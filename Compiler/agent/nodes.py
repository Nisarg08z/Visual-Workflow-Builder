from langchain_core.messages import HumanMessage, AIMessage
from tools.tools import tools
from llm.llm_init import llm_with_tools
from utils.logger import log

def call_llm_node(state):
    user_input = state.get("current_workflow_data", {}).get("input", "")
    logs = state.get("workflow_logs", [])

    if not user_input:
        logs.append(log("error", "No user input provided in workflow state."))
        return {
            "messages": state.get("messages", []),
            "workflow_logs": logs,
        }

    logs.append(log("info", f"Calling LLM with input: {user_input}"))

    messages = state.get("messages", [])
    messages.append(HumanMessage(content=user_input))

    ai_response = llm_with_tools.invoke(messages)

    logs.append(log("info", f"LLM responded with: {ai_response.content}"))
    messages.append(ai_response)

    tool_calls = ai_response.additional_kwargs.get("tool_calls", [])

    return {
        "messages": messages,
        "tool_calls": tool_calls,
        "workflow_logs": logs
    }


def execute_tools_node(state):
    tool_calls = state.get("tool_calls", [])
    logs = state.get("workflow_logs", [])
    responses = []

    logs.append(log("info", f"Executing {len(tool_calls)} tool call(s)"))

    for call in tool_calls:
        tool_name = call.get("name")
        args = call.get("args", {})

        tool_func = next((t for t in tools if t.name == tool_name), None)
        if not tool_func:
            error_msg = f"Tool '{tool_name}' not found."
            logs.append(log("error", error_msg))
            responses.append(error_msg)
            continue

        try:
            result = tool_func.invoke(args)
            output, tool_log = result if isinstance(result, tuple) else (result, log(f"Tool {tool_name} executed."))
            logs.append(tool_log)
            responses.append(output)
        except Exception as e:
            error_msg = f"Error running tool '{tool_name}': {str(e)}"
            logs.append(log("error", error_msg))
            responses.append(error_msg)

    return {
        "tool_response": responses,
        "workflow_logs": logs
    }


def end_workflow_node(state):
    logs = state.get("workflow_logs", [])
    logs.append(log("info", "Workflow reached end node."))
    return {
        "workflow_logs": logs
    }
