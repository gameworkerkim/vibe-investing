from __future__ import annotations

from pydantic import BaseModel, Field


class AccountInfo(BaseModel):
    account_number: str = Field(alias="acnt_no")
    account_name: str = Field(alias="acnt_name", default="")
    balance: float = Field(alias="evlu_pfls_amt", default=0.0)
    deposit: float = Field(alias="dmst_dncl_amt", default=0.0)
    total_value: float = Field(alias="tot_evlu_amt", default=0.0)
    profit_loss: float = Field(alias="evlu_pfls_rt", default=0.0)
    profit_loss_ratio: float = Field(alias="evlu_erng_rt1", default=0.0)
    currency: str = Field(default="KRW")


class Holding(BaseModel):
    stock_code: str = Field(alias="stk_cd")
    stock_name: str = Field(alias="stk_nm", default="")
    quantity: int = Field(alias="hldg_qty", default=0)
    average_price: float = Field(alias="pchs_avg_pric", default=0.0)
    current_price: float = Field(alias="now_pric", default=0.0)
    total_value: float = Field(alias="evlu_amt", default=0.0)
    profit_loss: float = Field(alias="evlu_pfls_amt", default=0.0)
    profit_loss_ratio: float = Field(alias="evlu_pfls_rt", default=0.0)


class DomesticAccount(BaseModel):
    accounts: list[AccountInfo] = Field(default_factory=list)
    holdings: list[Holding] = Field(default_factory=list)


class OverseasAccount(BaseModel):
    accounts: list[AccountInfo] = Field(default_factory=list)
    holdings: list[Holding] = Field(default_factory=list)


class OrderRequest(BaseModel):
    stock_code: str
    quantity: int
    price: float = 0.0
    order_type: str = "0"
    trade_type: str = "1"
    exchange: str = "KRX"


class OrderResult(BaseModel):
    order_number: str = Field(alias="ord_no", default="")
    return_code: int = Field(alias="return_code", default=0)
    return_msg: str = Field(alias="return_msg", default="")
    exchange: str = Field(alias="dmst_stex_tp", default="")
    raw: dict = Field(default_factory=dict)


class StockQuote(BaseModel):
    stock_code: str = Field(alias="stk_cd", default="")
    stock_name: str = Field(alias="stk_nm", default="")
    current_price: float = Field(alias="now_pric", default=0.0)
    previous_price: float = Field(alias="prdy_vrss", default=0.0)
    change: float = Field(alias="prdy_vrss_sign", default=0.0)
    change_ratio: float = Field(alias="prdy_ctrt", default=0.0)
    open_price: float = Field(alias="oprc_pric", default=0.0)
    high_price: float = Field(alias="hgpr_pric", default=0.0)
    low_price: float = Field(alias="lwpr_pric", default=0.0)
    volume: int = Field(alias="acml_vol", default=0)
    trade_value: float = Field(alias="acml_tr_pbmn", default=0.0)


class OrderStatus(BaseModel):
    order_number: str = Field(alias="ord_no", default="")
    stock_code: str = Field(alias="stk_cd", default="")
    stock_name: str = Field(alias="stk_nm", default="")
    order_quantity: int = Field(alias="ord_qty", default=0)
    filled_quantity: int = Field(alias="tot_ccld_qty", default=0)
    price: float = Field(alias="ord_uv", default=0.0)
    order_type: str = Field(alias="trde_tp", default="")
    status: str = Field(alias="ord_tp", default="")
    order_time: str = Field(alias="ord_tmd", default="")
