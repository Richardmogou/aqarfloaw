from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.api.v1.auth import login_router
from app.core.config import settings

__author__ = "Nchifor Richard"

app = FastAPI(title="AqarFlow API", version="0.1.0", contact={"name": "Nchifor Richard"})
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_list,
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(login_router, prefix="/api/v1", tags=["auth"])
app.include_router(api_router)
