from __future__ import annotations

import hashlib
import json
import os
import time
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from pathlib import Path
from tempfile import NamedTemporaryFile

import requests

from kiwoom_sdk.config import CACHE_DIR, TOKEN_PATH, Config
from kiwoom_sdk.errors import AuthError, InvalidCredentialsError, TokenExpiredError, raise_for_error

KST = timezone(timedelta(hours=9))


@dataclass
class TokenRecord:
    access_token: str
    token_type: str
    expires_at: datetime
    mode: str
    credential_fingerprint: str | None = None
    saved_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    @property
    def is_expired(self) -> bool:
        return datetime.now(timezone.utc) >= self.expires_at

    @property
    def needs_refresh(self, buffer_seconds: int = 600) -> bool:
        return datetime.now(timezone.utc) >= (self.expires_at - timedelta(seconds=buffer_seconds))

    def to_dict(self) -> dict:
        return {
            "access_token": self.access_token,
            "token_type": self.token_type,
            "expires_at": self.expires_at.isoformat(),
            "mode": self.mode,
            "credential_fingerprint": self.credential_fingerprint,
            "saved_at": self.saved_at.isoformat(),
        }

    @classmethod
    def from_dict(cls, data: dict) -> TokenRecord:
        return cls(
            access_token=data["access_token"],
            token_type=data.get("token_type", "bearer"),
            expires_at=datetime.fromisoformat(data["expires_at"]),
            mode=data.get("mode", "real"),
            credential_fingerprint=data.get("credential_fingerprint"),
            saved_at=datetime.fromisoformat(data["saved_at"]) if "saved_at" in data else datetime.now(timezone.utc),
        )


class TokenStore:
    def __init__(self, cache_dir: str | Path = CACHE_DIR):
        self._cache_dir = Path(cache_dir)
        self._cache_dir.mkdir(parents=True, exist_ok=True)

    def _token_path(self, mode: str) -> Path:
        return self._cache_dir / f"{mode}-token.json"

    def load(self, mode: str) -> TokenRecord | None:
        path = self._token_path(mode)
        if not path.exists():
            return None
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            return TokenRecord.from_dict(data)
        except (json.JSONDecodeError, KeyError, ValueError):
            return None

    def save(self, record: TokenRecord) -> None:
        path = self._token_path(record.mode)
        payload = json.dumps(record.to_dict(), ensure_ascii=True, indent=2)
        directory = path.parent
        with NamedTemporaryFile("w", encoding="utf-8", dir=directory, delete=False) as tmp:
            tmp.write(payload)
            tmp.flush()
            os.fsync(tmp.fileno())
            temp_path = Path(tmp.name)
        if os.name != "nt":
            temp_path.chmod(0o600)
        temp_path.replace(path)

    def clear(self, mode: str) -> None:
        path = self._token_path(mode)
        path.unlink(missing_ok=True)


class KiwoomAuth:
    def __init__(self, config: Config):
        self.config = config
        self._token_store = TokenStore()
        self._credential_fingerprint = self._compute_fingerprint()

    @property
    def app_key(self) -> str:
        return self.config.app_key

    @property
    def app_secret(self) -> str:
        return self.config.app_secret

    def _compute_fingerprint(self) -> str:
        raw = f"{self.app_key}:{self.app_secret}".encode("utf-8")
        return hashlib.sha256(raw).hexdigest()

    def _cached_token(self) -> TokenRecord | None:
        record = self._token_store.load(self.config.mode)
        if record is None:
            return None
        if record.credential_fingerprint and record.credential_fingerprint != self._credential_fingerprint:
            self._token_store.clear(self.config.mode)
            return None
        return record

    def get_access_token(self) -> str:
        record = self._cached_token()
        if record and not record.needs_refresh:
            return record.access_token
        return self.issue_token()

    def issue_token(self) -> str:
        payload = {
            "grant_type": "client_credentials",
            "appkey": self.app_key,
            "secretkey": self.app_secret,
        }
        response = requests.post(
            f"{self.config.base_url}{TOKEN_PATH}",
            json=payload,
            headers={"Content-Type": "application/json;charset=UTF-8"},
            timeout=self.config.timeout,
        )
        data = self._parse_response(response)

        if response.status_code >= 400:
            raise AuthError(f"Token request failed (HTTP {response.status_code}): {data}")

        raise_for_error(data)

        access_token = data.get("token")
        expires_dt = data.get("expires_dt")
        if not access_token or not expires_dt:
            raise AuthError("Token response missing required fields")

        expires_at = datetime.strptime(expires_dt, "%Y%m%d%H%M%S").replace(tzinfo=KST)
        record = TokenRecord(
            access_token=access_token,
            token_type=str(data.get("token_type", "bearer")).lower(),
            expires_at=expires_at,
            mode=self.config.mode,
            credential_fingerprint=self._credential_fingerprint,
        )
        self._token_store.save(record)
        return record.access_token

    def revoke_token(self) -> None:
        record = self._cached_token()
        if record is None:
            return

        response = requests.post(
            f"{self.config.base_url}/oauth2/revoke",
            json={
                "appkey": self.app_key,
                "secretkey": self.app_secret,
                "token": record.access_token,
            },
            headers={"Content-Type": "application/json;charset=UTF-8"},
            timeout=self.config.timeout,
        )
        data = self._parse_response(response)
        if response.status_code < 400 and data.get("return_code") in (None, 0):
            self._token_store.clear(self.config.mode)

    def authorization_header(self) -> str:
        return f"Bearer {self.get_access_token()}"

    def recover_from_failure(self) -> str:
        self._token_store.clear(self.config.mode)
        return self.issue_token()

    @staticmethod
    def _parse_response(response: requests.Response) -> dict:
        try:
            data = response.json()
            return data if isinstance(data, dict) else {}
        except ValueError:
            return {}
