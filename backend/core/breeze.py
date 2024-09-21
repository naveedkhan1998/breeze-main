# core/utils.py

import threading
import logging
from breeze_connect import BreezeConnect
from core.models import BreezeAccount
from django.shortcuts import get_object_or_404

logger = logging.getLogger(__name__)


class BreezeSession:
    """
    Singleton class to manage BreezeConnect sessions per user.
    Ensures that each user has only one BreezeSession instance.
    Reinitializes the session if the session_token changes.
    """

    _instances = {}
    _lock = threading.Lock()

    def __new__(cls, user_id):
        """
        Controls the instantiation of the BreezeSession class.
        Ensures a single instance per user_id.
        """
        with cls._lock:
            if user_id in cls._instances:
                instance = cls._instances[user_id]
                acc = get_object_or_404(BreezeAccount, user__id=user_id)
                if instance.acc.session_token != acc.session_token:
                    # Session token has changed; recreate the instance
                    logger.info(
                        f"Session token changed for user {user_id}. Reinitializing BreezeSession."
                    )
                    instance = super(BreezeSession, cls).__new__(cls)
                    cls._instances[user_id] = instance
                    instance.__init__(user_id)
                return cls._instances[user_id]
            else:
                instance = super(BreezeSession, cls).__new__(cls)
                cls._instances[user_id] = instance
                instance.__init__(user_id)
                return instance

    def __init__(self, user_id):
        """
        Initializes the BreezeSession instance.
        Prevents re-initialization if already initialized.
        """
        if hasattr(self, "initialized") and self.initialized:
            return  # Avoid re-initialization
        self.initialized = True
        self.user_id = user_id
        self.acc = get_object_or_404(BreezeAccount, user__id=user_id)
        self.breeze = BreezeConnect(api_key=self.acc.api_key)
        try:
            self.breeze.generate_session(
                api_secret=self.acc.api_secret, session_token=self.acc.session_token
            )
            logger.info(f"BreezeSession initialized for user {user_id}.")
        except Exception as e:
            logger.error(f"Failed to initialize BreezeSession for user {user_id}: {e}")
            raise e

    def get_data(self):
        """
        Placeholder for data retrieval logic.
        Implement your data fetching methods here.
        """
        pass
