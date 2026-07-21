package com.kiwoom.sdk;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kiwoom.sdk.auth.KiwoomAuth;
import com.kiwoom.sdk.client.KiwoomHttpClient;
import com.kiwoom.sdk.models.Market;
import com.kiwoom.sdk.services.DomesticAccountService;
import com.kiwoom.sdk.services.DomesticOrderService;
import com.kiwoom.sdk.services.OverseasAccountService;
import com.kiwoom.sdk.services.OverseasOrderService;

import java.io.IOException;

public class KiwoomClient implements AutoCloseable {
    private final KiwoomAuth auth;
    private final KiwoomHttpClient http;
    private final DomesticAccountService domesticAccount;
    private final DomesticOrderService domesticOrder;
    private final OverseasAccountService overseasAccount;
    private final OverseasOrderService overseasOrder;

    public KiwoomClient(String appKey, String appSecret, String market, int timeout) {
        Market m = "demo".equals(market) ? Market.DEMO : Market.REAL;
        this.auth = new KiwoomAuth(appKey, appSecret, m, timeout);
        this.http = new KiwoomHttpClient(auth, timeout);
        this.domesticAccount = new DomesticAccountService(auth, http);
        this.domesticOrder = new DomesticOrderService(auth, http);
        this.overseasAccount = new OverseasAccountService(auth, http);
        this.overseasOrder = new OverseasOrderService(auth, http);
    }

    public KiwoomClient(String appKey, String appSecret, String market) {
        this(appKey, appSecret, market, 30);
    }

    public KiwoomClient(String appKey, String appSecret) {
        this(appKey, appSecret, "real", 30);
    }

    public String auth() throws IOException {
        return this.auth.issueToken();
    }

    public DomesticAccountService domesticAccount() { return domesticAccount; }
    public DomesticOrderService domesticOrder() { return domesticOrder; }
    public OverseasAccountService overseasAccount() { return overseasAccount; }
    public OverseasOrderService overseasOrder() { return overseasOrder; }

    @Override
    public void close() {}
}
