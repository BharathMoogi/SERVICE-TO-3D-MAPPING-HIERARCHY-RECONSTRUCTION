"""
AtlasAI FastAPI Production Server Runner
Executes Uvicorn server serving the interactive 3D Web Dashboard & REST APIs.
"""

import sys
import uvicorn
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

def main():
    print("==================================================================")
    print("      LAUNCHING ATLASAI ENTERPRISE 3D DIGITAL TWIN SERVER         ")
    print("==================================================================")
    print(" -> 3D Web Dashboard:    http://127.0.0.1:8000")
    print(" -> Interactive REST Docs: http://127.0.0.1:8000/docs")
    print(" -> Explainability API:    http://127.0.0.1:8000/api/explain/1")
    print("==================================================================")

    uvicorn.run("atlasai.server:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    main()
