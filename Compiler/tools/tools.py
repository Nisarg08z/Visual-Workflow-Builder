from datetime import datetime
from langchain_core.tools import tool

@tool
def simple_data_processor(data: str) -> str:
    """
    Converts the input data to uppercase, appends '_PROCESSED', and returns it.
    Also logs the processing information with a timestamp.
    """
    processed = data.upper() + "_PROCESSED"
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "level": "info",
        "message": f"Processed data: {data} -> {processed}"
    }
    print(log_entry)  
    return processed

tools = [simple_data_processor]
