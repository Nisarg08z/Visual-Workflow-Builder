def should_continue(state):
    last_message = state["messages"][-1]
    if "tool_calls" in last_message.additional_kwargs and last_message.additional_kwargs["tool_calls"]:
        return "continue"
    return "end"
