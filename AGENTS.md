# AGENTS.md

Instructions for AI agents and contributors working in this repository.

## Project

**@landelatech/mpesa-node** — Production-ready Node.js (TypeScript) SDK for Safaricom M-Pesa Daraja APIs. Single entry class `Mpesa`, fluent API, automatic OAuth, zero boilerplate. Credentials can be provided via constructor config or **environment variables**; the SDK uses env when a value is not specified explicitly.

## Package manager

- Use **Yarn classic (v1)** for all installs, scripts, and lockfiles.
- Do not introduce npm or pnpm lockfiles.

## Credentials and configuration

- The SDK **resolves credentials from the environment** when not passed in config.
- Env vars: `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_ENVIRONMENT`, `MPESA_SHORT_CODE`, `MPESA_PASS_KEY`, `MPESA_INITIATOR_NAME`, `MPESA_SECURITY_CREDENTIAL`.
- Explicit config overrides env. Required for auth: `consumerKey` and `consumerSecret` (config or env).
- Never commit secrets; document env-based usage in README and examples.

## Codebase structure

- **`src/`** — TypeScript source (ESM, strict).
  - **`auth/`** — OAuth token fetch and in-memory cache.
  - **`clients/`** — Main `Mpesa` class and module wiring.
  - **`config.ts`** — `MpesaConfig`, `resolveConfig()`, env key constants.
  - **`errors/`** — `MpesaError`, `MpesaAuthError`, `MpesaRequestError`, `MpesaValidationError`.
  - **`http/`** — `HttpClient` (native `fetch`), throws `MpesaRequestError` on non-ok.
  - **`modules/`** — `stk`, `c2b`, `b2c`, `account`, `transaction` (typed inputs/outputs).
  - **`utils/`** — Validation (phone, URL, required) and STK password/timestamp.
- **`tests/`** — Vitest unit tests; HTTP mocked via `fetch`.
- **`examples/`** — Example scripts and `env.example`; rely on env (and optional dotenv).

## Conventions

- **TypeScript:** Strict mode, ESM, Node 18+. No runtime HTTP dependency (native `fetch`).
- **API design:** Method-based (e.g. `mpesa.stkPush()`, `mpesa.c2b.registerUrls()`). Validate inputs; throw typed SDK errors.
- **Docs:** README documents installation, quick start, **env-based config**, API overview, error handling, callbacks. Keep examples and `env.example` in sync with env var names.

## Releases

- Keep the **GitHub Actions release workflow** (`.github/workflows/release.yml`) in sync with the project (install, build, test).
- Releases are created from **version tags** (`v*`).
