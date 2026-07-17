"""VibeQuant error hierarchy. Mirrors gs_quant.errors (MqError family preserved)."""


class MqError(Exception):
    """Base error for vi_quant (name preserved from gs_quant for compatibility)."""


class MqValueError(MqError, ValueError):
    pass


class MqTypeError(MqError, TypeError):
    pass


class MqRequestError(MqError):
    def __init__(self, status, message, context=None):
        super().__init__(f"{status}: {message}")
        self.status = status
        self.message = message
        self.context = context


class MqAuthenticationError(MqRequestError):
    def __init__(self, message="Authentication failed", context=None):
        super().__init__(401, message, context)


class MqUninitialisedError(MqError):
    pass
