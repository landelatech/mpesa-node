# @landelatech/mpesa-node


[![Build](https://github.com/landelatech/mpesa-node/actions/workflows/build.yml/badge.svg)](https://github.com/landelatech/mpesa-node/actions/workflows/build.yml)
Production-ready Node.js (TypeScript) SDK for Safaricom M-Pesa Daraja APIs. Fluent API, automatic OAuth, zero boilerplate.

- **Fluent API** — Method-based, not endpoint-based
- **Automatic auth** — OAuth token generation and in-memory caching with refresh
- **Environment support** — Sandbox and production
- **Typed** — Full TypeScript with strict mode
- **Zero hardcoded secrets** — Config via constructor or environment variables (env used when not specified)
- **Typed errors** — `MpesaAuthError`, `MpesaRequestError`, `MpesaValidationError`

## Requirements

- Node.js 20+
- Yarn (classic v1)

## Installation

```bash
yarn add @landelatech/mpesa-node
```

## Quick start

Credentials can be set in the **environment** or passed explicitly in config. The SDK reads from env when a value is not provided.

```ts
import { Mpesa } from "@landelatech/mpesa-node";

// Option 1: Rely on environment (e.g. MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_ENVIRONMENT, etc.)
const mpesa = new Mpesa({});

// Option 2: Pass config explicitly (overrides env for those fields)
const mpesa = new Mpesa({
  consumerKey: "...",
  consumerSecret: "...",
  environment: "sandbox",
  shortCode: "174379",
  passKey: "...",
});

// STK Push (Lipa Na M-Pesa Online)
const res = await mpesa.stkPush({
  phoneNumber: "254708374149",
  amount: 10,
  callbackUrl: "https://your-domain.com/callback",
  accountReference: "order-123",
  transactionDesc: "Payment for order",
});
console.log(res.CheckoutRequestID); // use with stkQuery()
```

## Configuration

Config fields are **optional**. Any value not passed is read from the environment. Explicit config always overrides env.

| Option | Env fallback | Description |
|--------|--------------|-------------|
| `consumerKey` | `MPESA_CONSUMER_KEY` | Daraja app consumer key (required with consumerSecret) |
| `consumerSecret` | `MPESA_CONSUMER_SECRET` | Daraja app consumer secret (required with consumerKey) |
| `environment` | `MPESA_ENVIRONMENT` | `"sandbox"` or `"production"` (default: sandbox) |
| `shortCode` | `MPESA_SHORT_CODE` | Paybill or Till number (for STK/C2B/B2C/balance/status) |
| `passKey` | `MPESA_PASS_KEY` | Lipa Na M-Pesa passkey (for STK Push/Query) |
| `initiatorName` | `MPESA_INITIATOR_NAME` | API operator username (for B2C/balance/status) |
| `securityCredential` | `MPESA_SECURITY_CREDENTIAL` | Encrypted initiator password (for B2C/balance/status) |

**Required for auth:** `consumerKey` and `consumerSecret` must be set (in config or env). All other fields are only needed for the APIs that use them. Never commit secrets.

## API overview

### STK Push (Lipa Na M-Pesa Online)

Initiate a payment prompt on the customer’s phone; then query status.

```ts
const res = await mpesa.stkPush({
  phoneNumber: "254708374149",
  amount: 100,
  callbackUrl: "https://example.com/stk-callback",
  accountReference: "invoice-001",
  transactionDesc: "Payment",
});
// res.CheckoutRequestID

const status = await mpesa.stkQuery({ checkoutRequestId: res.CheckoutRequestID });
```

### C2B (Customer to Business)

Register confirmation/validation URLs and (sandbox) simulate payments.

```ts
await mpesa.c2b.registerUrls({
  confirmationUrl: "https://example.com/c2b/confirm",
  validationUrl: "https://example.com/c2b/validate",
  responseType: "Completed",
});

// Sandbox only: simulate a payment
await mpesa.c2b.simulate({
  amount: 100,
  msisdn: "254712345678",
  billRefNumber: "ref-001",
});
```

### B2C (Business to Customer)

Send money to customers. Result and timeout callbacks go to your URLs.

```ts
await mpesa.b2c.send({
  recipientPhone: "254712345678",
  amount: 500,
  resultUrl: "https://example.com/b2c/result",
  queueTimeOutUrl: "https://example.com/b2c/timeout",
  remarks: "Salary",
  occasion: "January 2024",
  commandId: "SalaryPayment",
});
```

### Account balance

Request balance; Daraja sends the result to your callback URL.

```ts
await mpesa.account.balance({
  resultUrl: "https://example.com/balance/result",
  queueTimeOutUrl: "https://example.com/balance/timeout",
});
```

### Transaction status

Query status of a transaction (e.g. when callback was missed).

```ts
await mpesa.transaction.status({
  transactionId: "ABC123...",
  resultUrl: "https://example.com/status/result",
  queueTimeOutUrl: "https://example.com/status/timeout",
  remarks: "Status check",
});
```

## Error handling

The SDK throws typed errors you can catch by name or `instanceof`:

```ts
import {
  Mpesa,
  MpesaAuthError,
  MpesaRequestError,
  MpesaValidationError,
} from "@landelatech/mpesa-node";

try {
  await mpesa.stkPush({ ... });
} catch (err) {
  if (err instanceof MpesaAuthError) {
    // OAuth / token failure
  } else if (err instanceof MpesaRequestError) {
    // API 4xx/5xx or Daraja error; err.statusCode, err.responseBody
  } else if (err instanceof MpesaValidationError) {
    // Invalid input (phone, URL, etc.)
  }
}
```

## Receiving callbacks

Daraja sends **POST** requests to your URLs (STK callback, C2B confirmation/validation, B2C result, etc.). The SDK gives you:

- **Typed payloads** — `StkPushCallbackPayload`, `C2BConfirmationPayload`, `DarajaResultPayload`, etc.
- **Parsers** — validate raw `req.body` and get typed data: `parseStkPushCallback(body)`, `parseC2BConfirmation(body)`, `parseDarajaResult(body)`.
- **Rich helpers** — `getStkMetadata(payload)` for amount, receipt number, phone; `getResultParametersMap(payload)` for B2C/balance/status result parameters.
- **Optional receiver** — `createCallbackHandler({ routes })` returns an HTTP handler you can pass to `http.createServer()` or mount in Express/Fastify.

### Option 1: Use parsers in your own routes

In any POST handler, parse the body and use the typed payload:

```ts
import {
  parseStkPushCallback,
  getStkMetadata,
  parseC2BConfirmation,
  C2B_VALIDATION_ACCEPT,
  C2B_VALIDATION_REJECT,
} from "@landelatech/mpesa-node";

// STK callback
app.post("/mpesa/stk", (req, res) => {
  const payload = parseStkPushCallback(req.body);
  if (payload.ResultCode === 0) {
    const meta = getStkMetadata(payload);
    if (meta) console.log(meta.mpesaReceiptNumber, meta.amount, meta.phoneNumber);
  }
  res.json({ ResultCode: 0, ResultDesc: "Success" });
});

// C2B confirmation (payments to your paybill/till)
app.post("/mpesa/c2b/confirm", (req, res) => {
  const p = parseC2BConfirmation(req.body);
  console.log(p.TransID, p.TransAmount, p.MSISDN, p.BillRefNumber);
  res.sendStatus(200);
});

// C2B validation (accept or reject before completion)
app.post("/mpesa/c2b/validate", (req, res) => {
  const p = parseC2BValidation(req.body);
  const accept = yourValidationLogic(p); // e.g. check BillRefNumber
  res.json(accept ? C2B_VALIDATION_ACCEPT : C2B_VALIDATION_REJECT);
});
```

### Option 2: Standalone callback server

Use `createCallbackHandler` with predefined routes and pass it to Node’s `http.createServer` (no Express needed):

```ts
import { createServer } from "node:http";
import {
  createCallbackHandler,
  stkPushRoute,
  c2BConfirmationRoute,
  getStkMetadata,
} from "@landelatech/mpesa-node";

const handler = createCallbackHandler({
  routes: {
    "/mpesa/stk": stkPushRoute(async (payload) => {
      if (payload.ResultCode === 0) {
        const meta = getStkMetadata(payload);
        if (meta) await savePayment(meta.mpesaReceiptNumber, meta.amount);
      }
    }),
    "/mpesa/c2b/confirm": c2BConfirmationRoute((p) => {
      console.log(p.TransID, p.TransAmount, p.BillRefNumber);
    }),
  },
});

createServer(handler).listen(3000);
```

Handlers can **return a response override** (e.g. for C2B validation): `return { statusCode: 200, body: C2B_VALIDATION_ACCEPT };`.

### C2B registered URLs

When you call `mpesa.c2b.registerUrls()`, set **ConfirmationURL** and **ValidationURL** to the paths that handle confirmation and validation (e.g. `https://your-domain.com/mpesa/c2b/confirm` and `.../mpesa/c2b/validate`). Use the parsers or the callback handler above so you get typed payloads and can respond correctly (e.g. validation must return `C2B_VALIDATION_ACCEPT` or `C2B_VALIDATION_REJECT`).

## Examples

After building (`yarn build`), copy `examples/env.example` to `.env` in the project root and fill in your Daraja credentials. Then run:

- `node examples/stk-push.mjs` — STK Push and query
- `node examples/c2b.mjs` — Register URLs and simulate
- `node examples/callbacks-server.mjs` — Receive callbacks with typed payloads (standalone HTTP server)

Examples use `dotenv` (dev dependency) to load `.env`. Never commit `.env` or real secrets.

## Development

```bash
yarn install
yarn build
yarn test
yarn lint
yarn format:check
```

## License

MIT. See [LICENSE](./LICENSE).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).
