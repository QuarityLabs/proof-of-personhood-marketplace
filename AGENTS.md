# Proof of Personhood Marketplace

**Generated:** 2026-01-30  
**Stack:** Solidity + Foundry | React + Vite | React Native  
**Target:** Polkadot Asset Hub

## OVERVIEW

Decentralized marketplace for lending "personhood" context. Three independent workspaces with no shared tooling or workspace configuration.

## STRUCTURE

```
.
├── contracts/          # Solidity smart contracts (Foundry)
├── mobile/            # React Native app
├── web/               # Vite + React frontend (Win95 theme)
└── .github/workflows/ # CI/CD for all three
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Smart contracts | `contracts/src/` | Main: `PersonhoodLending.sol` |
| Contract tests | `contracts/test/` | Foundry test format (`*.t.sol`) |
| Contract scripts | `contracts/script/` | Deployment scripts |
| Web app source | `web/src/` | React + Win95 theme |
| Mobile app source | `mobile/src/` | React Native |
| CI/CD | `.github/workflows/ci.yml` | Three parallel jobs |

## CONVENTIONS

### TypeScript (Web & Mobile)
- **Strict mode:** All strict checks enabled
- **Zero warnings:** ESLint `--max-warnings 0` enforced in CI
- **Path aliases:** `@/*` maps to `src/*` in both workspaces
- **Unused code:** Prohibited (`noUnusedLocals`, `noUnusedParameters`)

### Solidity
- **Version:** `^0.8.23`
- **Compiler:** Revive (Polkadot Asset Hub compatible)
- **Framework:** Foundry (not Hardhat/Truffle)

### Monorepo Pattern
- **No root package.json** — Each workspace is independent
- **No shared configs** — Each has its own tsconfig, eslint
- **Scoped packages:** `@proof-of-personhood/web`, `@proof-of-personhood/mobile`

## ANTI-PATTERNS

### TypeScript
- **NEVER** use `any` — Strict mode catches this
- **NEVER** leave unused variables/parameters — TypeScript errors
- **NEVER** commit with ESLint warnings — CI enforces `--max-warnings 0`
- **NEVER** add unused `eslint-disable` directives — CI checks

### Solidity
- **NEVER** use zero address for borrower
- **NEVER** allow empty context strings
- **NEVER** accept zero duration or collateral
- **ALWAYS** validate agreement is active before completing
- **ONLY** lender can complete agreements

### General
- **NEVER** modify `contracts/lib/forge-std/` — Git submodule
- **NEVER** commit build artifacts — `dist/`, `out/`, `cache/` are gitignored

## WORKSPACE-SPECIFIC

### Web (`web/`)
- **Build:** Vite (port 3000)
- **Test:** Vitest (NOT Jest)
- **Theme:** Windows 95 via `react95`
- **Styling:** Tailwind + styled-components
- **Entry:** `index.html` → `src/main.tsx` → `src/App.tsx`

### Mobile (`mobile/`)
- **Build:** React Native CLI + Metro bundler
- **Test:** Jest 29
- **Entry:** `index.js` → `src/App.tsx`
- **Node:** Requires 18+

### Contracts (`contracts/`)
- **Build:** `forge build`
- **Test:** `forge test -vv`
- **Format:** `forge fmt --check`
- **Profile:** `FOUNDRY_PROFILE=ci` in CI
- **Entry:** `src/PersonhoodLending.sol`

## CI/CD

All three workspaces run in parallel. Each must pass:
- **Contracts:** Format check, build with sizes, test verbose
- **Web:** Install, lint, build, test (Vitest --run)
- **Mobile:** Install, lint, test (Jest --passWithNoTests)

Final `CI` job aggregates all three for branch protection.

## COMMANDS

```bash
# Contracts
cd contracts && forge build && forge test -vv

# Web
cd web && npm install && npm run dev    # Port 3000
npm run lint && npm run type-check && npm test

# Mobile
cd mobile && npm install && npm run ios # or android
npm run lint && npm run type-check && npm test
```

## NOTES

- **Minimal source:** Both web and mobile have minimal implementations (only `App.tsx` + tests). READMEs reference unimplemented directories.
- **No native dirs:** Mobile lacks `ios/` and `android/` directories (expo or bare workflow not initialized).
- **Empty .sisyphus/:** Non-standard directory at root, appears custom.
- **Forge-std submodule:** Standard Foundry testing library via git submodule.
- **Win95 theme:** Web uses `react95` component library for retro styling.
