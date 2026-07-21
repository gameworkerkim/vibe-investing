# Kiwoom REST API TypeScript SDK

## Requirements

- Node.js 18+
- npm or bun

## Installation

```bash
npm install
npm run build
```

## Quick Start

```typescript
import { KiwoomClient } from "./src/index";

const client = new KiwoomClient("APP_KEY", "APP_SECRET", "demo");

// 1. Authenticate
const token = await client.authenticate();

// 2. List accounts
const accounts = await client.domesticAccount.listAccounts();
console.log(accounts);

// 3. Buy stock (market order)
const result = await client.domesticOrder.buy("005930", 1);

// 4. US trading
const usResult = await client.overseasOrder.buy("NVDA", 10, 0, "3", "ND");

client.close();
```
