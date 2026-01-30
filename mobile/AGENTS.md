# Mobile Workspace

**Stack:** React Native 0.73 + TypeScript + Jest  
**Target:** iOS / Android

## OVERVIEW

React Native app for managing Proof of Personhood "Context Portfolio" on mobile.

## STRUCTURE

```
mobile/
├── src/
│   ├── App.tsx          # Root component
│   └── __tests__/       # Jest tests
├── index.js             # Entry point
├── app.json             # App metadata
├── jest.config.js       # Jest configuration
├── metro.config.js      # Metro bundler config
└── package.json
```

## CONVENTIONS

### TypeScript
- **Extends:** @react-native/typescript-config
- **Paths:** @/* → src/*
- **Node:** Requires 18+

### Linting
- **Preset:** @react-native/eslint-config
- **Fix:** npm run lint:fix available

### Testing
- **Framework:** Jest 29
- **Setup:** jest.setup.js
- **CI flag:** --passWithNoTests
- **Libraries:** @testing-library/react-native

### Formatting
- **Tool:** Prettier 2.8.8
- **Config:** .prettierrc

## ANTI-PATTERNS

- **NEVER** use Vitest — Use Jest
- **NEVER** commit without running lint
- **ALWAYS** run type-check before commit

## COMMANDS

```bash
npm start            # Metro bundler
npm run ios          # iOS simulator
npm run android      # Android emulator
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix issues
npm run type-check   # tsc --noEmit
npm test             # Jest
```

## NOTES

- **No ios/ directory:** Native iOS project not initialized
- **No android/ directory:** Native Android project not initialized
- **Metro:** Bundler configured via metro.config.js
- **Babel:** metro-react-native-babel-preset
- **Minimal:** Only App.tsx and tests exist in src/
