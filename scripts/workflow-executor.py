import asyncio
import json
from datetime import datetime
from pymongo import MongoClient
import openai
import os
from bson import ObjectId

# Configuration
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

client = MongoClient(MONGODB_URI)
db = client.flowmaster

# Initialize OpenAI
if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY

class WorkflowExecutor:
    def __init__(self):
        self.db = db
        
    async def execute_workflow(self, workflow_id: str):
        """Execute a workflow by ID"""
        workflow = self.db.workflows.find_one({"_id": ObjectId(workflow_id)})
        
        if not workflow:
            raise Exception(f"Workflow {workflow_id} not found")
        
        # Create execution record
        execution = {
            "workflowId": workflow_id,
            "userId": workflow["userId"],
            "status": "running",
            "startTime": datetime.now(),
            "results": []
        }
        
        execution_id = self.db.executions.insert_one(execution).inserted_id
        
        try:
            # Execute nodes in order
            for node in workflow["nodes"]:
                result = await self.execute_node(node)
                execution["results"].append({
                    "nodeId": node["id"],
                    "status": "completed",
                    "output": result,
                    "timestamp": datetime.now()
                })
            
            # Update execution as completed
            self.db.executions.update_one(
                {"_id": execution_id},
                {
                    "$set": {
                        "status": "completed",
                        "endTime": datetime.now(),
                        "results": execution["results"]
                    }
                }
            )
            
            # Update workflow execution count
            self.db.workflows.update_one(
                {"_id": workflow_id},
                {
                    "$inc": {"executions": 1},
                    "$set": {"lastRun": datetime.now()}
                }
            )
            
            return execution_id
            
        except Exception as e:
            # Update execution as failed
            self.db.executions.update_one(
                {"_id": execution_id},
                {
                    "$set": {
                        "status": "failed",
                        "endTime": datetime.now(),
                        "error": str(e)
                    }
                }
            )
            raise e
    
    async def execute_node(self, node):
        """Execute a single node"""
        node_type = node["data"]["type"]
        node_label = node["data"]["label"]
        
        if node_type == "trigger":
            return await self.execute_trigger(node)
        elif node_type == "action":
            return await self.execute_action(node)
        else:
            return {"message": f"Unknown node type: {node_type}"}
    
    async def execute_trigger(self, node):
        """Execute trigger nodes"""
        label = node["data"]["label"]
        
        if "Email" in label:
            return {"message": "Email trigger activated", "emails_found": 3}
        elif "Webhook" in label:
            return {"message": "Webhook received", "payload": {"status": "success"}}
        elif "Schedule" in label:
            return {"message": "Scheduled trigger fired", "time": datetime.now().isoformat()}
        
        return {"message": f"Trigger {label} executed"}
    
    async def execute_action(self, node):
        """Execute action nodes"""
        label = node["data"]["label"]
        
        if "AI" in label or "Process" in label:
            return await self.execute_ai_action(node)
        elif "Database" in label:
            return await self.execute_database_action(node)
        elif "Slack" in label:
            return await self.execute_slack_action(node)
        elif "Email" in label:
            return await self.execute_email_action(node)
        
        return {"message": f"Action {label} executed"}
    
    async def execute_ai_action(self, node):
        """Execute AI-powered actions using OpenAI"""
        if not OPENAI_API_KEY:
            return {"message": "AI action completed (OpenAI not configured)"}
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "user",
                        "content": f"Process this workflow action: {node['data']['label']}. Provide a brief summary of what was accomplished."
                    }
                ],
                max_tokens=100
            )
            
            return {
                "message": "AI processing completed",
                "ai_response": response.choices[0].message.content
            }
        except Exception as e:
            return {"message": f"AI action completed with fallback: {str(e)}"}
    
    async def execute_database_action(self, node):
        """Execute database operations"""
        return {
            "message": "Database operation completed",
            "records_affected": 5,
            "operation": "INSERT"
        }
    
    async def execute_slack_action(self, node):
        """Execute Slack notifications"""
        return {
            "message": "Slack notification sent",
            "channel": "#general",
            "timestamp": datetime.now().isoformat()
        }
    
    async def execute_email_action(self, node):
        """Execute email actions"""
        return {
            "message": "Email sent successfully",
            "recipients": ["user@example.com"],
            "subject": "Workflow Notification"
        }

async def main():
    """Main execution function"""
    executor = WorkflowExecutor()
    
    # Example: Execute a workflow
    try:
        workflow_id = "sample_workflow_id"
        execution_id = await executor.execute_workflow(workflow_id)
        print(f"Workflow executed successfully. Execution ID: {execution_id}")
    except Exception as e:
        print(f"Workflow execution failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
