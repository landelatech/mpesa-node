# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn build          # Bundle with tsup → dist/index.js + dist/index.d.ts
yarn test           # Run all tests (vitest)
yarn test:watch     # Run tests in watch mode
yarn lint           # Lint src/ and tests/
yarn lint:fix       # Auto-fix lint issues
yarn typecheck      # Type-check without emitting
yarn format         # Format with Prettier
yarn format:check   # Check formatting
```

Run a single test file:

```bash
yarn vitest run tests/stk.test.ts
```

## Architecture

This is an ESM TypeScript SDK (`"type": "module"`). Source lives in `src/`, compiled output in `dist/`. No runtime dependencies — uses Node's native `fetch`.

### Layer structure

- **`src/config.ts`** — `MpesaConfig` (user-facing, all optional) and `resolveConfig()` which merges constructor options with env vars. Throws `MpesaValidationError` if `consumerKey`/`consumerSecret` are missing.
- **`src/auth/`** — `AuthProvider` wraps `fetchToken()` with in-memory token caching; tokens are refreshed 60s before the ~1-hour Daraja expiry.
- **`src/http/client.ts`** — `HttpClient` wraps native `fetch`, injects Bearer token from `AuthProvider`, throws `MpesaRequestError` on non-2xx.
- **`src/clients/mpesa-client.ts`** — `Mpesa` class: wires `AuthProvider` → `HttpClient` → modules; exposes `stkPush()`/`stkQuery()` directly and `c2b`, `b2c`, `account`, `transaction` as sub-namespaces.
- **`src/modules/`** — One folder per Daraja API group (`stk`, `c2b`, `b2c`, `account`, `transaction`). Each has a `create*Module()` factory and a `types.ts`.
- **`src/callbacks/`** — Typed payload types, parsers (`parseStkPushCallback`, `parseC2BConfirmation`, etc.), helpers (`getStkMetadata`, `getResultParametersMap`), and an optional standalone HTTP handler (`createCallbackHandler`).
- **`src/errors/`** — `MpesaError` base, `MpesaAuthError`, `MpesaRequestError`, `MpesaValidationError`.
- **`src/utils/`** — `validation.ts` (phone/URL validation), `stk.ts` (password/timestamp generation).

### Key conventions

- Internal imports use no file extension — `"./clients/mpesa-client"` not `"./clients/mpesa-client.js"`. `tsconfig.json` uses `"moduleResolution": "Bundler"` which allows this; `tsup` resolves paths and emits correct ESM in `dist/`.
- Each module is a factory function (`createStkModule({ http, shortCode, passKey })`) rather than a class.
- Env var names are centralized in `MPESA_ENV_KEYS` in `config.ts`.
- Tests use `vi.stubGlobal("fetch", vi.fn())` to mock HTTP — no actual network calls. Mock `fetch` twice per test: first call is the OAuth token fetch, second is the API call.

### Test environment variables

Copy `examples/env.example` to `.env` at the project root for running examples. Tests themselves do not require env vars.
