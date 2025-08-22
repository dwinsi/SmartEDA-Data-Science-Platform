from fastapi import APIRouter, HTTPException, status
from app.models.user import UserCreate, UserLogin, User
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta, timezone
from typing import Dict, Any

SECRET_KEY = "your-secret-key"  # Replace with a secure key in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

# In-memory user store for demo (replace with DB in production)
users_db: Dict[str, User] = {}

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: Dict[str, Any], expires_delta: timedelta = None): # type: ignore
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate):
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    new_user = User(
        id=str(len(users_db) + 1),
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role="user"
    )
    users_db[user.email] = new_user
    return {"msg": "User registered successfully"}

@router.post("/login")
def login(user: UserLogin):
    db_user = users_db.get(user.email)
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token({"sub": db_user.email, "role": db_user.role})
    return {"access_token": access_token, "token_type": "bearer"}
