from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.directory import router as directory_router
from app.api.v1.workspaces import router as workspaces_router
from app.api.v1.onboarding import router as onboarding_router
from app.api.v1.knowledge import router as knowledge_router
from app.api.v1.agent import router as agent_router
from app.api.v1.chat import router as chat_router
from app.api.v1.actions import router as actions_router
from app.api.v1.voice import router as voice_router
from app.api.v1.analytics import router as analytics_router

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(auth_router)
api_v1_router.include_router(directory_router)
api_v1_router.include_router(workspaces_router)
api_v1_router.include_router(onboarding_router)
api_v1_router.include_router(knowledge_router)
api_v1_router.include_router(agent_router)
api_v1_router.include_router(chat_router)
api_v1_router.include_router(actions_router)
api_v1_router.include_router(voice_router)
api_v1_router.include_router(analytics_router)
