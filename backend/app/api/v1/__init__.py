from fastapi import APIRouter
from app.api.v1 import auth, users, trips, conversations, notifications, feedback

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(trips.router, prefix="/trips", tags=["trips"])
api_router.include_router(trips.router, prefix="/trip", tags=["trips"])
api_router.include_router(conversations.router, prefix="/conversations", tags=["conversations"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(feedback.router, prefix="/feedback", tags=["feedback"])
