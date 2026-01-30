# Contracts Workspace

**Stack:** Solidity ^0.8.23 + Foundry  
**Target:** Polkadot Asset Hub via Revive compiler

## OVERVIEW

EVM smart contracts for the Proof of Personhood lending marketplace. Uses Revive compiler for Polkadot Asset Hub compatibility.

## STRUCTURE

```
contracts/
├── src/
│   └── PersonhoodLending.sol    # Main contract
├── test/
│   └── PersonhoodLending.t.sol  # Forge tests
├── script/
│   └── PersonhoodLending.s.sol  # Deployment script
├── lib/
│   └── forge-std/               # Git submodule (Test framework)
├── foundry.toml                 # Foundry configuration
└── out/                         # Build artifacts (gitignored)
```

## CONVENTIONS

### Solidity
- **Version:** ^0.8.23
- **Compiler:** Revive (Polkadot Asset Hub EVM)
- **License:** SPDX MIT
- **Framework:** Foundry (Forge)

### Testing
- **Framework:** Forge with forge-std
- **Pattern:** Inherit from Test, use setUp()
- **Assertions:** assertEq, assertTrue, vm.expectRevert
- **Verbosity:** -vv or -vvv flags

### Project Structure
- **src/:** Contract source files
- **test/:** Test files (*.t.sol)
- **script/:** Deployment scripts (*.s.sol)
- **lib/:** Dependencies (git submodules only)
- **out/:** Build output (gitignored)
- **cache/:** Foundry cache (gitignored)

## ANTI-PATTERNS

- **NEVER** use Hardhat/Truffle — Use Foundry
- **NEVER** modify lib/forge-std/ — Git submodule
- **NEVER** commit out/ or cache/ — Gitignored
- **NEVER** use deprecated forge-std functions — Check deprecation warnings

### Smart Contract Specific
- **NEVER** accept zero address as borrower
- **NEVER** allow empty context strings
- **NEVER** accept zero duration or collateral
- **ALWAYS** validate agreement is active before completing
- **ONLY** lender can complete agreements

## COMMANDS

```bash
forge build               # Compile contracts
forge build --sizes       # Build with size report
forge test                # Run tests
forge test -vv            # Verbose test output
forge test -vvv           # Very verbose
forge fmt                 # Format code
forge fmt --check         # Check formatting (CI)
forge snapshot            # Gas snapshot
anvil                     # Local testnet
```

## CI/CD

- **Profile:** FOUNDRY_PROFILE=ci
- **Steps:** forge fmt --check → forge build --sizes → forge test -vv
- **Submodule:** Recursive checkout required

## NOTES

- **Revive compiler:** Required for Polkadot Asset Hub deployment
- **Git submodule:** lib/forge-std is a submodule (not npm)
- **Main contract:** PersonhoodLending.sol handles lending agreements
- **Events:** AgreementCreated, AgreementCompleted
- **No npm:** Contracts workspace has no package.json
