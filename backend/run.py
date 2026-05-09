"""
Entry point for running the Valorniq backend server.
Run with: python run.py
"""
import os
import sys
import uvicorn
from pathlib import Path

# Add the backend directory to the path
sys.path.insert(0, str(Path(__file__).parent))

if __name__ == "__main__":
    host = os.getenv("BACKEND_HOST", "0.0.0.0")
    port = int(os.getenv("BACKEND_PORT", 8000))
    
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║  VALORNIQ - Enterprise SaaS Operating System Backend       ║
    ║  Powered by ARIS AI Intelligence System                   ║
    ║  FastAPI Python Architecture                              ║
    ╚═══════════════════════════════════════════════════════════╝
    """)
    print(f"🚀 Starting server on {host}:{port}")
    print(f"📚 API Documentation: http://{host}:{port}/docs")
    print(f"🤖 ARIS Intelligence: Online")
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
