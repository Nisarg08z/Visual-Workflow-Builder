from typing import TypedDict, Annotated, List, Dict, Any
from langchain_core.messages import BaseMessage

class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], lambda a, b: a + b]
    tool_calls: List[Dict]
    tool_response: Any
    current_workflow_data: Dict[str, Any]
    workflow_logs: Annotated[List[Dict[str, Any]], lambda a, b: a + b]
