# Kiwoom REST API Java SDK

## Requirements

- Java 17+
- Maven or Gradle

## Installation

```xml
<dependency>
    <groupId>com.kiwoom</groupId>
    <artifactId>kiwoom-sdk</artifactId>
    <version>0.1.0</version>
</dependency>
```

## Quick Start

```java
import com.kiwoom.sdk.KiwoomClient;
import com.kiwoom.sdk.models.*;

var client = new KiwoomClient("APP_KEY", "APP_SECRET", "demo");

// 1. Authenticate
String token = client.auth();

// 2. List accounts
for (AccountInfo acct : client.domesticAccount().listAccounts()) {
    System.out.println(acct.getAccountNumber() + ": " + acct.getAccountName());
}

// 3. Buy stock (market order)
OrderResult result = client.domesticOrder().buy("005930", 1);

// 4. US trading
OrderResult usResult = client.overseasOrder().buy("NVDA", 10, 0, "3", "ND");

client.close();
```
