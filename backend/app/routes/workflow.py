from fastapi import APIRouter, HTTPException
from app.models import Workflow
from app.db import db
from bson import ObjectId

router = APIRouter()

@router.post("/workflows")
async def create_workflow(workflow: Workflow):
    result = await db.workflows.insert_one(workflow.dict(by_alias=True))
    return {"id": str(result.inserted_id)}

@router.get("/workflows")
async def list_workflows():
    workflows = await db.workflows.find().to_list(length=100)
    for wf in workflows:
        wf["id"] = str(wf["_id"])
    return workflows

@router.get("/workflows/{workflow_id}")
async def get_workflow(workflow_id: str):
    workflow = await db.workflows.find_one({"_id": ObjectId(workflow_id)})
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    workflow["id"] = str(workflow["_id"])
    return workflow

@router.delete("/workflows/{workflow_id}")
async def delete_workflow(workflow_id: str):
    result = await db.workflows.delete_one({"_id": ObjectId(workflow_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"message": "Workflow deleted"}
