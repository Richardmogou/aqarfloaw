from fastapi import APIRouter, Depends

from app.api.deps import csrf_guard
from app.api.v1 import auth, contacts, deals, health, inquiries, leads, media, properties, public, users, visits

api_router = APIRouter(prefix="/api/v1", dependencies=[Depends(csrf_guard)])
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(properties.router, tags=["properties"])
api_router.include_router(leads.router, tags=["leads"])
api_router.include_router(contacts.router, tags=["contacts"])
api_router.include_router(visits.router, tags=["visits"])
api_router.include_router(deals.router, tags=["deals"])
api_router.include_router(users.router, tags=["users"])
api_router.include_router(public.router, tags=["public"])
api_router.include_router(media.router, tags=["media"])
api_router.include_router(inquiries.router, tags=["public"])
