from __future__ import annotations


class KiwoomError(Exception):
    pass


class AuthError(KiwoomError):
    pass


class InvalidCredentialsError(AuthError):
    pass


class TokenExpiredError(AuthError):
    pass


class TokenRevokeError(AuthError):
    pass


class APIError(KiwoomError):
    def __init__(self, return_code: int, return_msg: str, status_code: int = 0):
        self.return_code = return_code
        self.return_msg = return_msg
        self.status_code = status_code
        super().__init__(f"[{return_code}] {return_msg}")


class InputValidationError(APIError):
    pass


class RateLimitError(APIError):
    pass


class SymbolNotFoundError(APIError):
    pass


class OrderError(APIError):
    pass


class AccountError(APIError):
    pass


INVALID_CREDENTIAL_CODES = frozenset({8001, 8002, 8011, 8012})
INVALID_TOKEN_CODES = frozenset({8003, 8005, 8006, 8009, 8015, 8016})
MODE_MISMATCH_CODES = frozenset({8030, 8031})
INPUT_VALIDATION_CODES = frozenset({1501, 1504, 1505, 1511, 1512, 1513, 1514, 1515, 1516, 1517, 1687, 8020})
RATE_LIMIT_CODES = frozenset({1700})
SYMBOL_NOT_FOUND_CODES = frozenset({1901, 1902})
AUTH_RETRY_CODES = frozenset({8005, 8031, 8103})


def raise_for_error(data: dict, status_code: int = 0) -> None:
    return_code = data.get("return_code")
    if return_code is None or return_code == 0 or return_code == "0":
        return

    return_code = int(return_code)
    return_msg = str(data.get("return_msg", "Unknown error"))

    if return_code in INVALID_CREDENTIAL_CODES:
        raise InvalidCredentialsError(return_code, return_msg, status_code)
    if return_code in INVALID_TOKEN_CODES:
        raise TokenExpiredError(return_code, return_msg, status_code)
    if return_code in MODE_MISMATCH_CODES:
        raise AuthError(return_code, return_msg, status_code)
    if return_code in INPUT_VALIDATION_CODES:
        raise InputValidationError(return_code, return_msg, status_code)
    if return_code in RATE_LIMIT_CODES:
        raise RateLimitError(return_code, return_msg, status_code)
    if return_code in SYMBOL_NOT_FOUND_CODES:
        raise SymbolNotFoundError(return_code, return_msg, status_code)

    raise APIError(return_code, return_msg, status_code)
