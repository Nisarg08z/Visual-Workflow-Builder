import asyncio
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from enum import Enum

# LangGraph and LangChain imports
from langgraph import StateGraph, END
from langchain.agents import create_openai_functions_agent, AgentExecutor
from langchain.tools import Tool
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import BaseMessage, HumanMessage, AIMessage
from langchain.memory import ConversationBufferMemory
from langchain_openai import ChatOpenAI
from langchain_community.tools import DuckDuckGoSearchRun
from langchain.tools import BaseTool
from pydantic import BaseModel, Field

# MongoDB for persistence
from pymongo import MongoClient
import os

# Configuration
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

client = MongoClient(MONGODB_URI)
db = client.flowmaster

class NodeType(Enum):
    TRIGGER = "trigger"
    AGENT = "agent"
    CONDITIONAL = "conditional"
    ACTION = "action"
    HUMAN = "human"

class ExecutionStatus(Enum):
    WAITING = "waiting"
    READY = "ready"
    EXECUTING = "executing"
    COMPLETED = "completed"
    ERROR = "error"
    PENDING_HUMAN = "pending_human"

@dataclass
class WorkflowState:
    """LangGraph state for workflow execution"""
    workflow_id: str
    current_node: str
    execution_id: str
    data: Dict[str, Any]
    messages: List[BaseMessage]
    status: ExecutionStatus
    error: Optional[str] = None
    human_input: Optional[str] = None
    agent_memory: Dict[str, Any] = None

class LangGraphWorkflowEngine:
    def __init__(self):
        self.db = db
        self.llm = ChatOpenAI(temperature=0, model="gpt-4") if OPENAI_API_KEY else None
        self.search_tool = DuckDuckGoSearchRun()
        
    def create_workflow_graph(self, workflow_definition: Dict) -> StateGraph:
        """Create a LangGraph workflow from definition"""
        
        # Initialize the state graph
        workflow = StateGraph(WorkflowState)
        
        # Add nodes based on workflow definition
        for node in workflow_definition["nodes"]:
            node_id = node["id"]
            node_type = NodeType(node["data"]["type"])
            
            if node_type == NodeType.TRIGGER:
                workflow.add_node(node_id, self.create_trigger_node(node))
            elif node_type == NodeType.AGENT:
                workflow.add_node(node_id, self.create_agent_node(node))
            elif node_type == NodeType.CONDITIONAL:
                workflow.add_node(node_id, self.create_conditional_node(node))
            elif node_type == NodeType.ACTION:
                workflow.add_node(node_id, self.create_action_node(node))
            elif node_type == NodeType.HUMAN:
                workflow.add_node(node_id, self.create_human_node(node))
        
        # Add edges
        for edge in workflow_definition["edges"]:
            source = edge["source"]
            target = edge["target"]
            
            # Check if it's a conditional edge
            if edge.get("label"):
                # This is a conditional edge - we'll handle this in the conditional node
                pass
            else:
                workflow.add_edge(source, target)
        
        # Set entry point (first trigger node)
        trigger_nodes = [n for n in workflow_definition["nodes"] if n["data"]["type"] == "trigger"]
        if trigger_nodes:
            workflow.set_entry_point(trigger_nodes[0]["id"])
        
        return workflow.compile()
    
    def create_trigger_node(self, node_def: Dict):
        """Create a trigger node"""
        async def trigger_node(state: WorkflowState) -> WorkflowState:
            print(f"Executing trigger: {node_def['data']['label']}")
            
            # Simulate trigger logic
            trigger_data = await self.execute_trigger(node_def)
            
            state.data.update(trigger_data)
            state.status = ExecutionStatus.COMPLETED
            state.messages.append(HumanMessage(content=f"Trigger {node_def['data']['label']} activated"))
            
            return state
        
        return trigger_node
    
    def create_agent_node(self, node_def: Dict):
        """Create an AI agent node using LangChain"""
        async def agent_node(state: WorkflowState) -> WorkflowState:
            print(f"Executing agent: {node_def['data']['label']}")
            
            if not self.llm:
                state.data["agent_result"] = "Agent executed (OpenAI not configured)"
                state.status = ExecutionStatus.COMPLETED
                return state
            
            # Create agent with tools
            tools = [
                Tool(
                    name="search",
                    description="Search for information on the internet",
                    func=self.search_tool.run
                ),
                Tool(
                    name="process_data",
                    description="Process and analyze data",
                    func=self.process_data_tool
                )
            ]
            
            # Create agent prompt
            prompt = ChatPromptTemplate.from_messages([
                ("system", f"You are an AI agent in a workflow: {node_def['data']['description']}. "
                          f"Process the current workflow data and provide insights or take actions."),
                MessagesPlaceholder(variable_name="chat_history"),
                ("human", "{input}"),
                MessagesPlaceholder(variable_name="agent_scratchpad")
            ])
            
            # Create and execute agent
            agent = create_openai_functions_agent(self.llm, tools, prompt)
            agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
            
            # Prepare input for agent
            input_data = {
                "input": f"Process this workflow data: {json.dumps(state.data, indent=2)}",
                "chat_history": state.messages
            }
            
            try:
                result = await agent_executor.ainvoke(input_data)
                state.data["agent_result"] = result["output"]
                state.messages.append(AIMessage(content=result["output"]))
                state.status = ExecutionStatus.COMPLETED
            except Exception as e:
                state.error = str(e)
                state.status = ExecutionStatus.ERROR
            
            return state
        
        return agent_node
    
    def create_conditional_node(self, node_def: Dict):
        """Create a conditional routing node"""
        async def conditional_node(state: WorkflowState) -> WorkflowState:
            print(f"Executing conditional: {node_def['data']['label']}")
            
            # Use AI to make routing decision if LLM is available
            if self.llm and state.data.get("agent_result"):
                decision_prompt = f"""
                Based on the following workflow data and agent result, make a routing decision:
                
                Data: {json.dumps(state.data, indent=2)}
                Agent Result: {state.data.get('agent_result')}
                
                Respond with one of: 'approve', 'reject', 'review', 'escalate'
                """
                
                try:
                    response = await self.llm.ainvoke([HumanMessage(content=decision_prompt)])
                    decision = response.content.lower().strip()
                    
                    # Store decision for routing
                    state.data["routing_decision"] = decision
                    state.messages.append(AIMessage(content=f"Routing decision: {decision}"))
                    
                except Exception as e:
                    state.data["routing_decision"] = "review"  # Default fallback
                    state.error = f"Decision error: {str(e)}"
            else:
                # Simple rule-based decision
                state.data["routing_decision"] = "approve"
            
            state.status = ExecutionStatus.COMPLETED
            return state
        
        return conditional_node
    
    def create_action_node(self, node_def: Dict):
        """Create an action node"""
        async def action_node(state: WorkflowState) -> WorkflowState:
            print(f"Executing action: {node_def['data']['label']}")
            
            # Execute specific action based on node type
            action_result = await self.execute_action(node_def, state.data)
            
            state.data.update(action_result)
            state.status = ExecutionStatus.COMPLETED
            state.messages.append(HumanMessage(content=f"Action {node_def['data']['label']} completed"))
            
            return state
        
        return action_node
    
    def create_human_node(self, node_def: Dict):
        """Create a human-in-the-loop node"""
        async def human_node(state: WorkflowState) -> WorkflowState:
            print(f"Executing human node: {node_def['data']['label']}")
            
            # Store human review request in database
            review_request = {
                "workflow_id": state.workflow_id,
                "execution_id": state.execution_id,
                "node_id": node_def["id"],
                "data": state.data,
                "status": "pending_review",
                "created_at": datetime.now()
            }
            
            self.db.human_reviews.insert_one(review_request)
            
            state.status = ExecutionStatus.PENDING_HUMAN
            state.messages.append(HumanMessage(content=f"Human review requested for {node_def['data']['label']}"))
            
            return state
        
        return human_node
    
    async def execute_trigger(self, node_def: Dict) -> Dict[str, Any]:
        """Execute trigger logic"""
        trigger_type = node_def["data"]["label"]
        
        if "Email" in trigger_type:
            return {
                "trigger_type": "email",
                "emails_found": 3,
                "latest_email": {
                    "subject": "Important notification",
                    "sender": "user@example.com",
                    "timestamp": datetime.now().isoformat()
                }
            }
        elif "Webhook" in trigger_type:
            return {
                "trigger_type": "webhook",
                "payload": {"status": "received", "data": "sample_data"}
            }
        elif "Schedule" in trigger_type:
            return {
                "trigger_type": "schedule",
                "scheduled_time": datetime.now().isoformat()
            }
        
        return {"trigger_type": "generic"}
    
    async def execute_action(self, node_def: Dict, workflow_data: Dict) -> Dict[str, Any]:
        """Execute action logic"""
        action_type = node_def["data"]["label"]
        
        if "Database" in action_type:
            return {
                "action_type": "database",
                "records_affected": 5,
                "operation": "INSERT",
                "timestamp": datetime.now().isoformat()
            }
        elif "Message" in action_type or "Slack" in action_type:
            return {
                "action_type": "message",
                "message_sent": True,
                "recipient": "team@company.com",
                "timestamp": datetime.now().isoformat()
            }
        elif "Document" in action_type:
            return {
                "action_type": "document",
                "document_generated": True,
                "document_id": f"doc_{datetime.now().timestamp()}",
                "timestamp": datetime.now().isoformat()
            }
        
        return {"action_type": "generic", "completed": True}
    
    def process_data_tool(self, data: str) -> str:
        """Tool for processing data"""
        return f"Processed data: {len(data)} characters analyzed"
    
    async def execute_workflow(self, workflow_id: str, initial_data: Dict = None) -> str:
        """Execute a workflow using LangGraph"""
        
        # Get workflow definition from database
        workflow_def = self.db.workflows.find_one({"_id": workflow_id})
        if not workflow_def:
            raise Exception(f"Workflow {workflow_id} not found")
        
        # Create execution record
        execution_id = f"exec_{datetime.now().timestamp()}"
        execution = {
            "_id": execution_id,
            "workflow_id": workflow_id,
            "status": "running",
            "start_time": datetime.now(),
            "results": []
        }
        self.db.executions.insert_one(execution)
        
        try:
            # Create workflow graph
            workflow_graph = self.create_workflow_graph(workflow_def)
            
            # Initialize state
            initial_state = WorkflowState(
                workflow_id=workflow_id,
                current_node="",
                execution_id=execution_id,
                data=initial_data or {},
                messages=[],
                status=ExecutionStatus.READY,
                agent_memory={}
            )
            
            # Execute workflow
            final_state = await workflow_graph.ainvoke(initial_state)
            
            # Update execution record
            self.db.executions.update_one(
                {"_id": execution_id},
                {
                    "$set": {
                        "status": "completed",
                        "end_time": datetime.now(),
                        "final_state": {
                            "data": final_state.data,
                            "status": final_state.status.value,
                            "messages": [msg.content for msg in final_state.messages]
                        }
                    }
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
                        "end_time": datetime.now(),
                        "error": str(e)
                    }
                }
            )
            raise e

# Example usage
async def main():
    """Example workflow execution"""
    engine = LangGraphWorkflowEngine()
    
    # Sample workflow definition
    workflow_def = {
        "nodes": [
            {
                "id": "1",
                "data": {
                    "label": "Email Trigger",
                    "type": "trigger",
                    "description": "Trigger on new email"
                }
            },
            {
                "id": "2", 
                "data": {
                    "label": "AI Processor",
                    "type": "agent",
                    "description": "Process email with AI"
                }
            },
            {
                "id": "3",
                "data": {
                    "label": "Decision Router",
                    "type": "conditional", 
                    "description": "Route based on AI analysis"
                }
            }
        ],
        "edges": [
            {"source": "1", "target": "2"},
            {"source": "2", "target": "3"}
        ]
    }
    
    # Save workflow to database
    workflow_id = "sample_workflow"
    db.workflows.replace_one(
        {"_id": workflow_id},
        {**workflow_def, "_id": workflow_id},
        upsert=True
    )
    
    # Execute workflow
    try:
        execution_id = await engine.execute_workflow(workflow_id)
        print(f"Workflow executed successfully. Execution ID: {execution_id}")
    except Exception as e:
        print(f"Workflow execution failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
