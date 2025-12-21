from fastapi import APIRouter, UploadFile, File, HTTPException
from core.analyzer import analyze_image
import shutil
import os
import tempfile

router = APIRouter()

@router.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name
        
        # Analyze
        results = analyze_image(tmp_path)
        
        # Cleanup
        os.unlink(tmp_path)
        
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
