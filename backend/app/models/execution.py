from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
from datetime import datetime
from bson import ObjectId
from app.models.user import PyObjectId

class ExecutionStep(BaseModel):
    node_id: str
    node_type: str
    status: str  # pending, running, completed, failed
    input_data: Dict[str, Any] = {}
    output_data: Dict[str, Any] = {}
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class ExecutionBase(BaseModel):
    workflow_id: str
    status: str = "pending"  # pending, running, completed, failed
    steps: List[ExecutionStep] = []
    input_data: Dict[str, Any] = {}
    output_data: Dict[str, Any] = {}
    error_message: Optional[str] = None

class ExecutionCreate(ExecutionBase):
    pass

class ExecutionInDB(ExecutionBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Execution(ExecutionBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime