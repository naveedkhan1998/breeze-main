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

# Redis connection pooling settings for production
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
CELERY_BROKER_CONNECTION_MAX_RETRIES = 3
CELERY_BROKER_POOL_LIMIT = 5  # Reduced from 10 for 3 workers
CELERY_REDIS_MAX_CONNECTIONS = 10  # Reduced from 20 for 3 workers
CELERY_BROKER_TRANSPORT_OPTIONS = {
    'visibility_timeout': 3600,
    'retry_policy': {
        'timeout': 5.0
    },
    'connection_pool_kwargs': {
        'max_connections': 10,  # Reduced from 20 for 3 workers
        'retry_on_timeout': True,
    },
}

# Additional Celery settings for production
CELERY_WORKER_PREFETCH_MULTIPLIER = 1
CELERY_TASK_ACKS_LATE = True
CELERY_WORKER_MAX_TASKS_PER_CHILD = 1000
CELERY_WORKER_MAX_TASKS_PER_CHILD = 1000
