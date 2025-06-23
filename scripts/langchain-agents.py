import asyncio
import os
from typing import Dict, List, Any
from datetime import datetime

# LangChain imports
from langchain.agents import create_openai_functions_agent, AgentExecutor
from langchain.tools import Tool, BaseTool
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import BaseMessage, HumanMessage, AIMessage
from langchain.memory import ConversationBufferMemory
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_community.document_loaders import WebBaseLoader
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from pydantic import BaseModel, Field

# MongoDB
from pymongo import MongoClient

# Configuration
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

client = MongoClient(MONGODB_URI)
db = client.flowmaster

class EmailProcessorTool(BaseTool):
    """Custom tool for processing emails"""
    name = "email_processor"
    description = "Process and analyze email content for sentiment, urgency, and key information"
    
    def _run(self, email_content: str) -> str:
        # Simulate email processing
        analysis = {
            "sentiment": "neutral",
            "urgency": "medium",
            "key_topics": ["workflow", "automation", "AI"],
            "action_required": True
        }
        return f"Email analysis: {analysis}"
    
    async def _arun(self, email_content: str) -> str:
        return self._run(email_content)

class DatabaseTool(BaseTool):
    """Custom tool for database operations"""
    name = "database_operations"
    description = "Perform database queries and updates"
    
    def _run(self, operation: str, data: str = None) -> str:
        # Simulate database operations
        if operation == "query":
            return "Database query executed: Found 5 matching records"
        elif operation == "insert":
            return f"Database insert executed: Added record with data {data}"
        elif operation == "update":
            return f"Database update executed: Updated records with {data}"
        return "Database operation completed"
    
    async def _arun(self, operation: str, data: str = None) -> str:
        return self._run(operation, data)

class SlackNotificationTool(BaseTool):
    """Custom tool for Slack notifications"""
    name = "slack_notification"
    description = "Send notifications to Slack channels"
    
    def _run(self, message: str, channel: str = "#general") -> str:
        # Simulate Slack notification
        return f"Slack notification sent to {channel}: {message}"
    
    async def _arun(self, message: str, channel: str = "#general") -> str:
        return self._run(message, channel)

class DocumentGeneratorTool(BaseTool):
    """Custom tool for document generation"""
    name = "document_generator"
    description = "Generate documents like PDFs, reports, or summaries"
    
    def _run(self, doc_type: str, content: str) -> str:
        # Simulate document generation
        doc_id = f"doc_{datetime.now().timestamp()}"
        return f"Generated {doc_type} document with ID {doc_id}: {content[:100]}..."
    
    async def _arun(self, doc_type: str, content: str) -> str:
        return self._run(doc_type, content)

class LangChainAgentFactory:
    """Factory for creating specialized LangChain agents"""
    
    def __init__(self):
        self.llm = ChatOpenAI(temperature=0, model="gpt-4") if OPENAI_API_KEY else None
        self.embeddings = OpenAIEmbeddings() if OPENAI_API_KEY else None
        self.search_tool = DuckDuckGoSearchRun()
        
        # Custom tools
        self.email_tool = EmailProcessorTool()
        self.database_tool = DatabaseTool()
        self.slack_tool = SlackNotificationTool()
        self.document_tool = DocumentGeneratorTool()
    
    def create_email_processor_agent(self) -> AgentExecutor:
        """Create an agent specialized in email processing"""
        if not self.llm:
            return None
        
        tools = [
            self.email_tool,
            self.search_tool,
            Tool(
                name="extract_contacts",
                description="Extract contact information from email",
                func=lambda email: "Extracted contacts: john@example.com, jane@example.com"
            )
        ]
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert email processing agent. Your role is to:
            1. Analyze email content for sentiment, urgency, and key information
            2. Extract important data like contacts, dates, and action items
            3. Categorize emails and suggest appropriate responses
            4. Identify spam or suspicious content
            
            Always provide detailed analysis and actionable insights."""),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad")
        ])
        
        agent = create_openai_functions_agent(self.llm, tools, prompt)
        return AgentExecutor(agent=agent, tools=tools, verbose=True)
    
    def create_data_analyst_agent(self) -> AgentExecutor:
        """Create an agent specialized in data analysis"""
        if not self.llm:
            return None
        
        tools = [
            self.database_tool,
            Tool(
                name="analyze_trends",
                description="Analyze data trends and patterns",
                func=lambda data: f"Trend analysis: Identified 3 key patterns in {data}"
            ),
            Tool(
                name="generate_insights",
                description="Generate business insights from data",
                func=lambda data: f"Business insights: {data} shows 15% improvement opportunity"
            )
        ]
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a data analysis expert. Your responsibilities include:
            1. Analyzing datasets for trends, patterns, and anomalies
            2. Generating actionable business insights
            3. Creating data visualizations and reports
            4. Performing statistical analysis and forecasting
            
            Provide clear, data-driven recommendations."""),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad")
        ])
        
        agent = create_openai_functions_agent(self.llm, tools, prompt)
        return AgentExecutor(agent=agent, tools=tools, verbose=True)
    
    def create_communication_agent(self) -> AgentExecutor:
        """Create an agent specialized in communication and notifications"""
        if not self.llm:
            return None
        
        tools = [
            self.slack_tool,
            Tool(
                name="send_email",
                description="Send email notifications",
                func=lambda message, recipient: f"Email sent to {recipient}: {message}"
            ),
            Tool(
                name="create_announcement",
                description="Create team announcements",
                func=lambda message: f"Announcement created: {message}"
            )
        ]
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a communication specialist agent. Your role is to:
            1. Craft clear, professional messages for various channels
            2. Send notifications to appropriate team members
            3. Manage communication workflows and escalations
            4. Create announcements and updates
            
            Always ensure messages are clear, timely, and reach the right audience."""),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad")
        ])
        
        agent = create_openai_functions_agent(self.llm, tools, prompt)
        return AgentExecutor(agent=agent, tools=tools, verbose=True)
    
    def create_document_agent(self) -> AgentExecutor:
        """Create an agent specialized in document processing and generation"""
        if not self.llm:
            return None
        
        tools = [
            self.document_tool,
            Tool(
                name="summarize_document",
                description="Create summaries of long documents",
                func=lambda doc: f"Document summary: Key points extracted from {len(doc)} characters"
            ),
            Tool(
                name="extract_data",
                description="Extract structured data from documents",
                func=lambda doc: "Extracted data: Names, dates, amounts, and key metrics"
            )
        ]
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a document processing expert. Your capabilities include:
            1. Generating various types of documents (reports, summaries, PDFs)
            2. Extracting and structuring data from unstructured documents
            3. Creating document templates and formats
            4. Performing document analysis and classification
            
            Focus on accuracy, clarity, and proper formatting."""),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad")
        ])
        
        agent = create_openai_functions_agent(self.llm, tools, prompt)
        return AgentExecutor(agent=agent, tools=tools, verbose=True)
    
    def create_research_agent(self) -> AgentExecutor:
        """Create an agent specialized in research and information gathering"""
        if not self.llm:
            return None
        
        tools = [
            self.search_tool,
            Tool(
                name="fact_check",
                description="Verify facts and information",
                func=lambda claim: f"Fact check result: {claim} - Verified from multiple sources"
            ),
            Tool(
                name="competitive_analysis",
                description="Perform competitive analysis",
                func=lambda topic: f"Competitive analysis for {topic}: Found 5 key competitors with insights"
            )
        ]
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a research specialist agent. Your expertise includes:
            1. Conducting thorough internet research on various topics
            2. Fact-checking information and verifying sources
            3. Performing competitive analysis and market research
            4. Synthesizing information from multiple sources
            
            Always provide well-researched, accurate, and comprehensive information."""),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad")
        ])
        
        agent = create_openai_functions_agent(self.llm, tools, prompt)
        return AgentExecutor(agent=agent, tools=tools, verbose=True)

class MultiAgentOrchestrator:
    """Orchestrate multiple agents working together"""
    
    def __init__(self):
        self.factory = LangChainAgentFactory()
        self.agents = {
            "email_processor": self.factory.create_email_processor_agent(),
            "data_analyst": self.factory.create_data_analyst_agent(),
            "communication": self.factory.create_communication_agent(),
            "document": self.factory.create_document_agent(),
            "research": self.factory.create_research_agent()
        }
    
    async def execute_multi_agent_workflow(self, workflow_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a workflow involving multiple agents"""
        results = {}
        
        # Step 1: Email processing
        if "email_content" in workflow_data and self.agents["email_processor"]:
            email_result = await self.agents["email_processor"].ainvoke({
                "input": f"Process this email: {workflow_data['email_content']}"
            })
            results["email_analysis"] = email_result["output"]
        
        # Step 2: Research if needed
        if "research_topic" in workflow_data and self.agents["research"]:
            research_result = await self.agents["research"].ainvoke({
                "input": f"Research this topic: {workflow_data['research_topic']}"
            })
            results["research_findings"] = research_result["output"]
        
        # Step 3: Data analysis
        if "data_to_analyze" in workflow_data and self.agents["data_analyst"]:
            analysis_result = await self.agents["data_analyst"].ainvoke({
                "input": f"Analyze this data: {workflow_data['data_to_analyze']}"
            })
            results["data_insights"] = analysis_result["output"]
        
        # Step 4: Document generation
        if self.agents["document"]:
            doc_result = await self.agents["document"].ainvoke({
                "input": f"Generate a summary document based on: {results}"
            })
            results["generated_document"] = doc_result["output"]
        
        # Step 5: Communication
        if self.agents["communication"]:
            comm_result = await self.agents["communication"].ainvoke({
                "input": f"Send notifications about workflow completion: {results}"
            })
            results["notifications_sent"] = comm_result["output"]
        
        return results

# Example usage and testing
async def test_agents():
    """Test the LangChain agents"""
    orchestrator = MultiAgentOrchestrator()
    
    # Test workflow data
    workflow_data = {
        "email_content": "Subject: Urgent: System Performance Issues\n\nHi team, we're experiencing performance issues with our main application. Please investigate ASAP.",
        "research_topic": "application performance monitoring best practices",
        "data_to_analyze": "Response times: [120ms, 340ms, 890ms, 1200ms, 450ms]"
    }
    
    try:
        results = await orchestrator.execute_multi_agent_workflow(workflow_data)
        print("Multi-agent workflow results:")
        for key, value in results.items():
            print(f"{key}: {value}")
    except Exception as e:
        print(f"Agent execution failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_agents())
