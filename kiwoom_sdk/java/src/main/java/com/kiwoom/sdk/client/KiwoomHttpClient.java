package com.kiwoom.sdk.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kiwoom.sdk.auth.KiwoomAuth;
import okhttp3.*;

import java.io.IOException;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

public class KiwoomHttpClient {
    private final KiwoomAuth auth;
    private final int timeout;
    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;

    public KiwoomHttpClient(KiwoomAuth auth, int timeout) {
        this.auth = auth;
        this.timeout = timeout;
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(Duration.ofSeconds(timeout))
                .readTimeout(Duration.ofSeconds(timeout))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public KiwoomResponse post(String apiId, String path, Map<String, Object> body) throws IOException {
        return post(apiId, path, body, true);
    }

    public KiwoomResponse post(String apiId, String path, Map<String, Object> body, boolean retry) throws IOException {
        String url = auth.getMarket().getBaseUrl() + path;
        String json = objectMapper.writeValueAsString(body);

        Request request = new Request.Builder()
                .url(url)
                .header("Content-Type", "application/json;charset=UTF-8")
                .header("api-id", apiId)
                .header("authorization", auth.authorizationHeader())
                .post(RequestBody.create(json, MediaType.parse("application/json;charset=UTF-8")))
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            String responseBody = response.body() != null ? response.body().string() : "{}";
            Map<String, Object> data = objectMapper.readValue(responseBody, Map.class);

            if (response.code() == 401 && retry) {
                auth.issueToken();
                return post(apiId, path, body, false);
            }

            String contYn = response.header("cont-yn");
            String nextKey = response.header("next-key");

            KiwoomResponse result = new KiwoomResponse();
            result.body = data;
            result.statusCode = response.code();
            result.hasContinuation = "Y".equals(contYn);
            result.nextKey = nextKey;
            return result;
        }
    }
}
