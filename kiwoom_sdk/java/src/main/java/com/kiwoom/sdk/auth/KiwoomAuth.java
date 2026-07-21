package com.kiwoom.sdk.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kiwoom.sdk.models.Market;
import okhttp3.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;

public class KiwoomAuth {
    private final String appKey;
    private final String appSecret;
    private final Market market;
    private final int timeout;
    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final Path cacheDir;

    private String accessToken;
    private Instant expiresAt;

    public KiwoomAuth(String appKey, String appSecret, Market market, int timeout) {
        this.appKey = appKey;
        this.appSecret = appSecret;
        this.market = market;
        this.timeout = timeout;
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(Duration.ofSeconds(timeout))
                .readTimeout(Duration.ofSeconds(timeout))
                .build();
        this.objectMapper = new ObjectMapper();
        this.cacheDir = Path.of(".kiwoom_cache");
        try {
            Files.createDirectories(cacheDir);
        } catch (IOException ignored) {}
    }

    public String getAccessToken() throws IOException {
        if (accessToken != null && expiresAt != null && Instant.now().isBefore(expiresAt.minusSeconds(600))) {
            return accessToken;
        }
        return issueToken();
    }

    public String issueToken() throws IOException {
        String json = objectMapper.writeValueAsString(Map.of(
                "grant_type", "client_credentials",
                "appkey", appKey,
                "secretkey", appSecret
        ));

        Request request = new Request.Builder()
                .url(market.getBaseUrl() + "/oauth2/token")
                .post(RequestBody.create(json, MediaType.parse("application/json;charset=UTF-8")))
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            String body = response.body() != null ? response.body().string() : "{}";
            Map<String, Object> data = objectMapper.readValue(body, Map.class);

            if (!response.isSuccessful()) {
                throw new IOException("Token request failed: HTTP " + response.code());
            }

            String token = (String) data.get("token");
            String expiresDt = (String) data.get("expires_dt");

            if (token == null || expiresDt == null) {
                throw new IOException("Token response missing required fields");
            }

            this.accessToken = token;
            this.expiresAt = Instant.now().plusSeconds(86400); // approx 24h
            return accessToken;
        }
    }

    public String authorizationHeader() throws IOException {
        return "Bearer " + getAccessToken();
    }

    public Market getMarket() {
        return market;
    }

    public String getAppKey() {
        return appKey;
    }

    public String getAppSecret() {
        return appSecret;
    }
}
