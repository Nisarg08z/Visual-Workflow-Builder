from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from bson import ObjectId

class Workflow(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    name: str
    description: Optional[str] = ""
    nodes: List[dict] = []
    edges: List[dict] = []

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True

class User(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    email: EmailStr
    password: str
    full_name: Optional[str] = ""

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
