# OIDC-VC

A TypeScript library for working with OpenID Connect for Verifiable Credentials (OIDC-VC).

## Features

- TypeScript support with full type definitions
- Verifiable Credential validation and creation
- Verifiable Presentation validation
- Modern build system with Vite
- Comprehensive testing with Vitest

## Installation

```bash
npm install oidc-vc
```

## Usage

```typescript
import { createCredential, validateCredential, validatePresentation } from 'oidc-vc'

// Create a verifiable credential
const credential = createCredential(
  'urn:uuid:12345678-1234-1234-1234-123456789abc',
  'did:example:123',
  {
    id: 'did:example:456',
    name: 'John Doe'
  }
)

// Validate a credential
const isValid = validateCredential(credential)

// Validate a presentation
const presentation = {
  '@context': ['https://www.w3.org/2018/credentials/v1'],
  type: ['VerifiablePresentation'],
  verifiableCredential: [credential]
}

const isPresentationValid = validatePresentation(presentation)
```

## Development

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the library
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage
- `npm run type-check` - Type check without emitting
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Project Structure

```
src/
├── index.ts          # Main entry point
├── types.ts          # TypeScript type definitions
├── utils.ts          # Utility functions
└── __tests__/        # Test files
    └── utils.spec.ts
```

### Building

The library is built using Vite with the following outputs:
- `dist/index.js` - CommonJS bundle
- `dist/index.mjs` - ES module bundle
- `dist/index.d.ts` - TypeScript declarations

### Testing

Tests are written using Vitest and follow the naming convention `*.spec.ts`. Test files are placed in `__tests__` directories alongside the source files.

## License

MIT