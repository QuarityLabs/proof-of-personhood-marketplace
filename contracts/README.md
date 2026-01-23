# Contracts

EVM Smart Contracts for Proof of Personhood on Polkadot Asset Hub.

## Tech Stack

- **Solidity**: ^0.8.23
- **Foundry**: Development framework
- **Revive Compiler**: Polkadot Asset Hub compatible EVM compiler
- **OpenZeppelin**: Security-audited contract library

## Architecture

### Revive Compiler

Polkadot Asset Hub uses EVM+ with the Revive compiler, which provides:

- EVM compatibility for Solidity smart contracts
- Full support for standard Solidity features
- Optimized gas usage for Polkadot's parachain architecture
- Seamless integration with Polkadot's cross-chain messaging (XCM)

### Contract Structure

```
src/
├── ProofOfPersonhood.sol    # Core attestations contract
test/
├── ProofOfPersonhood.t.sol   # Test suite
script/
└── Deploy.s.sol              # Deployment scripts
```

## Development

### Install Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Install Dependencies

```bash
forge install
```

### Build

```bash
forge build
```

### Test

```bash
forge test
```

### Format

```bash
forge fmt
```

## Deployment

Deploy to Polkadot Asset Hub using the configured RPC endpoints in `Foundry.toml`.

## License

MIT
