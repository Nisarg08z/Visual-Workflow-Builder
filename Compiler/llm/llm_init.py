import os
from langchain_openai import ChatOpenAI
from tools.tools import tools

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY is not set.")

llm = ChatOpenAI(model="gpt-4o", temperature=0.7, api_key=OPENAI_API_KEY)
llm_with_tools = llm.bind_tools(tools)
