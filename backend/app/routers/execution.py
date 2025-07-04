from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from typing import Dict, Any
from app.models.user import UserInDB
from app.models.execution import ExecutionCreate, Execution
from app.routers.auth import get_current_user
from app.services.execution_service import ExecutionService
from app.database import get_database
import logging
import json

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/execute/{workflow_id}")
async def execute_workflow(
    workflow_id: str,
    input_data: Dict[str, Any] = {},
    current_user: UserInDB = Depends(get_current_user)
):
    """Execute a workflow"""
    try:
        execution_service = ExecutionService()
        result = await execution_service.execute_workflow(
            workflow_id, str(current_user.id), input_data
        )
        return result
    except Exception as e:
        logger.error(f"Failed to execute workflow: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/history/{workflow_id}")
async def get_execution_history(
    workflow_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """Get execution history for a workflow"""
    db = get_database()
    
    executions = await db.executions.find({
        "workflow_id": workflow_id,
        "user_id": current_user.id
    }).sort("created_at", -1).limit(50).to_list(50)
    
    return [
        Execution(
            id=str(execution["_id"]),
            user_id=str(execution["user_id"]),
            **{k: v for k, v in execution.items() if k not in ["_id", "user_id"]}
        )
        for execution in executions
    ]

@router.websocket("/ws/{workflow_id}")
async def websocket_execution(websocket: WebSocket, workflow_id: str):
    """WebSocket endpoint for real-time execution updates"""
    await websocket.accept()
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "execute":
                execution_service = ExecutionService()
                async for update in execution_service.execute_workflow_stream(
                    workflow_id, message.get("user_id"), message.get("input_data", {})
                ):
                    await websocket.send_text(json.dumps(update))
                    
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for workflow {workflow_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close()