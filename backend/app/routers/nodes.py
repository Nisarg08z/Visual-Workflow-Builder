from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict, Any
from app.models.user import UserInDB
from app.routers.auth import get_current_user
from app.services.node_service import NodeService
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/types")
async def get_node_types():
    """Get all available node types"""
    return NodeService.get_available_node_types()

@router.post("/custom")
async def create_custom_node(
    node_data: Dict[str, Any],
    current_user: UserInDB = Depends(get_current_user)
):
    """Create a custom node with Python code"""
    try:
        result = await NodeService.create_custom_node(node_data, str(current_user.id))
        return result
    except Exception as e:
        logger.error(f"Failed to create custom node: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/custom")
async def get_custom_nodes(current_user: UserInDB = Depends(get_current_user)):
    """Get user's custom nodes"""
    return await NodeService.get_user_custom_nodes(str(current_user.id))

@router.post("/validate")
async def validate_node_config(node_config: Dict[str, Any]):
    """Validate node configuration"""
    try:
        result = NodeService.validate_node_config(node_config)
        return {"valid": result, "message": "Configuration is valid" if result else "Invalid configuration"}
    except Exception as e:
        return {"valid": False, "message": str(e)}