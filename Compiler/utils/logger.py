from datetime import datetime

def log(message: str, level: str = "info") -> dict:
    return {
        "timestamp": datetime.now().isoformat(),
        "level": level,
        "message": message
    }
