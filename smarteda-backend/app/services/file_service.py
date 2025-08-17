"""File service layer for SmartEDA Data Science Platform."""
from typing import Dict, Any

import pandas as pd


def save_uploaded_file(file_content: bytes, filename: str = "uploaded.csv") -> Dict[str, Any]:
    """Save uploaded file to disk and return file information."""
    try:
        # Write file to disk
        with open(filename, "wb") as f:
            f.write(file_content)
        
        # Read and analyze the file
        df = pd.read_csv(filename)  # type: ignore
        
        return {
            "message": "File uploaded successfully",
            "filename": filename,
            "columns": df.columns.tolist(),
            "rows": len(df),
            "shape": df.shape
        }
    except (IOError, pd.errors.ParserError) as e:
        return {"error": f"Failed to process file: {str(e)}"}
    except (ValueError, UnicodeDecodeError) as e:
        return {"error": f"File decoding or value error: {str(e)}"}
