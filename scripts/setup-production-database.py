import os
import asyncio
from datetime import datetime, timedelta
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import DuplicateKeyError
import bcrypt

# MongoDB connection
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
client = MongoClient(MONGODB_URI)
db = client.flowmaster

def create_collections_and_indexes():
    """Create all collections with proper indexes for production"""
    
    print("Creating collections and indexes...")
    
    # Users collection
    users = db.users
    users.create_index("email", unique=True)
    users.create_index("createdAt")
    print("✓ Users collection configured")
    
    # Workflows collection
    workflows = db.workflows
    workflows.create_index([("userId", ASCENDING), ("status", ASCENDING)])
    workflows.create_index([("userId", ASCENDING), ("createdAt", DESCENDING)])
    workflows.create_index("status")
    workflows.create_index("createdAt")
    workflows.create_index("updatedAt")
    workflows.create_index([("userId", ASCENDING), ("name", "text")])
    print("✓ Workflows collection configured")
    
    # Executions collection
    executions = db.executions
    executions.create_index([("workflowId", ASCENDING), ("startTime", DESCENDING)])
    executions.create_index([("userId", ASCENDING), ("startTime", DESCENDING)])
    executions.create_index("status")
    executions.create_index("startTime")
    executions.create_index("workflowId")
    executions.create_index("userId")
    print("✓ Executions collection configured")
    
    # Workflow Templates collection
    templates = db.workflow_templates
    templates.create_index("category")
    templates.create_index("isPublic")
    templates.create_index([("name", "text"), ("description", "text")])
    templates.create_index("createdAt")
    templates.create_index("usageCount")
    print("✓ Workflow Templates collection configured")
    
    # Human Reviews collection
    human_reviews = db.human_reviews
    human_reviews.create_index([("workflowId", ASCENDING), ("status", ASCENDING)])
    human_reviews.create_index([("userId", ASCENDING), ("status", ASCENDING)])
    human_reviews.create_index("executionId")
    human_reviews.create_index("createdAt")
    human_reviews.create_index("status")
    print("✓ Human Reviews collection configured")
    
    # Agent Logs collection (for debugging and monitoring)
    agent_logs = db.agent_logs
    agent_logs.create_index([("executionId", ASCENDING), ("timestamp", DESCENDING)])
    agent_logs.create_index([("workflowId", ASCENDING), ("timestamp", DESCENDING)])
    agent_logs.create_index("timestamp")
    agent_logs.create_index("level")
    print("✓ Agent Logs collection configured")
    
    # Workflow Stats collection (for analytics)
    workflow_stats = db.workflow_stats
    workflow_stats.create_index([("workflowId", ASCENDING), ("date", DESCENDING)])
    workflow_stats.create_index([("userId", ASCENDING), ("date", DESCENDING)])
    workflow_stats.create_index("date")
    print("✓ Workflow Stats collection configured")
    
    print("All collections and indexes created successfully!")

def seed_production_data():
    """Seed the database with production-ready sample data"""
    
    print("Seeding production data...")
    
    # Create admin user
    admin_password = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt())
    admin_user = {
        "name": "System Administrator",
        "email": "admin@flowmaster.ai",
        "password": admin_password.decode('utf-8'),
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    }
    
    try:
        admin_result = db.users.insert_one(admin_user)
        admin_id = str(admin_result.inserted_id)
        print("✓ Admin user created")
    except DuplicateKeyError:
        admin_user_doc = db.users.find_one({"email": "admin@flowmaster.ai"})
        admin_id = str(admin_user_doc["_id"])
        print("✓ Admin user already exists")
    
    # Create demo user
    demo_password = bcrypt.hashpw("demo123".encode('utf-8'), bcrypt.gensalt())
    demo_user = {
        "name": "Demo User",
        "email": "demo@flowmaster.ai",
        "password": demo_password.decode('utf-8'),
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    }
    
    try:
        demo_result = db.users.insert_one(demo_user)
        demo_id = str(demo_result.inserted_id)
        print("✓ Demo user created")
    except DuplicateKeyError:
        demo_user_doc = db.users.find_one({"email": "demo@flowmaster.ai"})
        demo_id = str(demo_user_doc["_id"])
        print("✓ Demo user already exists")
    
    # Create workflow templates
    templates = [
        {
            "name": "Email Processing Pipeline",
            "description": "Automatically process incoming emails with AI analysis and routing",
            "category": "Email Automation",
            "nodes": [
                {
                    "id": "1",
                    "type": "langgraph",
                    "position": {"x": 100, "y": 100},
                    "data": {
                        "label": "Email Trigger",
                        "type": "trigger",
                        "nodeType": "trigger",
                        "description": "Triggers when new email arrives"
                    }
                },
                {
                    "id": "2",
                    "type": "langgraph",
                    "position": {"x": 400, "y": 100},
                    "data": {
                        "label": "AI Email Processor",
                        "type": "agent",
                        "nodeType": "agent",
                        "description": "Analyze email content with AI"
                    }
                },
                {
                    "id": "3",
                    "type": "langgraph",
                    "position": {"x": 700, "y": 100},
                    "data": {
                        "label": "Priority Router",
                        "type": "conditional",
                        "nodeType": "conditional",
                        "description": "Route based on email priority"
                    }
                }
            ],
            "edges": [
                {"id": "e1-2", "source": "1", "target": "2"},
                {"id": "e2-3", "source": "2", "target": "3"}
            ],
            "tags": ["email", "ai", "automation", "routing"],
            "isPublic": True,
            "createdBy": admin_id,
            "createdAt": datetime.now(),
            "usageCount": 0
        },
        {
            "name": "Data Analysis Workflow",
            "description": "Automated data processing and analysis with AI insights",
            "category": "Data Processing",
            "nodes": [
                {
                    "id": "1",
                    "type": "langgraph",
                    "position": {"x": 100, "y": 100},
                    "data": {
                        "label": "Data Source",
                        "type": "trigger",
                        "nodeType": "trigger",
                        "description": "Connect to data source"
                    }
                },
                {
                    "id": "2",
                    "type": "langgraph",
                    "position": {"x": 400, "y": 100},
                    "data": {
                        "label": "Data Analyst Agent",
                        "type": "agent",
                        "nodeType": "agent",
                        "description": "AI-powered data analysis"
                    }
                },
                {
                    "id": "3",
                    "type": "langgraph",
                    "position": {"x": 700, "y": 100},
                    "data": {
                        "label": "Generate Report",
                        "type": "action",
                        "nodeType": "action",
                        "description": "Create analysis report"
                    }
                }
            ],
            "edges": [
                {"id": "e1-2", "source": "1", "target": "2"},
                {"id": "e2-3", "source": "2", "target": "3"}
            ],
            "tags": ["data", "analysis", "ai", "reporting"],
            "isPublic": True,
            "createdBy": admin_id,
            "createdAt": datetime.now(),
            "usageCount": 0
        },
        {
            "name": "Customer Support Automation",
            "description": "Intelligent customer support ticket routing and response",
            "category": "Customer Support",
            "nodes": [
                {
                    "id": "1",
                    "type": "langgraph",
                    "position": {"x": 100, "y": 100},
                    "data": {
                        "label": "Support Ticket",
                        "type": "trigger",
                        "nodeType": "trigger",
                        "description": "New support ticket received"
                    }
                },
                {
                    "id": "2",
                    "type": "langgraph",
                    "position": {"x": 400, "y": 100},
                    "data": {
                        "label": "AI Ticket Analyzer",
                        "type": "agent",
                        "nodeType": "agent",
                        "description": "Analyze ticket content and urgency"
                    }
                },
                {
                    "id": "3",
                    "type": "langgraph",
                    "position": {"x": 700, "y": 50},
                    "data": {
                        "label": "Urgency Router",
                        "type": "conditional",
                        "nodeType": "conditional",
                        "description": "Route based on urgency level"
                    }
                },
                {
                    "id": "4",
                    "type": "langgraph",
                    "position": {"x": 1000, "y": 0},
                    "data": {
                        "label": "Auto Response",
                        "type": "action",
                        "nodeType": "action",
                        "description": "Send automated response"
                    }
                },
                {
                    "id": "5",
                    "type": "langgraph",
                    "position": {"x": 1000, "y": 100},
                    "data": {
                        "label": "Human Agent",
                        "type": "human",
                        "nodeType": "human",
                        "description": "Escalate to human agent"
                    }
                }
            ],
            "edges": [
                {"id": "e1-2", "source": "1", "target": "2"},
                {"id": "e2-3", "source": "2", "target": "3"},
                {"id": "e3-4", "source": "3", "target": "4"},
                {"id": "e3-5", "source": "3", "target": "5"}
            ],
            "tags": ["support", "customer", "ai", "routing", "automation"],
            "isPublic": True,
            "createdBy": admin_id,
            "createdAt": datetime.now(),
            "usageCount": 0
        }
    ]
    
    # Insert templates
    for template in templates:
        try:
            db.workflow_templates.insert_one(template)
            print(f"✓ Template '{template['name']}' created")
        except DuplicateKeyError:
            print(f"✓ Template '{template['name']}' already exists")
    
    # Create sample workflows for demo user
    sample_workflows = [
        {
            "userId": demo_id,
            "name": "Email to Slack Notification",
            "description": "Automatically send Slack notifications for important emails",
            "nodes": [
                {
                    "id": "1",
                    "type": "langgraph",
                    "position": {"x": 100, "y": 100},
                    "data": {
                        "label": "Email Trigger",
                        "type": "trigger",
                        "nodeType": "trigger"
                    }
                },
                {
                    "id": "2",
                    "type": "langgraph",
                    "position": {"x": 400, "y": 100},
                    "data": {
                        "label": "AI Processor",
                        "type": "agent",
                        "nodeType": "agent"
                    }
                },
                {
                    "id": "3",
                    "type": "langgraph",
                    "position": {"x": 700, "y": 100},
                    "data": {
                        "label": "Send to Slack",
                        "type": "action",
                        "nodeType": "action"
                    }
                }
            ],
            "edges": [
                {"id": "e1-2", "source": "1", "target": "2"},
                {"id": "e2-3", "source": "2", "target": "3"}
            ],
            "status": "active",
            "executions": 156,
            "createdAt": datetime.now() - timedelta(days=30),
            "updatedAt": datetime.now() - timedelta(days=1),
            "lastRun": datetime.now() - timedelta(hours=2)
        },
        {
            "userId": demo_id,
            "name": "Document Processing Pipeline",
            "description": "Process uploaded documents with AI analysis",
            "nodes": [
                {
                    "id": "1",
                    "type": "langgraph",
                    "position": {"x": 100, "y": 100},
                    "data": {
                        "label": "File Upload Trigger",
                        "type": "trigger",
                        "nodeType": "trigger"
                    }
                },
                {
                    "id": "2",
                    "type": "langgraph",
                    "position": {"x": 400, "y": 100},
                    "data": {
                        "label": "Document Analyzer",
                        "type": "agent",
                        "nodeType": "agent"
                    }
                },
                {
                    "id": "3",
                    "type": "langgraph",
                    "position": {"x": 700, "y": 100},
                    "data": {
                        "label": "Store Results",
                        "type": "action",
                        "nodeType": "action"
                    }
                }
            ],
            "edges": [
                {"id": "e1-2", "source": "1", "target": "2"},
                {"id": "e2-3", "source": "2", "target": "3"}
            ],
            "status": "paused",
            "executions": 89,
            "createdAt": datetime.now() - timedelta(days=20),
            "updatedAt": datetime.now() - timedelta(days=5)
        },
        {
            "userId": demo_id,
            "name": "Social Media Monitor",
            "description": "Monitor social media mentions and respond automatically",
            "nodes": [
                {
                    "id": "1",
                    "type": "langgraph",
                    "position": {"x": 100, "y": 100},
                    "data": {
                        "label": "Social Media Trigger",
                        "type": "trigger",
                        "nodeType": "trigger"
                    }
                },
                {
                    "id": "2",
                    "type": "langgraph",
                    "position": {"x": 400, "y": 100},
                    "data": {
                        "label": "Sentiment Analyzer",
                        "type": "agent",
                        "nodeType": "agent"
                    }
                },
                {
                    "id": "3",
                    "type": "langgraph",
                    "position": {"x": 700, "y": 50},
                    "data": {
                        "label": "Response Router",
                        "type": "conditional",
                        "nodeType": "conditional"
                    }
                },
                {
                    "id": "4",
                    "type": "langgraph",
                    "position": {"x": 1000, "y": 0},
                    "type": "langgraph",
                    "position": {"x": 1000, "y": 0},
                    "data": {
                        "label": "Auto Reply",
                        "type": "action",
                        "nodeType": "action"
                    }
                },
                {
                    "id": "5",
                    "type": "langgraph",
                    "position": {"x": 1000, "y": 100},
                    "data": {
                        "label": "Human Review",
                        "type": "human",
                        "nodeType": "human"
                    }
                }
            ],
            "edges": [
                {"id": "e1-2", "source": "1", "target": "2"},
                {"id": "e2-3", "source": "2", "target": "3"},
                {"id": "e3-4", "source": "3", "target": "4"},
                {"id": "e3-5", "source": "3", "target": "5"}
            ],
            "status": "draft",
            "executions": 0,
            "createdAt": datetime.now() - timedelta(days=5),
            "updatedAt": datetime.now() - timedelta(days=5)
        }
    ]
    
    # Insert sample workflows
    for workflow in sample_workflows:
        try:
            db.workflows.insert_one(workflow)
            print(f"✓ Sample workflow '{workflow['name']}' created")
        except Exception as e:
            print(f"✓ Sample workflow '{workflow['name']}' already exists or error: {e}")
    
    # Create sample executions for statistics
    sample_executions = []
    workflow_ids = list(db.workflows.find({"userId": demo_id}, {"_id": 1}))
    
    for i in range(50):  # Create 50 sample executions
        execution_date = datetime.now() - timedelta(days=i//2, hours=i%24)
        status = "completed" if i % 10 != 0 else "failed"  # 90% success rate
        
        execution = {
            "workflowId": str(workflow_ids[i % len(workflow_ids)]["_id"]),
            "userId": demo_id,
            "status": status,
            "startTime": execution_date,
            "endTime": execution_date + timedelta(minutes=2, seconds=30),
            "results": [
                {
                    "nodeId": "1",
                    "status": "completed",
                    "output": {"message": "Trigger executed successfully"},
                    "timestamp": execution_date.isoformat()
                },
                {
                    "nodeId": "2", 
                    "status": "completed",
                    "output": {"message": "AI processing completed"},
                    "timestamp": (execution_date + timedelta(seconds=30)).isoformat()
                }
            ],
            "logs": [
                f"Execution started at {execution_date.isoformat()}",
                "Processing node 1: Trigger",
                "Processing node 2: AI Agent",
                f"Execution {'completed' if status == 'completed' else 'failed'}"
            ],
            "nodeStates": {
                "1": {"status": "completed", "data": {}},
                "2": {"status": "completed", "data": {}}
            }
        }
        
        if status == "failed":
            execution["error"] = "Simulated execution failure for testing"
        
        sample_executions.append(execution)
    
    # Insert sample executions
    if sample_executions:
        db.executions.insert_many(sample_executions)
        print(f"✓ {len(sample_executions)} sample executions created")
    
    print("Production data seeding completed successfully!")

def create_admin_views():
    """Create database views for admin analytics"""
    
    print("Creating admin views...")
    
    # Workflow performance view
    try:
        db.create_collection("workflow_performance_view", viewOn="executions", pipeline=[
            {
                "$group": {
                    "_id": "$workflowId",
                    "totalExecutions": {"$sum": 1},
                    "successfulExecutions": {
                        "$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}
                    },
                    "failedExecutions": {
                        "$sum": {"$cond": [{"$eq": ["$status", "failed"]}, 1, 0]}
                    },
                    "avgExecutionTime": {
                        "$avg": {
                            "$subtract": ["$endTime", "$startTime"]
                        }
                    },
                    "lastExecution": {"$max": "$startTime"}
                }
            },
            {
                "$addFields": {
                    "successRate": {
                        "$multiply": [
                            {"$divide": ["$successfulExecutions", "$totalExecutions"]},
                            100
                        ]
                    }
                }
            }
        ])
        print("✓ Workflow performance view created")
    except Exception as e:
        print(f"✓ Workflow performance view already exists or error: {e}")
    
    # User activity view
    try:
        db.create_collection("user_activity_view", viewOn="executions", pipeline=[
            {
                "$group": {
                    "_id": {
                        "userId": "$userId",
                        "date": {
                            "$dateToString": {
                                "format": "%Y-%m-%d",
                                "date": "$startTime"
                            }
                        }
                    },
                    "executionCount": {"$sum": 1},
                    "successCount": {
                        "$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}
                    }
                }
            }
        ])
        print("✓ User activity view created")
    except Exception as e:
        print(f"✓ User activity view already exists or error: {e}")

def setup_production_environment():
    """Complete production environment setup"""
    
    print("Setting up FlowMaster AI production environment...")
    print("=" * 50)
    
    # Create collections and indexes
    create_collections_and_indexes()
    print()
    
    # Seed production data
    seed_production_data()
    print()
    
    # Create admin views
    create_admin_views()
    print()
    
    print("=" * 50)
    print("Production environment setup completed!")
    print()
    print("Default accounts created:")
    print("Admin: admin@flowmaster.ai / admin123")
    print("Demo:  demo@flowmaster.ai / demo123")
    print()
    print("Database collections:")
    collections = db.list_collection_names()
    for collection in sorted(collections):
        count = db[collection].count_documents({})
        print(f"  - {collection}: {count} documents")
    print()
    print("Ready for production! 🚀")

if __name__ == "__main__":
    setup_production_environment()
