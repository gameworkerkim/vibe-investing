package com.kiwoom.sdk.models;

public class OrderResult {
    private String orderNumber;
    private int returnCode;
    private String returnMsg;
    private String exchange;

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public int getReturnCode() { return returnCode; }
    public void setReturnCode(int returnCode) { this.returnCode = returnCode; }

    public String getReturnMsg() { return returnMsg; }
    public void setReturnMsg(String returnMsg) { this.returnMsg = returnMsg; }

    public String getExchange() { return exchange; }
    public void setExchange(String exchange) { this.exchange = exchange; }

    @Override
    public String toString() {
        return String.format("OrderResult{no=%s, code=%d, msg=%s}", orderNumber, returnCode, returnMsg);
    }
}
