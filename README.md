# Proof of Personhood Marketplace

A decentralized marketplace for lending "personhood" context built on Polkadot Asset Hub.

## The Concept: Identity Lending

Traditional Proof of Personhood (PoP) systems verify *you are a human*. This marketplace allows you to **monetize that verification** by lending it out for specific contexts where you don't need it.

**Example:**
- You have a verified Polkadot ID.
- You don't care about voting on the **Polkadot Forum**.
- You **lend** your "Forum Personhood" to someone else anonymously.
- Since contexts are unlinked, your main identity remains safe, while the borrower gets the access they need.

## Architecture Overview

```
proof-of-personhood-marketplace/
├── contracts/          # EVM Smart Contracts (Marketplace Logic + Revive)
├── mobile/            # React Native app for managing your "Context Portfolio"
├── web/               # Win95-styled Marketplace Dashboard
├── .github/workflows/ # CI/CD pipelines
└── setup-repo.sh      # GitHub repository setup script
```

## Tech Stack

### Contracts (`/contracts`)

- **Solidity**: ^0.8.23
- **Foundry**: Development framework
- **Revive Compiler**: Polkadot Asset Hub compatible EVM compiler
- **Marketplace Logic**: Lending pools, context tokens, and anonymity wrappers.

### Mobile (`/mobile`)

- **React Native**: 0.73.0
- **TypeScript**: Type-safe development
- **Wallet Connect**: For signing lending transactions on the go.

### Web (`/web`)

- **React**: ^18.2.0
- **Windows 95 Theme**: Because finance should be fun.
- **Vite**: Fast build tool.

## Getting Started

### Prerequisites

- Node.js 18+
- Foundry
- GitHub CLI

### Clone the Repository

```bash
git clone https://github.com/QuarityLabs/proof-of-personhood-marketplace.git
cd proof-of-personhood-marketplace
```

## Polkadot Asset Hub & Revive

We use the **Revive compiler** to deploy efficient EVM contracts on Polkadot Asset Hub, leveraging XCM to verify identity signals across parachains without revealing the lender's root identity.

## License

MIT
