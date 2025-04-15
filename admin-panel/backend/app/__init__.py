from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse

from app.api import auth, devices, commands, logs
from app.core.config import settings
from app.db.database import create_tables

def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="Enterprise Android Device Management System",
        description="API for monitoring and managing Android devices in an enterprise environment",
        version="1.0.0",
        docs_url=None,  # We'll serve Swagger UI manually for custom styling
        redoc_url=None  # Disable ReDoc
    )

    # Set up CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Initialize database
    @app.on_event("startup")
    async def startup_db_client():
        await create_tables()

    # Include API routers
    app.include_router(auth.router, prefix="/api", tags=["Authentication"])
    app.include_router(devices.router, prefix="/api", tags=["Devices"])
    app.include_router(commands.router, prefix="/api", tags=["Commands"])
    app.include_router(logs.router, prefix="/api", tags=["Logs"])

    # Health check endpoint
    @app.get("/health", status_code=200)
    async def health_check():
        return {"status": "healthy"}

    # Custom Swagger UI
    @app.get("/docs", include_in_schema=False)
    async def custom_swagger_ui_html():
        return get_swagger_ui_html(
            openapi_url=app.openapi_url,
            title=f"{app.title} - API Documentation",
            swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4/swagger-ui-bundle.js",
            swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4/swagger-ui.css",
            swagger_favicon_url="https://fastapi.tiangolo.com/img/favicon.png",
        )

    # Custom OpenAPI schema
    @app.get("/openapi.json", include_in_schema=False)
    async def get_open_api_endpoint():
        openapi_schema = get_openapi(
            title=app.title,
            version=app.version,
            description=app.description,
            routes=app.routes,
        )
        return JSONResponse(openapi_schema)

    return app
