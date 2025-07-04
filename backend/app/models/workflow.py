from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from bson import ObjectId
from app.models.user import PyObjectId

class NodeData(BaseModel):
    label: str
    type: str
    description: Optional[str] = None
    config: Dict[str, Any] = {}

class WorkflowNode(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: NodeData

class WorkflowEdge(BaseModel):
    id: str
    source: str
    target: str
    type: Optional[str] = "default"

class WorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    nodes: List[WorkflowNode] = []
    edges: List[WorkflowEdge] = []
    is_public: bool = False
    status: str = "draft"  # draft, published, archived

class WorkflowCreate(WorkflowBase):
    pass

class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    nodes: Optional[List[WorkflowNode]] = None
    edges: Optional[List[WorkflowEdge]] = None
    is_public: Optional[bool] = None
    status: Optional[str] = None

class WorkflowInDB(WorkflowBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Workflow(WorkflowBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime