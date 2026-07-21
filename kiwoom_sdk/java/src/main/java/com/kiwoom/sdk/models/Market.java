package com.kiwoom.sdk;

public enum Market {
    REAL("real", "https://api.kiwoom.com"),
    DEMO("demo", "https://mockapi.kiwoom.com");

    private final String mode;
    private final String baseUrl;

    Market(String mode, String baseUrl) {
        this.mode = mode;
        this.baseUrl = baseUrl;
    }

    public String getMode() { return mode; }
    public String getBaseUrl() { return baseUrl; }
}
