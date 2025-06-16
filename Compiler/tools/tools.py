from datetime import datetime
from langchain_core.tools import tool

@tool
def simple_data_processor(data: str) -> str:
    processed = data.upper() + "_PROCESSED"
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "level": "info",
        "message": f"Processed data: {data} -> {processed}"
    }
    return processed, log_entry

tools = [simple_data_processor]
