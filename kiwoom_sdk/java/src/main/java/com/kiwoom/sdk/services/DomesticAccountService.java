package com.kiwoom.sdk.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kiwoom.sdk.auth.KiwoomAuth;
import com.kiwoom.sdk.client.KiwoomHttpClient;
import com.kiwoom.sdk.client.KiwoomResponse;
import com.kiwoom.sdk.models.AccountInfo;
import com.kiwoom.sdk.models.Holding;

import java.io.IOException;
import java.util.*;

public class DomesticAccountService {
    private final KiwoomAuth auth;
    private final KiwoomHttpClient http;
    private final ObjectMapper objectMapper;

    public DomesticAccountService(KiwoomAuth auth, KiwoomHttpClient http) {
        this.auth = auth;
        this.http = http;
        this.objectMapper = new ObjectMapper();
    }

    public List<AccountInfo> listAccounts() throws IOException {
        KiwoomResponse response = http.post("ka00001", "/api/dostk/acnt", new HashMap<>());
        List<Map<String, Object>> output = extractOutputList(response, "output1");
        List<AccountInfo> accounts = new ArrayList<>();
        for (Map<String, Object> entry : output) {
            AccountInfo info = new AccountInfo();
            info.setAccountNumber((String) entry.get("acnt_no"));
            info.setAccountName((String) entry.getOrDefault("acnt_name", ""));
            info.setCurrency("KRW");
            accounts.add(info);
        }
        return accounts;
    }

    public AccountInfo getBalance(String accountNumber) throws IOException {
        KiwoomResponse response = http.post("ka01690", "/api/dostk/bal",
                Map.of("acnt_no", accountNumber));
        Map<String, Object> output = extractOutputMap(response, "output1");
        if (output.isEmpty()) output = extractOutputMap(response, "output2");

        AccountInfo info = new AccountInfo();
        info.setAccountNumber(accountNumber);
        info.setDeposit(toDouble(output.get("dmst_dncl_amt")));
        info.setTotalValue(toDouble(output.get("tot_evlu_amt")));
        info.setProfitLoss(toDouble(output.get("evlu_pfls_rt")));
        info.setProfitLossRatio(toDouble(output.get("evlu_erng_rt1")));
        info.setCurrency("KRW");
        return info;
    }

    public List<Holding> listHoldings(String accountNumber) throws IOException {
        KiwoomResponse response = http.post("ka10072", "/api/dostk/hldg",
                Map.of("acnt_no", accountNumber));
        List<Map<String, Object>> output = extractOutputList(response, "output1");
        List<Holding> holdings = new ArrayList<>();
        for (Map<String, Object> entry : output) {
            Holding h = new Holding();
            h.setStockCode((String) entry.get("stk_cd"));
            h.setStockName((String) entry.getOrDefault("stk_nm", ""));
            h.setQuantity(toInt(entry.get("hldg_qty")));
            h.setAveragePrice(toDouble(entry.get("pchs_avg_pric")));
            h.setCurrentPrice(toDouble(entry.get("now_pric")));
            h.setTotalValue(toDouble(entry.get("evlu_amt")));
            h.setProfitLoss(toDouble(entry.get("evlu_pfls_amt")));
            h.setProfitLossRatio(toDouble(entry.get("evlu_pfls_rt")));
            holdings.add(h);
        }
        return holdings;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> extractOutputList(KiwoomResponse response, String key) {
        Object raw = response.body.get(key);
        if (raw instanceof List) return (List<Map<String, Object>>) raw;
        if (raw instanceof Map) return List.of((Map<String, Object>) raw);
        return List.of();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> extractOutputMap(KiwoomResponse response, String key) {
        Object raw = response.body.get(key);
        if (raw instanceof Map) return (Map<String, Object>) raw;
        if (raw instanceof List && !((List<?>) raw).isEmpty()) {
            return (Map<String, Object>) ((List<?>) raw).get(0);
        }
        return Map.of();
    }

    private double toDouble(Object value) {
        if (value instanceof Number) return ((Number) value).doubleValue();
        if (value instanceof String && !((String) value).isEmpty()) {
            try { return Double.parseDouble((String) value); } catch (NumberFormatException ignored) {}
        }
        return 0.0;
    }

    private int toInt(Object value) {
        if (value instanceof Number) return ((Number) value).intValue();
        if (value instanceof String && !((String) value).isEmpty()) {
            try { return Integer.parseInt((String) value); } catch (NumberFormatException ignored) {}
        }
        return 0;
    }
}
