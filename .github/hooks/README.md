# Git Hooks

This directory contains shared git hooks for the repository. These hooks are not automatically installed - each developer must set them up manually.

## Available Hooks

### `pre-push`

Runs the same CI checks locally before allowing a push:

- **Contracts**: `forge fmt --check`, `forge build --sizes`, `forge test -vv`
- **Mobile**: `npm install`, `npm run lint`, `npm test -- --passWithNoTests`
- **Web**: `npm install`, `npm run lint`, `npm run build`, `npm test -- --run`

## Installation

To install the hooks, run the following command from the repository root:

```bash
# Make the hook executable and copy it to .git/hooks
cp .github/hooks/pre-push .git/hooks/pre-push
chmod +x .git/hooks/pre-push
```

Or use the shorthand:

```bash
cp .github/hooks/pre-push .git/hooks/ && chmod +x .git/hooks/pre-push
```

## Requirements

Before using the pre-push hook, ensure you have:

- [Foundry](https://getfoundry.sh/) installed (`forge` command)
- Node.js 18+ installed (`npm` command)
- All dependencies installed in `mobile/` and `web/` directories

## Skipping the Hook

If you need to bypass the pre-push hook in an emergency:

```bash
git push --no-verify
```

**Note**: This is not recommended as it bypasses all safety checks.

## Updating Hooks

When hooks are updated in the repository, repeat the installation steps to get the latest version.
