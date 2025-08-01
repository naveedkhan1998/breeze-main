"""
Production settings for main project.
"""

import os
from pathlib import Path

from google.oauth2 import service_account

from .base import *  # noqa: F403, F401
from .base import BASE_DIR, SIMPLE_JWT  # noqa: F401

# Security settings
SECRET_KEY = os.environ.get("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required in production")

DEBUG = False

ALLOWED_HOSTS = [
    "breeze.mnaveedk.com",
    os.environ.get("ALLOWED_HOST", ""),
]

HOST = os.environ.get("HOST", "breeze.mnaveedk.com")

# Production URLs
MAIN_URL = "https://breeze.mnaveedk.com/"
MAIN_URL_2 = "https://breeze.mnaveedk.com"

# Security settings for production
CSRF_COOKIE_SECURE = True
CSRF_TRUSTED_ORIGINS = [
    "https://breeze-frontend-seven.vercel.app",
    "https://breeze.mnaveedk.com",
]

CORS_ALLOWED_ORIGINS = [
    "https://breeze-frontend-seven.vercel.app",
    "https://breeze.mnaveedk.com",
]

# Security headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Force HTTPS
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True

# Remove X_FRAME_OPTIONS for production or set appropriately
X_FRAME_OPTIONS = "DENY"

# Update JWT settings with environment secret key
SIMPLE_JWT.update(
    {
        "SIGNING_KEY": SECRET_KEY,
    }
)
# CELERY_REDIS_MAX_CONNECTIONS = 40
# CELERY_RESULT_BACKEND_THREAD_SAFE = True

# Production: Use GCS for static and media files

# Common Settings
GS_BUCKET_NAME = "realtime-app-bucket"

# Handle GCP credentials more gracefully
GS_CREDENTIALS = None
# Local development path
local_gcp_path = BASE_DIR / "gcpCredentials.json"
# Render secret file path
render_gcp_path = Path("/etc/secrets/gcpCredentials.json")

if render_gcp_path.exists():
    # Use Render secret file (production)
    GS_CREDENTIALS = service_account.Credentials.from_service_account_file(
        render_gcp_path
    )
elif local_gcp_path.exists():
    # Use local file (local development)
    GS_CREDENTIALS = service_account.Credentials.from_service_account_file(
        local_gcp_path
    )

STATIC_ROOT = "/app/staticfiles/"
STATIC_URL = f"https://storage.googleapis.com/{GS_BUCKET_NAME}/static/"
MEDIA_ROOT = "/app/media/"
MEDIA_URL = f"https://storage.googleapis.com/{GS_BUCKET_NAME}/media/"
OUTPUT_ROOT = BASE_DIR / "OUTPUTS"
OUTPUT_URL = "outputs/"

STORAGES = {
    "default": {
        "BACKEND": "storages.backends.gcloud.GoogleCloudStorage",
        "OPTIONS": {
            "bucket_name": GS_BUCKET_NAME,
            "location": "media",  # Specify media files subdirectory
        },
    },
    "staticfiles": {
        "BACKEND": "storages.backends.gcloud.GoogleCloudStorage",
        "OPTIONS": {
            "bucket_name": GS_BUCKET_NAME,
            "location": "static",  # Specify static files subdirectory
        },
    },
}
