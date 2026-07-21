package com.kiwoom.sdk.services;

import com.kiwoom.sdk.auth.KiwoomAuth;
import com.kiwoom.sdk.client.KiwoomHttpClient;
import com.kiwoom.sdk.client.KiwoomResponse;
import com.kiwoom.sdk.models.OrderResult;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class OverseasOrderService {
    private final KiwoomAuth auth;
    private final KiwoomHttpClient http;

    public OverseasOrderService(KiwoomAuth auth, KiwoomHttpClient http) {
        this.auth = auth;
        this.http = http;
    }

    public OrderResult buy(String stockCode, int quantity, double price, String orderType, String exchange) throws IOException {
        return placeOrder(stockCode, quantity, price, orderType, "1", exchange);
    }

    public OrderResult sell(String stockCode, int quantity, double price, String orderType, String exchange) throws IOException {
        return placeOrder(stockCode, quantity, price, orderType, "2", exchange);
    }

    public OrderResult buy(String stockCode, int quantity) throws IOException {
        return buy(stockCode, quantity, 0, "3", "ND");
    }

    public OrderResult sell(String stockCode, int quantity) throws IOException {
        return sell(stockCode, quantity, 0, "3", "ND");
    }

    public OrderResult modify(String orderNumber, String stockCode, int quantity, double price) throws IOException {
        Map<String, Object> body = new HashMap<>();
        body.put("ovrs_excg_cd", "ND");
        body.put("ord_no", orderNumber);
        body.put("stk_cd", stockCode);
        body.put("ord_qty", String.valueOf(quantity));
        body.put("ord_uv", price > 0 ? String.valueOf(price) : "");
        body.put("trde_tp", "0");
        body.put("trad_tp", "0");

        KiwoomResponse response = http.post("ust20002", "/api/us/ordr_rvsecncl", body);
        return buildResult(response, "ND");
    }

    public OrderResult cancel(String orderNumber, String stockCode) throws IOException {
        Map<String, Object> body = new HashMap<>();
        body.put("ovrs_excg_cd", "ND");
        body.put("ord_no", orderNumber);
        body.put("stk_cd", stockCode);
        body.put("ord_qty", "0");
        body.put("ord_uv", "");
        body.put("trde_tp", "0");
        body.put("trad_tp", "1");

        KiwoomResponse response = http.post("ust20003", "/api/us/ordr_rvsecncl", body);
        return buildResult(response, "ND");
    }

    private OrderResult placeOrder(String stockCode, int quantity, double price,
                                    String orderType, String tradeType, String exchange) throws IOException {
        Map<String, Object> body = new HashMap<>();
        body.put("ovrs_excg_cd", exchange);
        body.put("stk_cd", stockCode);
        body.put("ord_qty", String.valueOf(quantity));
        body.put("trde_tp", orderType);
        body.put("trad_tp", tradeType);
        if (price > 0) {
            body.put("ord_uv", String.valueOf(price));
        }

        KiwoomResponse response = http.post("ust20000", "/api/us/ordr", body);
        return buildResult(response, exchange);
    }

    private OrderResult buildResult(KiwoomResponse response, String exchange) {
        OrderResult result = new OrderResult();
        result.setOrderNumber((String) response.body.getOrDefault("ord_no", ""));
        result.setReturnCode(toInt(response.body.get("return_code")));
        result.setReturnMsg((String) response.body.getOrDefault("return_msg", ""));
        result.setExchange(exchange);
        return result;
    }

    private int toInt(Object value) {
        if (value instanceof Number) return ((Number) value).intValue();
        if (value instanceof String && !((String) value).isEmpty()) {
            try { return Integer.parseInt((String) value); } catch (NumberFormatException ignored) {}
        }
        return 0;
    }
}
