# Mobile

React Native mobile application for Proof of Personhood marketplace - Secure Signer for off-chain communication.

## Tech Stack

- **React Native**: 0.73.0
- **TypeScript**: For type safety
- **Testing**: Jest + React Native Testing Library
- **ethers.js**: Ethereum wallet and signing
- **react-native-keychain**: Secure key storage
- **react-native-camera**: QR code scanning
- **React Navigation**: Stack navigation

## Architecture

```text
src/
├── components/    # Reusable UI components (QRScanner, SignRequestDetail, SignatureResponse)
├── screens/       # Screen components (Home, Wallet, Portfolio, SignRequest)
├── services/      # API/Blockchain services (WalletService, SignRequestParser, SignerService)
├── types/         # TypeScript types
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

## Features

### Wallet Management
- Create new Ethereum wallet with secure key generation
- Import existing wallet from private key
- Secure key storage using react-native-keychain
- Backup status tracking
- Clear wallet functionality

### Sign Request Processing
- QR code scanner for sign requests
- Parse and validate off-chain sign requests
- Verify renter signature on requests
- Request expiry checking (5-minute validity)
- Sign payloads with wallet's private key
- Generate signature response for renter

### Portfolio Management
- View active rentals as lender
- Display earnings and rental statistics
- Track pending sign requests
- Monitor lender offences
- Show offer expiry dates

### Security
- All private keys stored securely in device keychain
- Signature verification for all requests
- Request validation before signing
- User confirmation required for all signatures

## Protocol v2.0 - Off-Chain Communication

The mobile app implements the off-chain first communication protocol:

1. **Renter sends Sign-Request** (off-chain, signed by renter)
   - Contains: offerId, requestId, timestamp, expected payload

2. **Lender scans QR code** and validates request
   - Validates structure, timestamp, payload format
   - Verifies renter signature
   - Shows request details for user approval

3. **Lender signs payload** and returns signature
   - Signs requested payload with private key
   - Returns signature in QR format

4. **Renter receives signature** and sends ACK
   - Acknowledges receipt before next request

**Note:** On-chain interaction (dispute submission) is handled by the web app. The mobile app is primarily for secure off-chain signing.

## License

MIT
