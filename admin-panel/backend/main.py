import uvicorn
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

try:
    logger.info("Starting application...")
    from app import create_app
    logger.info("App module imported successfully")
    
    app = create_app()
    logger.info("App created successfully")
    
    if __name__ == "__main__":
        logger.info("Starting server on 0.0.0.0:8000")
        uvicorn.run("main:app", host="0.0.0.0", port=8000, log_level="info")
except Exception as e:
    logger.error(f"Error during startup: {e}", exc_info=True)
    raise
