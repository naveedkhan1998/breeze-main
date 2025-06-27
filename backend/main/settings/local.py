"""
Local development settings for main project.
"""

from .base import *  # noqa: F403, F401
from .base import SIMPLE_JWT  # noqa: F401

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-3)jkjc-9$076kt^q9_b)bl2^$p36%%#zc4%^0c@sg_d17ch_6_"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["*"]
HOST = "localhost"

# Local URLs
MAIN_URL = "http://localhost:5000/"
MAIN_URL_2 = "http://localhost:5000"

# CORS settings for development
CSRF_COOKIE_SECURE = False
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:8000",
    "http://localhost:3000",
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:8000",
    "http://localhost:3000",
]

X_FRAME_OPTIONS = "ALLOW-FROM http://localhost:3000/"

# Update JWT settings with local secret key
SIMPLE_JWT.update(
    {
        "SIGNING_KEY": SECRET_KEY,
    }
)
