package com.kiwoom.sdk.client;

import java.util.Map;

public class KiwoomResponse {
    public Map<String, Object> body;
    public int statusCode;
    public boolean hasContinuation;
    public String nextKey;
}
