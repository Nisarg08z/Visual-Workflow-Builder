from pymongo import MongoClient
from datetime import datetime
import os

# MongoDB connection
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
client = MongoClient(MONGODB_URI)
db = client.flowmaster

def setup_collections():
    """Create collections and indexes"""
    
    # Users collection
    users = db.users
    users.create_index("email", unique=True)
    
    # Workflows collection
    workflows = db.workflows
    workflows.create_index("userId")
    workflows.create_index("status")
    workflows.create_index("createdAt")
    
    # Executions collection
    executions = db.executions
    executions.create_index("workflowId")
    executions.create_index("userId")
    executions.create_index("startTime")
    
    print("Collections and indexes created successfully!")

def seed_sample_data():
    """Insert sample data for testing"""
    
    # Sample user
    sample_user = {
        "email": "john@example.com",
        "name": "John Doe",
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    }
    
    user_result = db.users.insert_one(sample_user)
    user_id = str(user_result.inserted_id)
    
    # Sample workflows
    sample_workflows = [
        {
            "userId": user_id,
            "name": "Email to Slack Notification",
            "description": "Automatically send Slack notifications for important emails",
            "nodes": [],
            "edges": [],
            "status": "active",
            "createdAt": datetime.now(),
            "updatedAt": datetime.now(),
            "executions": 156
        },
        {
            "userId": user_id,
            "name": "Data Processing Pipeline",
            "description": "Process CSV files and update database records",
            "nodes": [],
            "edges": [],
            "status": "paused",
            "createdAt": datetime.now(),
            "updatedAt": datetime.now(),
            "executions": 89
        }
    ]
    
    db.workflows.insert_many(sample_workflows)
    
    print("Sample data inserted successfully!")

if __name__ == "__main__":
    setup_collections()
    seed_sample_data()
    print("Database setup completed!")
