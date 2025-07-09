WEBSOCKET_HEARTBEAT_KEY = "ticks_received"
WEBSOCKET_HEARTBEAT_TTL = 100


AUTH_PROVIDERS = {
    "email": "email",
    "google": "google",
    "facebook": "facebook",
    "twitter": "twitter",
}


def websocket_user_lock(user_id: int) -> str:
    """
    Generate a unique lock key for a user to prevent multiple WebSocket connections.
    """
    return f"websocket_lock_{user_id}"
