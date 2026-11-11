from fastapi import APIRouter, Depends

from app.api.deps import csrf_guard
from app.api.v1 import auth, health, media, properties, public, users

api_router = APIRouter(prefix="/api/v1", dependencies=[Depends(csrf_guard)])
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(properties.router, tags=["properties"])
api_router.include_router(users.router, tags=["users"])
api_router.include_router(public.router, tags=["public"])
api_router.include_router(media.router, tags=["media"])
