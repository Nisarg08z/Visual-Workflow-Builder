from typing import Dict, Any, List
import importlib.util
import tempfile
import os
from app.database import get_database
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

class NodeService:
    @staticmethod
    def get_available_node_types():
        """Get all available node types"""
        return {
            "trigger": {
                "name": "Trigger",
                "description": "Start workflow execution",
                "category": "triggers",
                "config_schema": {
                    "type": "object",
                    "properties": {
                        "trigger_type": {
                            "type": "string",
                            "enum": ["manual", "webhook", "schedule"],
                            "default": "manual"
                        }
                    }
                }
            },
            "chatbot": {
                "name": "ChatBot",
                "description": "AI-powered conversation",
                "category": "ai",
                "config_schema": {
                    "type": "object",
                    "properties": {
                        "openai_api_key": {
                            "type": "string",
                            "description": "OpenAI API Key"
                        },
                        "model": {
                            "type": "string",
                            "enum": ["gpt-3.5-turbo", "gpt-4"],
                            "default": "gpt-3.5-turbo"
                        },
                        "system_prompt": {
                            "type": "string",
                            "description": "System prompt for the chatbot"
                        },
                        "temperature": {
                            "type": "number",
                            "minimum": 0,
                            "maximum": 2,
                            "default": 0.7
                        }
                    },
                    "required": ["openai_api_key"]
                }
            },
            "database": {
                "name": "Database",
                "description": "Store and retrieve data",
                "category": "data",
                "config_schema": {
                    "type": "object",
                    "properties": {
                        "operation": {
                            "type": "string",
                            "enum": ["insert", "find", "update", "delete"],
                            "default": "find"
                        },
                        "collection": {
                            "type": "string",
                            "description": "Collection name"
                        },
                        "query": {
                            "type": "object",
                            "description": "Database query"
                        }
                    },
                    "required": ["operation", "collection"]
                }
            },
            "email": {
                "name": "Email",
                "description": "Send email notifications",
                "category": "communication",
                "config_schema": {
                    "type": "object",
                    "properties": {
                        "smtp_server": {"type": "string"},
                        "smtp_port": {"type": "integer", "default": 587},
                        "username": {"type": "string"},
                        "password": {"type": "string"},
                        "to": {"type": "string"},
                        "subject": {"type": "string"},
                        "body": {"type": "string"}
                    },
                    "required": ["smtp_server", "username", "password", "to", "subject", "body"]
                }
            },
            "webhook": {
                "name": "Webhook",
                "description": "HTTP requests and APIs",
                "category": "integration",
                "config_schema": {
                    "type": "object",
                    "properties": {
                        "url": {"type": "string"},
                        "method": {
                            "type": "string",
                            "enum": ["GET", "POST", "PUT", "DELETE"],
                            "default": "GET"
                        },
                        "headers": {"type": "object"},
                        "body": {"type": "object"}
                    },
                    "required": ["url"]
                }
            },
            "ai": {
                "name": "AI Processing",
                "description": "AI and ML operations",
                "category": "ai",
                "config_schema": {
                    "type": "object",
                    "properties": {
                        "provider": {
                            "type": "string",
                            "enum": ["openai", "anthropic", "huggingface"],
                            "default": "openai"
                        },
                        "api_key": {"type": "string"},
                        "model": {"type": "string"},
                        "prompt": {"type": "string"}
                    },
                    "required": ["provider", "api_key", "model", "prompt"]
                }
            },
            "code": {
                "name": "Code",
                "description": "Custom Python code",
                "category": "logic",
                "config_schema": {
                    "type": "object",
                    "properties": {
                        "code": {
                            "type": "string",
                            "description": "Python code to execute"
                        },
                        "requirements": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Python packages required"
                        }
                    },
                    "required": ["code"]
                }
            },
            "transform": {
                "name": "Transform",
                "description": "Data transformation",
                "category": "data",
                "config_schema": {
                    "type": "object",
                    "properties": {
                        "transformation": {
                            "type": "string",
                            "enum": ["map", "filter", "reduce", "sort"],
                            "default": "map"
                        },
                        "expression": {
                            "type": "string",
                            "description": "Transformation expression"
                        }
                    },
                    "required": ["transformation", "expression"]
                }
            }
        }

    @staticmethod
    async def create_custom_node(node_data: Dict[str, Any], user_id: str):
        """Create a custom node with Python code"""
        db = get_database()
        
        # Validate the Python code
        code = node_data.get("code", "")
        if not code:
            raise ValueError("Python code is required")
        
        # Basic syntax validation
        try:
            compile(code, "<string>", "exec")
        except SyntaxError as e:
            raise ValueError(f"Invalid Python syntax: {e}")
        
        # Save custom node to database
        custom_node = {
            "user_id": ObjectId(user_id),
            "name": node_data.get("name"),
            "description": node_data.get("description"),
            "code": code,
            "requirements": node_data.get("requirements", []),
            "config_schema": node_data.get("config_schema", {}),
            "created_at": datetime.utcnow()
        }
        
        result = await db.custom_nodes.insert_one(custom_node)
        
        return {
            "id": str(result.inserted_id),
            "message": "Custom node created successfully"
        }

    @staticmethod
    async def get_user_custom_nodes(user_id: str):
        """Get user's custom nodes"""
        db = get_database()
        
        nodes = await db.custom_nodes.find({
            "user_id": ObjectId(user_id)
        }).to_list(100)
        
        return [
            {
                "id": str(node["_id"]),
                "name": node["name"],
                "description": node["description"],
                "code": node["code"],
                "requirements": node["requirements"],
                "config_schema": node["config_schema"],
                "created_at": node["created_at"]
            }
            for node in nodes
        ]

    @staticmethod
    def validate_node_config(node_config: Dict[str, Any]) -> bool:
        """Validate node configuration against schema"""
        node_type = node_config.get("type")
        if not node_type:
            return False
        
        node_types = NodeService.get_available_node_types()
        if node_type not in node_types:
            return False
        
        # Basic validation - in production, use jsonschema
        schema = node_types[node_type]["config_schema"]
        required_fields = schema.get("required", [])
        
        config = node_config.get("config", {})
        for field in required_fields:
            if field not in config:
                return False
        
        return True

    @staticmethod
    async def execute_custom_node(node_id: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a custom node"""
        db = get_database()
        
        node = await db.custom_nodes.find_one({"_id": ObjectId(node_id)})
        if not node:
            raise ValueError("Custom node not found")
        
        # Create a temporary file with the code
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(node["code"])
            temp_file = f.name
        
        try:
            # Load and execute the module
            spec = importlib.util.spec_from_file_location("custom_node", temp_file)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            
            # Execute the main function
            if hasattr(module, 'execute'):
                result = module.execute(input_data)
                return {"success": True, "output": result}
            else:
                raise ValueError("Custom node must have an 'execute' function")
                
        except Exception as e:
            logger.error(f"Error executing custom node: {e}")
            return {"success": False, "error": str(e)}
        finally:
            # Clean up temporary file
            os.unlink(temp_file)