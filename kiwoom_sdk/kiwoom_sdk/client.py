from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, TYPE_CHECKING

import requests

from kiwoom_sdk.auth import KiwoomAuth
from kiwoom_sdk.config import Config
from kiwoom_sdk.errors import AUTH_RETRY_CODES

if TYPE_CHECKING:
    from kiwoom_sdk.services.domestic.account import DomesticAccountService
    from kiwoom_sdk.services.domestic.order import DomesticOrderService
    from kiwoom_sdk.services.overseas.account import OverseasAccountService
    from kiwoom_sdk.services.overseas.order import OverseasOrderService

EMPTY_HEADER_CHECK = frozenset({"content-type", "api-id", "authorization"})


@dataclass
class KiwoomResponse:
    body: dict[str, Any]
    status_code: int = 200
    headers: dict[str, str] = field(default_factory=dict)
    continuation: Continuation = field(default_factory=lambda: Continuation())


@dataclass
class Continuation:
    has_next: bool = False
    next_key: str | None = None
    cont_yn: str | None = None


class KiwoomHttpClient:
    def __init__(self, auth: KiwoomAuth, timeout: int = 30):
        self.auth = auth
        self.timeout = timeout
        self.session = requests.Session()

    def post(
        self,
        api_id: str,
        path: str,
        body: dict[str, Any],
        extra_headers: dict[str, str] | None = None,
        retry: bool = True,
    ) -> KiwoomResponse:
        url = f"{self.auth.config.base_url}{path}"
        headers = {
            "Content-Type": "application/json;charset=UTF-8",
            "api-id": api_id,
            "authorization": self.auth.authorization_header(),
        }
        if extra_headers:
            self._validate_headers(extra_headers)
            headers.update(extra_headers)

        response = self.session.request(
            method="POST",
            url=url,
            headers=headers,
            json=body,
            timeout=self.timeout,
        )

        if response.status_code == 401 and retry:
            self.auth.recover_from_failure()
            return self.post(api_id=api_id, path=path, body=body, extra_headers=extra_headers, retry=False)

        data = self._parse_body(response)

        if retry and data.get("return_code") in (None, 0) and response.status_code < 400:
            pass
        elif retry and int(data.get("return_code", 0)) in AUTH_RETRY_CODES:
            self.auth.recover_from_failure()
            return self.post(api_id=api_id, path=path, body=body, extra_headers=extra_headers, retry=False)

        cont_yn = response.headers.get("cont-yn") or response.headers.get("Cont-Yn")
        next_key = response.headers.get("next-key") or response.headers.get("Next-Key")

        return KiwoomResponse(
            body=data,
            status_code=response.status_code,
            headers=dict(response.headers),
            continuation=Continuation(
                has_next=cont_yn == "Y",
                next_key=next_key or None,
                cont_yn=cont_yn or None,
            ),
        )

    @staticmethod
    def _validate_headers(headers: dict[str, str]) -> None:
        for key in headers:
            if key.lower() in EMPTY_HEADER_CHECK:
                raise ValueError(f"Cannot override reserved header: {key}")

    @staticmethod
    def _parse_body(response: requests.Response) -> dict[str, Any]:
        try:
            data = response.json()
            return data if isinstance(data, dict) else {}
        except ValueError:
            return {"raw_text": response.text}


class KiwoomClient:
    def __init__(
        self,
        app_key: str,
        app_secret: str,
        *,
        market: str = "real",
        timeout: int = 30,
    ):
        from kiwoom_sdk.models import Market

        self.config = Config(
            app_key=app_key,
            app_secret=app_secret,
            market=Market.REAL if market == "real" else Market.DEMO,
            timeout=timeout,
        )
        self.auth = KiwoomAuth(self.config)
        self.http = KiwoomHttpClient(self.auth, timeout=timeout)

        self._domestic_account: DomesticAccountService | None = None
        self._domestic_order: DomesticOrderService | None = None
        self._overseas_account: OverseasAccountService | None = None
        self._overseas_order: OverseasOrderService | None = None

    @property
    def domestic_account(self) -> DomesticAccountService:
        if self._domestic_account is None:
            from kiwoom_sdk.services.domestic.account import DomesticAccountService

            self._domestic_account = DomesticAccountService(self.auth, self.http)
        return self._domestic_account

    @property
    def domestic_order(self) -> DomesticOrderService:
        if self._domestic_order is None:
            from kiwoom_sdk.services.domestic.order import DomesticOrderService

            self._domestic_order = DomesticOrderService(self.auth, self.http)
        return self._domestic_order

    @property
    def overseas_account(self) -> OverseasAccountService:
        if self._overseas_account is None:
            from kiwoom_sdk.services.overseas.account import OverseasAccountService

            self._overseas_account = OverseasAccountService(self.auth, self.http)
        return self._overseas_account

    @property
    def overseas_order(self) -> OverseasOrderService:
        if self._overseas_order is None:
            from kiwoom_sdk.services.overseas.order import OverseasOrderService

            self._overseas_order = OverseasOrderService(self.auth, self.http)
        return self._overseas_order

    def auth(self) -> str:
        return self.auth.issue_token()

    def close(self) -> None:
        try:
            self.auth.revoke_token()
        except Exception:
            pass
        self.http.session.close()

    def __enter__(self) -> KiwoomClient:
        return self

    def __exit__(self, *args: object) -> None:
        self.close()
