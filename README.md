# Proof of Personhood

A monorepo for a decentralized proof-of-personhood system built on Polkadot Asset Hub using the Revive compiler.

## Architecture Overview

```
proof-of-personhood/
├── contracts/          # EVM Smart Contracts (Solidity + Revive)
├── mobile/            # React Native app for auth/confirmation
├── web/               # Web frontend
├── .github/workflows/ # CI/CD pipelines
└── setup-repo.sh      # GitHub repository setup script
```

## Tech Stack

### Contracts (`/contracts`)

- **Solidity**: ^0.8.23
- **Foundry**: Development framework
- **Revive Compiler**: Polkadot Asset Hub compatible EVM compiler
- **OpenZeppelin**: Security-audited contract library

#### Revive Compiler

The Revive compiler is a specialized Solidity compiler designed for Polkadot's EVM-compatible chains (Asset Hub). It provides:

- Full EVM compatibility for standard Solidity contracts
- Optimized gas usage for Polkadot's parachain architecture
- Support for XCM (Cross-Chain Messaging) for cross-chain interactions
- Seamless integration with Polkadot's unique runtime environment

**Why Revive?**

Traditional EVM compilers don't account for Polkadot's unique architecture. The Revive compiler is specifically optimized for:
- Asset Hub's gas metering model
- Cross-chain message passing via XCM
- Polkadot's consensus and finality mechanisms
- Asset Hub's native asset interactions

### Mobile (`/mobile`)

- **React Native**: 0.73.0
- **TypeScript**: Type-safe development
- **Jest**: Testing framework
- **React Native Testing Library**: Component testing

The mobile app enables users to:
- Authenticate their identity
- Confirm proof-of-personhood attestations
- Interact with Polkadot wallet providers
- Track verification status

### Web (`/web`)

- **React**: ^18.2.0
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Vitest**: Testing framework
- **React Testing Library**: Component testing
- **Styling**: Windows 95 Theme (using `react95` + `styled-components` + `tailwindcss`)

The web interface provides:
- Public view of attestations
- Attestor management dashboard
- Verification status tracking
- Contract interaction interface

## Getting Started

### Prerequisites

- Node.js 18+
- Foundry (for contracts)
- GitHub CLI (`gh`) for repo setup

### Clone the Repository

```bash
git clone <repository-url>
cd proof-of-personhood
```

### Setup GitHub Repository

Run the setup script to configure branch protection:

```bash
./setup-repo.sh
```

This configures:
- Pull requests required for main branch
- CI status checks required
- Force push disabled
- Branch deletion disabled

### Contracts Development

```bash
cd contracts
forge install      # Install dependencies
forge build        # Build contracts
forge test         # Run tests
forge fmt          # Format code
```

### Mobile Development

```bash
cd mobile
npm install        # Install dependencies
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run lint       # Lint code
npm test           # Run tests
```

### Web Development

```bash
cd web
npm install        # Install dependencies
npm run dev        # Start dev server
npm run build      # Build for production
npm run lint       # Lint code
npm test           # Run tests
```

## CI/CD

GitHub Actions automatically runs on every push and pull request:

- **Contracts**: Format check, build, and test with Foundry
- **Mobile**: Lint, type-check, and test
- **Web**: Lint, type-check, build, and test

See `.github/workflows/ci.yml` for details.

## Polkadot Asset Hub

This project is built on Polkadot Asset Hub, a parachain that provides:

- EVM compatibility through the Frontier/EVM+ pallet
- Native asset support and management
- Cross-chain messaging via XCM
- Shared security with the Polkadot relay chain

The Revive compiler is specifically designed to compile Solidity contracts that run optimally on this infrastructure.

## License

MIT
