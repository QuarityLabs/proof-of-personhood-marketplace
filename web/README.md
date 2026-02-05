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

## Deployment

### Vercel (Automated)

This project is configured for automatic deployments via Vercel.

#### Setup Required

1. **Create Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free tier is sufficient)

2. **Add Repository Secrets**: In your GitHub repository settings, add these secrets:
   - `VERCEL_TOKEN` - Get this from [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - `VERCEL_ORG_ID` - Found in your Vercel project settings under "General"
   - `VERCEL_PROJECT_ID` - Also in project settings under "General"

3. **Link Project** (optional):
   ```bash
   cd web
   npx vercel link
   ```

#### How It Works

- **Pull Requests**: Every PR gets an automatic preview deployment with a unique URL
  - The bot will comment on PRs with the preview URL
  - Pushing new commits updates the same preview URL
  
- **Main Branch**: Pushes to `main` trigger production deployments

#### Manual Deployment (Alternative)

```bash
cd web
npm install -g vercel
vercel --prod    # Production
vercel           # Preview
```

## License

MIT
