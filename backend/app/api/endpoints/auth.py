from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.repositories.user_repo import UserRepository
from app.schemas.auth import UserSignup, UserLogin, UserResponse, Token
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def signup(payload: UserSignup, db: AsyncSession = Depends(get_db)):
    """Registers a new user account with hashed password and returns access token."""
    user_repo = UserRepository(db)
    
    # Check if email is already taken
    existing = await user_repo.get_by_email(payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # Hash password with bcrypt
    hashed = hash_password(payload.password)
    new_user = await user_repo.create(
        name=payload.name,
        email=payload.email,
        password_hash=hashed
    )

    # Issue JWT token
    access_token = create_access_token(data={"sub": new_user.id, "email": new_user.email})

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )

@router.post("/login", response_model=Token)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticates a user and returns an access token."""
    user_repo = UserRepository(db)
    user = await user_repo.get_by_email(payload.email)
    
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.id, "email": user.email})

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user's profile."""
    return UserResponse.model_validate(current_user)
