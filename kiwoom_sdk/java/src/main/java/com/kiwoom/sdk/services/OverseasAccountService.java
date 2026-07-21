package com.kiwoom.sdk.services;

import com.kiwoom.sdk.auth.KiwoomAuth;
import com.kiwoom.sdk.client.KiwoomHttpClient;
import com.kiwoom.sdk.client.KiwoomResponse;
import com.kiwoom.sdk.models.AccountInfo;
import com.kiwoom.sdk.models.Holding;

import java.io.IOException;
import java.util.*;

public class OverseasAccountService {
    private final KiwoomAuth auth;
    private final KiwoomHttpClient http;

    public OverseasAccountService(KiwoomAuth auth, KiwoomHttpClient http) {
        this.auth = auth;
        this.http = http;
    }

    public List<AccountInfo> listAccounts() throws IOException {
        KiwoomResponse response = http.post("ust21050", "/api/us/acnt", new HashMap<>());
        List<Map<String, Object>> output = extractList(response, "output1");
        List<AccountInfo> accounts = new ArrayList<>();
        for (Map<String, Object> entry : output) {
            AccountInfo info = new AccountInfo();
            info.setAccountNumber((String) entry.get("acnt_no"));
            info.setAccountName((String) entry.getOrDefault("acnt_name", ""));
            info.setCurrency("USD");
            accounts.add(info);
        }
        return accounts;
    }

    public AccountInfo getBalance(String accountNumber) throws IOException {
        KiwoomResponse response = http.post("ust21070", "/api/us/bal",
                Map.of("acnt_no", accountNumber));
        Map<String, Object> output = extractMap(response, "output1");
        AccountInfo info = new AccountInfo();
        info.setAccountNumber(accountNumber);
        info.setDeposit(toDouble(output.get("dmst_dncl_amt")));
        info.setCurrency("USD");
        return info;
    }

    public List<Holding> listHoldings(String accountNumber) throws IOException {
        KiwoomResponse response = http.post("ust21661", "/api/us/hldg",
                Map.of("acnt_no", accountNumber));
        List<Map<String, Object>> output = extractList(response, "output1");
        List<Holding> holdings = new ArrayList<>();
        for (Map<String, Object> entry : output) {
            Holding h = new Holding();
            h.setStockCode((String) entry.get("stk_cd"));
            h.setStockName((String) entry.getOrDefault("stk_nm", ""));
            h.setQuantity(toInt(entry.get("hldg_qty")));
            h.setAveragePrice(toDouble(entry.get("pchs_avg_pric")));
            holdings.add(h);
        }
        return holdings;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> extractList(KiwoomResponse response, String key) {
        Object raw = response.body.get(key);
        if (raw instanceof List) return (List<Map<String, Object>>) raw;
        if (raw instanceof Map) return List.of((Map<String, Object>) raw);
        return List.of();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> extractMap(KiwoomResponse response, String key) {
        Object raw = response.body.get(key);
        if (raw instanceof Map) return (Map<String, Object>) raw;
        return Map.of();
    }

    private double toDouble(Object value) {
        if (value instanceof Number) return ((Number) value).doubleValue();
        return 0.0;
    }

    private int toInt(Object value) {
        if (value instanceof Number) return ((Number) value).intValue();
        return 0;
    }
}
