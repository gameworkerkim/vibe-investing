from __future__ import annotations

from kiwoom_sdk.auth import KiwoomAuth
from kiwoom_sdk.client import KiwoomHttpClient
from kiwoom_sdk.errors import AccountError, raise_for_error
from kiwoom_sdk.models.account import AccountInfo, Holding


class OverseasAccountService:
    def __init__(self, auth: KiwoomAuth, http: KiwoomHttpClient):
        self.auth = auth
        self.http = http

    def list_accounts(self) -> list[AccountInfo]:
        response = self.http.post(
            api_id="ust21050",
            path="/api/us/acnt",
            body={},
        )
        raise_for_error(response.body)
        accounts_data = response.body.get("output1", [])
        if not accounts_data:
            return []
        if isinstance(accounts_data, dict):
            accounts_data = [accounts_data]
        return [AccountInfo.model_validate({**acct, "currency": "USD"}) for acct in accounts_data]

    def get_balance(self, account_number: str) -> AccountInfo:
        response = self.http.post(
            api_id="ust21070",
            path="/api/us/bal",
            body={"acnt_no": account_number},
        )
        raise_for_error(response.body)
        output = response.body.get("output1", response.body.get("output2", {}))
        if not output:
            raise AccountError(0, f"No balance data for account: {account_number}")
        if isinstance(output, list):
            output = output[0] if output else {}
        return AccountInfo.model_validate({**output, "acnt_no": account_number, "currency": "USD"})

    def list_holdings(self, account_number: str) -> list[Holding]:
        response = self.http.post(
            api_id="ust21661",
            path="/api/us/hldg",
            body={"acnt_no": account_number},
        )
        raise_for_error(response.body)
        holdings_data = response.body.get("output1", [])
        if not holdings_data:
            return []
        if isinstance(holdings_data, dict):
            holdings_data = [holdings_data]
        return [Holding.model_validate(h) for h in holdings_data]
