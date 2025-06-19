
def get_available_nodes():
    return [
        {"type": "start", "label": "Start Node", "component": "DiamondNode"},
        {"type": "llm", "label": "LLM Node", "component": "DiamondNode"},
        {"type": "tool_executor", "label": "Tool Node", "component": "DiamondNode"},
        {"type": "end", "label": "End Node", "component": "DiamondNode"},
    ]
