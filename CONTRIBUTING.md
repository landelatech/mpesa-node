# Contributing to @landelatech/mpesa-node

Thank you for considering contributing. This document explains how to set up the repo and what we expect from patches.

## Setup

- **Node.js** 18+
- **Yarn** (classic v1). Do not use npm or pnpm for lockfiles.

```bash
git clone https://github.com/landelatech/mpesa-node.git
cd mpesa-node
yarn install
```

## Scripts

| Command | Description |
|--------|-------------|
| `yarn build` | Compile TypeScript to `dist/` |
| `yarn test` | Run unit tests (Vitest) |
| `yarn test:watch` | Run tests in watch mode |
| `yarn lint` | Run ESLint |
| `yarn lint:fix` | ESLint with auto-fix |
| `yarn format` | Format with Prettier |
| `yarn format:check` | Check formatting |
| `yarn typecheck` | TypeScript check (`tsc --noEmit`) |

## Code style

- TypeScript strict mode.
- ESLint + Prettier; run `yarn lint` and `yarn format:check` before pushing.
- Prefer small, focused modules; keep the public API minimal and typed.

## Tests

- Unit tests live in `tests/` and use Vitest.
- Mock HTTP (e.g. `fetch`) so tests do not call real Daraja APIs.
- Run `yarn test` and ensure all tests pass before submitting a PR.

## Pull requests

1. Fork the repo and create a branch from `main`.
2. Make your changes; add or update tests as needed.
3. Run `yarn build`, `yarn test`, `yarn lint`, `yarn format:check`.
4. Open a PR with a clear description and reference any issues.
5. Do not commit `.env` or real M-Pesa credentials.

## Adding a new API (e.g. new Daraja endpoint)

1. Add types in `src/modules/<name>/types.ts`.
2. Add module in `src/modules/<name>/<name>.ts` using `HttpClient` and validation helpers.
3. Wire the module in `src/clients/mpesa-client.ts` and expose it on `Mpesa`.
4. Export public types from `src/index.ts`.
5. Add unit tests in `tests/` with mocked `fetch`.
6. Update README and examples if user-facing.

## Releases

Releases are created from version tags (e.g. `v1.0.0`). The GitHub Actions release workflow runs on tag push and publishes release notes. Do not commit version bumps in PRs; maintainers will tag and release.

## Questions

Open an issue for bugs, feature requests, or questions.
