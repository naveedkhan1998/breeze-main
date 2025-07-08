"""
Production settings for main project.
"""

import os

from .base import *  # noqa: F403, F401
from .base import SIMPLE_JWT  # noqa: F401

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
CELERY_REDIS_MAX_CONNECTIONS = 40
