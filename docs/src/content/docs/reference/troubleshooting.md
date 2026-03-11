---
title: Troubleshooting
description: Common integration failures and the fastest places to look first.
sidebar:
  order: 3
---

## OAuth fails

- Confirm `consumerKey` and `consumerSecret` match the selected environment.
- Confirm you are not using production credentials against sandbox or the reverse.
- Check whether the host can reach Safaricom endpoints from your deployment environment.

## Requests are accepted but nothing completes

- Check whether your callback URLs are reachable from the public internet.
- Confirm you are persisting and inspecting async result callbacks, not only the synchronous submission response.
- Verify your timeout routes are implemented as well as the result routes.
- Review the [result and status reference](/reference/result-codes/) and [callback reliability and reconciliation](/operations/callback-reliability/) guide.

## C2B simulation fails

- Confirm you are in sandbox mode.
- Check that the shortcode is enabled for the C2B flow you are testing.
- Re-register URLs if you changed tunnel domains or environments.

## STK Push fails often

- Validate the phone number format and shortcode/passkey combination.
- Inspect callback payloads for user-cancelled or timeout outcomes.
- Make sure the paybill/till configuration matches the transaction type you are submitting.

## Balance, status, or reversal never show final state

- Those APIs are asynchronous. Confirm the result and timeout URLs are live and correctly routed.
- Persist the `ConversationID` and `OriginatorConversationID` from the submission response so you can match the later callback.

## C2B callbacks do not match portal records

- Treat missing confirmation callbacks as a reconciliation problem, not proof that the customer never paid.
- Compare the time window in the M-Pesa Org portal and run [Pull Transactions](/guides/pull-transactions/) for the affected shortcode.
- Match on bill reference, MSISDN, amount, and your own internal business record before crediting or retrying.

## You see `500.003.02` or `500.003.03`

- `500.003.02` usually means Safaricom spike-arrest throttling.
- `500.003.03` usually means your quota or TPS limit was exceeded.
- Back off, reduce concurrency, and queue work instead of hammering the same request path.
