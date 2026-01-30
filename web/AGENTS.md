# Web Workspace

**Stack:** React 18 + Vite 5 + TypeScript + Vitest  
**Theme:** Windows 95 (react95)

## OVERVIEW

Vite-based React frontend with Windows 95 retro styling for the Proof of Personhood marketplace.

## STRUCTURE

```
web/
├── src/
│   ├── App.tsx          # Root component
│   ├── main.tsx         # Entry point
│   ├── __tests__/       # Vitest tests
│   └── vite-env.d.ts    # Vite types
├── index.html           # HTML entry
├── vite.config.ts       # Vite + Vitest config
└── package.json
```

## CONVENTIONS

### TypeScript
- **Strict:** All strict checks enabled
- **Paths:** `@/*` → `src/*`
- **No unused:** Locals and parameters must be used

### Linting
- **Zero warnings:** `--max-warnings 0`
- **React Refresh:** `only-export-components` rule enforced
- **Unused disables:** Reported as errors

### Testing
- **Framework:** Vitest (NOT Jest)
- **Environment:** jsdom
- **Setup:** `src/__tests__/setup.ts`
- **CI flag:** `--run` (non-watch mode)

### Styling
- **Primary:** Tailwind CSS 3.4
- **Components:** styled-components
- **Theme:** react95 (Windows 95 UI)
- **PostCSS:** Tailwind + autoprefixer

## ANTI-PATTERNS

- **NEVER** use Jest — Use Vitest
- **NEVER** commit with warnings — CI fails
- **NEVER** leave `eslint-disable` unused — CI checks
- **ALWAYS** run `type-check` before commit

## COMMANDS

```bash
npm run dev          # Vite dev server (port 3000)
npm run build        # TypeScript + Vite build
npm run lint         # ESLint with zero warnings
npm run lint:fix     # Auto-fix lint issues
npm run type-check   # tsc --noEmit
npm test             # Vitest
```

## NOTES

- **No public/ folder:** Static assets handled differently
- **Sourcemaps:** Enabled in build
- **Auto-open:** Browser opens on `npm run dev`
- **Minimal:** Only `App.tsx`, `main.tsx`, and tests exist
