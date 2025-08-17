from fastapi import APIRouter

router = APIRouter()

@router.post('/ml/')
def ml_endpoint():
    return {"message": "ML endpoint placeholder"}
