# Mobile

React Native mobile application for Proof of Personhood user authentication and confirmation.

## Tech Stack

- **React Native**: 0.73.0
- **TypeScript**: For type safety
- **Testing**: Jest + React Native Testing Library

## Architecture

```
src/
├── components/    # Reusable UI components
├── screens/       # Screen components
├── navigation/    # Navigation configuration
├── services/      # API/Blockchain services
└── __tests__/     # Test files
```

## Development

### Install Dependencies

```bash
npm install
```

### Run on iOS

```bash
npm run ios
```

### Run on Android

```bash
npm run android
```

### Start Metro Bundler

```bash
npm start
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

- User authentication
- Proof-of-personhood confirmation
- Polkadot wallet integration
- Attestation status tracking

## License

MIT
