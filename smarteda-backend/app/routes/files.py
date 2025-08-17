from fastapi import APIRouter

router = APIRouter()

@router.post('/upload/')
def upload_endpoint():
    return {"message": "Upload endpoint placeholder"}
