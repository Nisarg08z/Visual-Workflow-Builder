import asyncio
from typing import Dict, Any, AsyncGenerator
from app.database import get_database
from app.models.execution import ExecutionCreate, ExecutionInDB, ExecutionStep
from app.services.node_service import NodeService
from app.services.langchain_service import LangChainService
from bson import ObjectId
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ExecutionService:
    def __init__(self):
        self.langchain_service = LangChainService()

    async def execute_workflow(self, workflow_id: str, user_id: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a workflow and return the result"""
        db = get_database()
        
        # Get workflow
        workflow = await db.workflows.find_one({
            "_id": ObjectId(workflow_id),
            "user_id": ObjectId(user_id)
        })
        
        if not workflow:
            raise ValueError("Workflow not found")
        
        # Create execution record
        execution_data = ExecutionCreate(
            workflow_id=workflow_id,
            input_data=input_data
        )
        
        execution_dict = execution_data.dict()
        execution_dict["user_id"] = ObjectId(user_id)
        
        result = await db.executions.insert_one(execution_dict)
        execution_id = result.inserted_id
        
        try:
            # Update execution status to running
            await db.executions.update_one(
                {"_id": execution_id},
                {"$set": {"status": "running", "updated_at": datetime.utcnow()}}
            )
            
            # Execute workflow nodes
            execution_result = await self._execute_workflow_nodes(
                workflow["nodes"], workflow["edges"], input_data, execution_id
            )
            
            # Update execution with results
            await db.executions.update_one(
                {"_id": execution_id},
                {
                    "$set": {
                        "status": "completed",
                        "output_data": execution_result,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return {
                "execution_id": str(execution_id),
                "status": "completed",
                "output": execution_result
            }
            
        except Exception as e:
            logger.error(f"Workflow execution failed: {e}")
            
            # Update execution with error
            await db.executions.update_one(
                {"_id": execution_id},
                {
                    "$set": {
                        "status": "failed",
                        "error_message": str(e),
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            raise

    async def execute_workflow_stream(
        self, workflow_id: str, user_id: str, input_data: Dict[str, Any]
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Execute workflow with streaming updates"""
        db = get_database()
        
        workflow = await db.workflows.find_one({
            "_id": ObjectId(workflow_id),
            "user_id": ObjectId(user_id)
        })
        
        if not workflow:
            raise ValueError("Workflow not found")
        
        yield {"type": "status", "message": "Starting workflow execution"}
        
        # Execute nodes and yield progress
        async for update in self._execute_workflow_nodes_stream(
            workflow["nodes"], workflow["edges"], input_data
        ):
            yield update

    async def _execute_workflow_nodes(
        self, nodes: list, edges: list, input_data: Dict[str, Any], execution_id: ObjectId
    ) -> Dict[str, Any]:
        """Execute workflow nodes in order"""
        db = get_database()
        
        # Build execution graph
        node_map = {node["id"]: node for node in nodes}
        execution_order = self._get_execution_order(nodes, edges)
        
        current_data = input_data
        results = {}
        
        for node_id in execution_order:
            node = node_map[node_id]
            
            # Create execution step
            step = ExecutionStep(
                node_id=node_id,
                node_type=node["data"]["type"],
                status="running",
                input_data=current_data,
                started_at=datetime.utcnow()
            )
            
            try:
                # Execute node
                node_result = await self._execute_single_node(node, current_data)
                
                step.status = "completed"
                step.output_data = node_result
                step.completed_at = datetime.utcnow()
                
                results[node_id] = node_result
                current_data = {**current_data, **node_result}
                
            except Exception as e:
                step.status = "failed"
                step.error_message = str(e)
                step.completed_at = datetime.utcnow()
                
                logger.error(f"Node {node_id} execution failed: {e}")
                raise
            
            # Update execution with step
            await db.executions.update_one(
                {"_id": execution_id},
                {"$push": {"steps": step.dict()}}
            )
        
        return results

    async def _execute_workflow_nodes_stream(
        self, nodes: list, edges: list, input_data: Dict[str, Any]
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Execute workflow nodes with streaming updates"""
        node_map = {node["id"]: node for node in nodes}
        execution_order = self._get_execution_order(nodes, edges)
        
        current_data = input_data
        
        for i, node_id in enumerate(execution_order):
            node = node_map[node_id]
            
            yield {
                "type": "node_start",
                "node_id": node_id,
                "node_type": node["data"]["type"],
                "progress": i / len(execution_order)
            }
            
            try:
                node_result = await self._execute_single_node(node, current_data)
                current_data = {**current_data, **node_result}
                
                yield {
                    "type": "node_complete",
                    "node_id": node_id,
                    "result": node_result,
                    "progress": (i + 1) / len(execution_order)
                }
                
            except Exception as e:
                yield {
                    "type": "node_error",
                    "node_id": node_id,
                    "error": str(e)
                }
                raise

    async def _execute_single_node(self, node: Dict[str, Any], input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single node"""
        node_type = node["data"]["type"]
        node_config = node["data"].get("config", {})
        
        if node_type == "trigger":
            return {"triggered": True, "timestamp": datetime.utcnow().isoformat()}
        
        elif node_type == "chatbot":
            return await self._execute_chatbot_node(node_config, input_data)
        
        elif node_type == "database":
            return await self._execute_database_node(node_config, input_data)
        
        elif node_type == "email":
            return await self._execute_email_node(node_config, input_data)
        
        elif node_type == "webhook":
            return await self._execute_webhook_node(node_config, input_data)
        
        elif node_type == "ai":
            return await self._execute_ai_node(node_config, input_data)
        
        elif node_type == "code":
            return await self._execute_code_node(node_config, input_data)
        
        elif node_type == "transform":
            return await self._execute_transform_node(node_config, input_data)
        
        else:
            raise ValueError(f"Unknown node type: {node_type}")

    async def _execute_chatbot_node(self, config: Dict[str, Any], input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute chatbot node using LangChain"""
        try:
            response = await self.langchain_service.chat_completion(
                api_key=config.get("openai_api_key"),
                model=config.get("model", "gpt-3.5-turbo"),
                messages=[
                    {"role": "system", "content": config.get("system_prompt", "You are a helpful assistant.")},
                    {"role": "user", "content": input_data.get("message", "Hello")}
                ],
                temperature=config.get("temperature", 0.7)
            )
            
            return {
                "response": response,
                "chatbot_enabled": True
            }
        except Exception as e:
            logger.error(f"Chatbot node execution failed: {e}")
            return {"error": str(e), "chatbot_enabled": False}

    async def _execute_database_node(self, config: Dict[str, Any], input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute database node"""
        # Implementation for database operations
        return {"database_result": "Database operation completed"}

    async def _execute_email_node(self, config: Dict[str, Any], input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute email node"""
        # Implementation for email sending
        return {"email_sent": True, "recipient": config.get("to")}

    async def _execute_webhook_node(self, config: Dict[str, Any], input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute webhook node"""
        # Implementation for HTTP requests
        return {"webhook_response": "Request completed"}

    async def _execute_ai_node(self, config: Dict[str, Any], input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute AI processing node"""
        return await self.langchain_service.process_with_ai(config, input_data)

    async def _execute_code_node(self, config: Dict[str, Any], input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute custom code node"""
        # Implementation for custom Python code execution
        return {"code_result": "Custom code executed"}

    async def _execute_transform_node(self, config: Dict[str, Any], input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute data transformation node"""
        # Implementation for data transformation
        return {"transformed_data": input_data}

    def _get_execution_order(self, nodes: list, edges: list) -> list:
        """Get the execution order of nodes based on edges"""
        # Simple topological sort
        in_degree = {node["id"]: 0 for node in nodes}
        graph = {node["id"]: [] for node in nodes}
        
        for edge in edges:
            graph[edge["source"]].append(edge["target"])
            in_degree[edge["target"]] += 1
        
        queue = [node_id for node_id, degree in in_degree.items() if degree == 0]
        result = []
        
        while queue:
            node_id = queue.pop(0)
            result.append(node_id)
            
            for neighbor in graph[node_id]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)
        
        return result