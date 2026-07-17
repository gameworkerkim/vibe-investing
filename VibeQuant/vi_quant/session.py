"""
VibeQuant session management.

API-compatible with gs_quant.session (GsSession -> ViSession). Unlike GS Quant,
credentials are optional: the default is *embedded mode*, where API calls dispatch to
in-process open-source engines instead of a remote platform. Setting VI_QUANT_API_URL
(or passing an Environment) switches to a self-hosted VI Platform backend over HTTP.
"""

import os
from enum import Enum, unique, auto

from .errors import MqUninitialisedError


API_VERSION = "v1"
DEFAULT_TIMEOUT = 65


@unique
class Environment(Enum):
    """Kept for signature compatibility with gs_quant.session.Environment."""
    DEV = auto()
    QA = auto()
    PROD = auto()


_DEFAULT_URLS = {
    Environment.PROD: os.environ.get("VI_QUANT_API_URL", "http://localhost:8080"),
    Environment.QA: os.environ.get("VI_QUANT_QA_API_URL", "http://localhost:8081"),
    Environment.DEV: "http://localhost:8082",
}


class ViSession:
    """Drop-in replacement for GsSession. No client_id/client_secret required."""

    __current = None

    def __init__(self, environment=None, client_id=None, client_secret=None, **kwargs):
        self.environment = environment
        self.client_id = client_id or os.environ.get("VI_CLIENT_ID")
        self.client_secret = client_secret or os.environ.get("VI_CLIENT_SECRET")
        self.embedded = environment is None and "VI_QUANT_API_URL" not in os.environ
        self.domain = None if self.embedded else _DEFAULT_URLS[environment or Environment.PROD]

    @classmethod
    def use(cls, environment=None, client_id=None, client_secret=None, **kwargs):
        """Create and activate a session.

        ViSession.use()                      -> embedded local engines (default)
        ViSession.use(Environment.PROD, ...) -> self-hosted VI Platform over HTTP
        """
        session = cls(environment, client_id, client_secret, **kwargs)
        cls.__current = session
        return session

    @classmethod
    def get(cls, environment=None, client_id=None, client_secret=None, **kwargs):
        """Create a session without activating it (mirrors GsSession.get)."""
        return cls(environment, client_id, client_secret, **kwargs)

    @classmethod
    def current(cls):
        if cls.__current is None:
            raise MqUninitialisedError("Please call ViSession.use() to initialise a session")
        return cls.__current

    def is_embedded(self):
        return self.embedded

    def __repr__(self):
        mode = "embedded" if self.embedded else self.domain
        return f"<ViSession {mode}>"


class PassThroughSession(ViSession):
    """For self-hosted VI backends when a bearer token already exists."""

    def __init__(self, token, environment=Environment.PROD, **kwargs):
        super().__init__(environment, **kwargs)
        self.token = token
        self.embedded = False
