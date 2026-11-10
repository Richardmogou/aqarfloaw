from fastapi import APIRouter, Depends

from app.api.deps import csrf_guard
from app.api.v1 import auth, health

api_router = APIRouter(prefix="/api/v1", dependencies=[Depends(csrf_guard)])
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, tags=["auth"])
