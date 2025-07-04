from typing import Dict, Any, List
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from typing_extensions import Annotated, TypedDict
import logging

logger = logging.getLogger(__name__)

class ChatState(TypedDict):
    messages: Annotated[list, add_messages]

class LangChainService:
    def __init__(self):
        self.chat_models = {}

    def get_chat_model(self, api_key: str, model: str = "gpt-3.5-turbo") -> ChatOpenAI:
        """Get or create a chat model instance"""
        key = f"{api_key}_{model}"
        if key not in self.chat_models:
            self.chat_models[key] = ChatOpenAI(
                openai_api_key=api_key,
                model=model
            )
        return self.chat_models[key]

    async def chat_completion(
        self, 
        api_key: str, 
        model: str, 
        messages: List[Dict[str, str]], 
        temperature: float = 0.7
    ) -> str:
        """Generate chat completion using OpenAI"""
        try:
            chat_model = self.get_chat_model(api_key, model)
            chat_model.temperature = temperature
            
            # Convert messages to LangChain format
            langchain_messages = []
            for msg in messages:
                if msg["role"] == "system":
                    langchain_messages.append(SystemMessage(content=msg["content"]))
                elif msg["role"] == "user":
                    langchain_messages.append(HumanMessage(content=msg["content"]))
            
            response = await chat_model.ainvoke(langchain_messages)
            return response.content
            
        except Exception as e:
            logger.error(f"Chat completion failed: {e}")
            raise

    async def process_with_ai(self, config: Dict[str, Any], input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process data using AI with LangGraph"""
        try:
            api_key = config.get("api_key")
            model = config.get("model", "gpt-3.5-turbo")
            prompt = config.get("prompt", "Process this data: {input}")
            
            # Create a simple LangGraph workflow
            def chatbot(state: ChatState):
                chat_model = self.get_chat_model(api_key, model)
                return {"messages": [chat_model.invoke(state["messages"])]}
            
            # Build the graph
            workflow = StateGraph(ChatState)
            workflow.add_node("chatbot", chatbot)
            workflow.set_entry_point("chatbot")
            workflow.add_edge("chatbot", END)
            
            app = workflow.compile()
            
            # Format prompt with input data
            formatted_prompt = prompt.format(input=str(input_data))
            
            # Run the workflow
            result = await app.ainvoke({
                "messages": [HumanMessage(content=formatted_prompt)]
            })
            
            return {
                "ai_response": result["messages"][-1].content,
                "processed": True
            }
            
        except Exception as e:
            logger.error(f"AI processing failed: {e}")
            return {"error": str(e), "processed": False}

    async def create_workflow_graph(self, nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> StateGraph:
        """Create a LangGraph workflow from nodes and edges"""
        workflow = StateGraph(ChatState)
        
        # Add nodes to the graph
        for node in nodes:
            node_type = node["data"]["type"]
            if node_type == "chatbot":
                workflow.add_node(node["id"], self._create_chatbot_node(node["data"]["config"]))
        
        # Add edges
        for edge in edges:
            workflow.add_edge(edge["source"], edge["target"])
        
        # Set entry point (trigger node)
        trigger_nodes = [node for node in nodes if node["data"]["type"] == "trigger"]
        if trigger_nodes:
            workflow.set_entry_point(trigger_nodes[0]["id"])
        
        return workflow

    def _create_chatbot_node(self, config: Dict[str, Any]):
        """Create a chatbot node function"""
        def chatbot_node(state: ChatState):
            chat_model = self.get_chat_model(
                config.get("openai_api_key"),
                config.get("model", "gpt-3.5-turbo")
            )
            chat_model.temperature = config.get("temperature", 0.7)
            
            # Add system message if provided
            messages = state["messages"].copy()
            if config.get("system_prompt"):
                messages.insert(0, SystemMessage(content=config["system_prompt"]))
            
            response = chat_model.invoke(messages)
            return {"messages": [response]}
        
        return chatbot_node