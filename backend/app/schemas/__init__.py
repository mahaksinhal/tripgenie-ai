from app.schemas.auth import Token, TokenPayload, LoginRequest, RegisterRequest, RefreshTokenRequest
from app.schemas.user import UserBase, UserCreate, UserUpdate, UserResponse
from app.schemas.trip import (
    TripBase, TripCreate, TripUpdate, TripResponse,
    TripPreferenceBase, TripPreferenceCreate, TripPreferenceResponse,
    SavedTripBase, SavedTripCreate, SavedTripResponse,
    TripHistoryResponse
)
from app.schemas.chat import MessageBase, MessageCreate, MessageResponse, ConversationBase, ConversationCreate, ConversationResponse, ConversationDetailResponse
from app.schemas.feedback import FeedbackBase, FeedbackCreate, FeedbackResponse, NotificationBase, NotificationResponse
