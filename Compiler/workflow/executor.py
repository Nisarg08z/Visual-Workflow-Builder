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

        builder = StateGraph(AgentState)

        # 1. Register known functions for types
        node_type_to_fn = {
            "start": call_llm_node,
            "llm": call_llm_node,
            "tool_executor": execute_tools_node,
            "end": end_workflow_node
        }

        node_ids = set()
        start_node_id = None

        # 2. Add nodes from workflow_def
        for node in workflow_def.get("nodes", []):
            node_id = node["id"]
            node_type = node.get("type", "llm")
            fn = node_type_to_fn.get(node_type)

            if not fn:
                return {
                    "status": "failed",
                    "error": f"Unknown node type: {node_type}",
                    "logs": []
                }

            builder.add_node(node_id, fn)
            node_ids.add(node_id)

            if node_type == "start":
                start_node_id = node_id

        if not start_node_id:
            return {
                "status": "failed",
                "error": "No start node found",
                "logs": []
            }

        builder.set_entry_point(start_node_id)

        # 3. Add edges
        for edge in workflow_def.get("edges", []):
            source = edge["source"]
            target = edge["target"]

            # Special case: conditional from LLM
            if source == "llm":
                builder.add_conditional_edges(
                    "llm",
                    should_continue,
                    {
                        "continue": "tool_executor",
                        "end": "end"
                    }
                )
            else:
                if target in node_ids:
                    builder.add_edge(source, target)
                elif target == "end":
                    builder.add_edge(source, END)

        builder.add_edge("end", END)  # Safety net

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

