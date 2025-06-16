import sys
import json
from workflow.executor import build_and_run_langgraph_workflow

if __name__ == "__main__":
    if len(sys.argv) == 2 and sys.argv[1] == "--test":
        print(json.dumps({
            "status": "success",
            "output_data": {"result": "Hello from Python"},
            "logs": [{"level": "info", "message": "Python script executed successfully"}]
        }))
        sys.exit(0)

    if len(sys.argv) < 5:
        print(json.dumps({
            "status": "failed",
            "error": "Usage: python main.py <workflow_json> <initial_input> <thread_id> <mongo_uri>"
        }), file=sys.stderr)
        sys.exit(1)

    workflow_json_str = sys.argv[1]
    initial_input = sys.argv[2]
    thread_id = sys.argv[3]
    mongo_uri = sys.argv[4]

    try:
        workflow_def = json.loads(workflow_json_str)
    except json.JSONDecodeError:
        print(json.dumps({"status": "failed", "error": "Invalid workflow JSON"}), file=sys.stderr)
        sys.exit(1)

    result = build_and_run_langgraph_workflow(workflow_def, initial_input, thread_id, mongo_uri)
    print(json.dumps(result))
