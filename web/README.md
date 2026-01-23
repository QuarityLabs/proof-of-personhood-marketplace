# Web

Web frontend for Proof of Personhood.

## Tech Stack

- **React**: ^18.2.0
- **TypeScript**: For type safety
- **Vite**: Build tool and dev server
- **Vitest**: Testing framework
- **React Testing Library**: Component testing

## Architecture

```
src/
├── components/    # Reusable UI components
├── pages/         # Page components
├── services/      # API/Blockchain services
└── __tests__/     # Test files
```

## Development

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
npm run lint:fix
```

### Type Check

```bash
npm run type-check
```

### Test

```bash
npm test
```

## Features (Planned)

- Proof-of-personhood attestation viewing
- Verification status dashboard
- Attestor management interface
- Polkadot Asset Hub contract interaction

## License

MIT
