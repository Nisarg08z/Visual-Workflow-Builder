from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from app.models.workflow import WorkflowCreate, WorkflowUpdate, Workflow, WorkflowInDB
from app.models.user import UserInDB
from app.routers.auth import get_current_user
from app.database import get_database
from bson import ObjectId
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=Workflow)
async def create_workflow(
    workflow_data: WorkflowCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    db = get_database()
    
    workflow_dict = workflow_data.dict()
    workflow_dict["user_id"] = current_user.id
    
    result = await db.workflows.insert_one(workflow_dict)
    
    created_workflow = await db.workflows.find_one({"_id": result.inserted_id})
    
    return Workflow(
        id=str(created_workflow["_id"]),
        user_id=str(created_workflow["user_id"]),
        **{k: v for k, v in created_workflow.items() if k not in ["_id", "user_id"]}
    )

@router.get("/", response_model=List[Workflow])
async def get_workflows(current_user: UserInDB = Depends(get_current_user)):
    db = get_database()
    
    workflows = await db.workflows.find({"user_id": current_user.id}).to_list(100)
    
    return [
        Workflow(
            id=str(workflow["_id"]),
            user_id=str(workflow["user_id"]),
            **{k: v for k, v in workflow.items() if k not in ["_id", "user_id"]}
        )
        for workflow in workflows
    ]

@router.get("/{workflow_id}", response_model=Workflow)
async def get_workflow(
    workflow_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(workflow_id):
        raise HTTPException(status_code=400, detail="Invalid workflow ID")
    
    workflow = await db.workflows.find_one({
        "_id": ObjectId(workflow_id),
        "user_id": current_user.id
    })
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    return Workflow(
        id=str(workflow["_id"]),
        user_id=str(workflow["user_id"]),
        **{k: v for k, v in workflow.items() if k not in ["_id", "user_id"]}
    )

@router.put("/{workflow_id}", response_model=Workflow)
async def update_workflow(
    workflow_id: str,
    workflow_data: WorkflowUpdate,
    current_user: UserInDB = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(workflow_id):
        raise HTTPException(status_code=400, detail="Invalid workflow ID")
    
    update_data = {k: v for k, v in workflow_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.workflows.update_one(
        {"_id": ObjectId(workflow_id), "user_id": current_user.id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    updated_workflow = await db.workflows.find_one({"_id": ObjectId(workflow_id)})
    
    return Workflow(
        id=str(updated_workflow["_id"]),
        user_id=str(updated_workflow["user_id"]),
        **{k: v for k, v in updated_workflow.items() if k not in ["_id", "user_id"]}
    )

@router.delete("/{workflow_id}")
async def delete_workflow(
    workflow_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(workflow_id):
        raise HTTPException(status_code=400, detail="Invalid workflow ID")
    
    result = await db.workflows.delete_one({
        "_id": ObjectId(workflow_id),
        "user_id": current_user.id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    return {"message": "Workflow deleted successfully"}