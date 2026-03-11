---
title: API Coverage
description: See what this SDK implements today and which Daraja areas still remain outside the package.
sidebar:
  order: 4
---

## Implemented in this SDK

- OAuth token generation and caching (handled internally rather than as a user-facing method)
- STK Push
- STK Query
- Dynamic QR generation
- C2B URL registration
- C2B sandbox simulation
- B2C payments
- Account balance
- Transaction status
- Reversal
- Callback parsing and a standalone callback handler

## Not implemented in this SDK today

- B2B transfer flows
- B2Pochi
- Pull Transactions / transaction statements
- Ratiba / standing orders
- Tax remittance
- Other QR-led flows beyond Dynamic QR generation
- Additional Daraja or portal products that may be enabled for specific accounts but are outside this package’s current scope

Daraja 3.0 exposes a broader API surface than this package currently covers. This SDK intentionally stays focused on the implemented payment and operational flows above.

## APIs intentionally out of scope for this SDK

Some Daraja APIs exist, but this package intentionally does not target them because they usually involve prior approval, commercial agreements, special onboarding, or a narrower enterprise audience than the SDK is optimized for.

These include:

- SWAP API for SIM-swap checks
- IMSI API for hashed IMSI, network-age, and swap-date signals
- Ratiba / standing orders
- B2Pochi where partner setup and wallet prerequisites apply
- Any other Daraja APIs that require commercial onboarding or non-standard Safaricom enablement before normal use

For most teams using this SDK, these APIs are outside the practical scope of a typical STK, Dynamic QR, C2B, or B2C integration. That is why they are intentionally not implemented here.

If your team needs SWAP, IMSI, Ratiba, B2Pochi, or another bespoke Daraja integration outside the core payment flows, you can reach out to [Landela Tech](https://landelatech.com/) for implementation support.

## Reading this matrix

- This page tracks SDK coverage, not an exhaustive promise about every capability available in every Safaricom account.
- Daraja product visibility and enablement can vary by profile, account approval, and portal changes.
- Use the [Safaricom API catalog](https://developer.safaricom.co.ke/apis) as the starting point for checking what is currently available to your team.
