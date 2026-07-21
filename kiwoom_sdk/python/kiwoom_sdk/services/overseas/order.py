from __future__ import annotations

from kiwoom_sdk.auth import KiwoomAuth
from kiwoom_sdk.client import KiwoomHttpClient
from kiwoom_sdk.errors import raise_for_error
from kiwoom_sdk.models import OrderType, TradeType
from kiwoom_sdk.models.account import OrderResult, OrderStatus


class OverseasOrderService:
    def __init__(self, auth: KiwoomAuth, http: KiwoomHttpClient):
        self.auth = auth
        self.http = http

    def buy(
        self,
        stock_code: str,
        quantity: int,
        price: float = 0.0,
        order_type: OrderType = OrderType.NORMAL,
        exchange: str = "ND",
    ) -> OrderResult:
        return self._place_order(
            stock_code=stock_code,
            quantity=quantity,
            price=price,
            trade_type=TradeType.BUY,
            order_type=order_type,
            exchange=exchange,
        )

    def sell(
        self,
        stock_code: str,
        quantity: int,
        price: float = 0.0,
        order_type: OrderType = OrderType.NORMAL,
        exchange: str = "ND",
    ) -> OrderResult:
        return self._place_order(
            stock_code=stock_code,
            quantity=quantity,
            price=price,
            trade_type=TradeType.SELL,
            order_type=order_type,
            exchange=exchange,
        )

    def modify(
        self,
        order_number: str,
        stock_code: str,
        quantity: int,
        price: float = 0.0,
    ) -> OrderResult:
        response = self.http.post(
            api_id="ust20002",
            path="/api/us/ordr_rvsecncl",
            body={
                "ovrs_excg_cd": "ND",
                "ord_no": order_number,
                "stk_cd": stock_code,
                "ord_qty": str(quantity),
                "ord_uv": str(price) if price > 0 else "",
                "trde_tp": "0",
                "trad_tp": "0",
            },
        )
        raise_for_error(response.body, response.status_code)
        return OrderResult(raw=response.body, **{**response.body, "dmst_stex_tp": "ND"})

    def cancel(self, order_number: str, stock_code: str) -> OrderResult:
        response = self.http.post(
            api_id="ust20003",
            path="/api/us/ordr_rvsecncl",
            body={
                "ovrs_excg_cd": "ND",
                "ord_no": order_number,
                "stk_cd": stock_code,
                "ord_qty": "0",
                "ord_uv": "",
                "trde_tp": "0",
                "trad_tp": "1",
            },
        )
        raise_for_error(response.body, response.status_code)
        return OrderResult(raw=response.body, **{**response.body, "dmst_stex_tp": "ND"})

    def get_order_status(self, order_number: str) -> OrderStatus:
        response = self.http.post(
            api_id="ust20005",
            path="/api/us/ordr_daily",
            body={"ord_no": order_number},
        )
        raise_for_error(response.body)
        output = response.body.get("output1", {})
        if isinstance(output, list):
            output = output[0] if output else {}
        return OrderStatus.model_validate(output)

    def list_pending_orders(self, account_number: str) -> list[OrderStatus]:
        response = self.http.post(
            api_id="ust20001",
            path="/api/us/ordr_daily",
            body={"acnt_no": account_number},
        )
        raise_for_error(response.body)
        orders_data = response.body.get("output1", [])
        if not orders_data:
            return []
        if isinstance(orders_data, dict):
            orders_data = [orders_data]
        return [OrderStatus.model_validate(o) for o in orders_data]

    def _place_order(
        self,
        stock_code: str,
        quantity: int,
        price: float,
        trade_type: TradeType,
        order_type: OrderType,
        exchange: str,
    ) -> OrderResult:
        body = {
            "ovrs_excg_cd": exchange,
            "stk_cd": stock_code,
            "ord_qty": str(quantity),
            "trde_tp": order_type.value,
            "trad_tp": trade_type.value,
        }
        if price > 0:
            body["ord_uv"] = str(price)

        response = self.http.post(
            api_id="ust20000",
            path="/api/us/ordr",
            body=body,
        )
        raise_for_error(response.body, response.status_code)
        return OrderResult(raw=response.body, **{**response.body, "dmst_stex_tp": exchange})
