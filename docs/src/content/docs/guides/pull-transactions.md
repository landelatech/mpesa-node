---
title: Pull Transactions
description: Register a shortcode for pull access and query recent C2B transactions for reconciliation.
sidebar:
  order: 8
---

## What this API is for

Pull Transactions is a reconciliation flow for merchants running C2B collections on a paybill or till.

Use it when:

- you need a second source of truth for recent customer payments
- confirmation callbacks were delayed, dropped, or never reached your systems
- operations or finance teams need to compare received callbacks against Safaricom transaction history

This API is not a replacement for your normal confirmation callbacks. It is a recovery and reconciliation tool.

## What the SDK supports

PesaKit exposes the two Daraja calls as:

- `mpesa.pull.register()` to register your shortcode, nominated Safaricom number, and callback URL
- `mpesa.pull.query()` to fetch recent transactions for a registered shortcode

## Register the shortcode

Safaricom requires a registration step before you can query transactions.

```ts
await mpesa.pull.register({
  nominatedNumber: "254722000000",
  callbackUrl: "https://example.com/mpesa/pull/register",
});
```

### Registration notes

- The nominated number should be a Safaricom MSISDN associated with the business account.
- Use a public HTTPS callback URL in production.
- Safaricom can send registration confirmations and related notifications to the callback you register here.

## Query recent transactions

```ts
const response = await mpesa.pull.query({
  startDate: "2026-03-10 08:00:00",
  endDate: "2026-03-11 08:00:00",
  offSetValue: 0,
});

for (const tx of response.Transactions) {
  console.log(tx.transactionId, tx.amount, tx.billreference);
}
```

## Important behavior

- Daraja positions this API as a recent-history reconciliation flow, not a long-term statement export.
- The query window is limited to recent transactions, commonly the last 48 hours.
- Pagination uses `offSetValue`, not page numbers.
- The API is especially useful for C2B/paybill reconciliation after callback delivery problems.

## Filters

If your Daraja profile supports narrower pull filters, provide `filterType` and `filterValue` together:

```ts
await mpesa.pull.query({
  startDate: "2026-03-10 08:00:00",
  endDate: "2026-03-11 08:00:00",
  filterType: "MSISDN",
  filterValue: "254722000000",
});
```

The SDK requires both fields together so you do not accidentally submit a partial filter.

## SDK behavior

- `shortCode` is read from the client config unless you override it per call.
- `offSetValue` defaults to `0`.
- `startDate` and `endDate` must use `YYYY-MM-DD HH:MM:SS`.
- The SDK normalizes the transaction list onto `response.Transactions` even if Daraja returns a lowercase `transactions` field.

## Operational recommendation

Use Pull Transactions as part of a recovery loop:

1. Receive and persist normal confirmation callbacks first.
2. Mark records as `timed_out` or `needs_review` when callbacks are missing.
3. Run `mpesa.pull.query()` for the affected time window.
4. Match transactions using bill reference, MSISDN, amount, and your own internal correlation data.
5. Escalate any ambiguous mismatches instead of auto-crediting blindly.

## Related docs

- [C2B collections](/guides/c2b/)
- [Callbacks and local testing](/guides/callbacks/)
- [Callback reliability and reconciliation](/operations/callback-reliability/)
