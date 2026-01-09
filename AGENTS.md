# Dune RTS - Monorepo

Real-time strategy game inspired by Dune 2, built with Phaser 3 + Colyseus.

## Quick Start

```bash
pnpm install          # Install all dependencies
pnpm dev              # Start frontend + backend in parallel
pnpm dev:frontend     # Start frontend only (http://localhost:5173)
pnpm dev:backend      # Start backend only (ws://localhost:2567)
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm typecheck        # Type check all packages
pnpm lint             # Lint all packages
pnpm format           # Format all files
```

## Structure

```
apps/
├── frontend/         # Phaser 3 + Vite game client
└── backend/          # Colyseus + Express game server

packages/
└── shared/           # Shared types and protocol definitions
```

## Ports

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend WebSocket | ws://localhost:2567 |
| Backend Health | http://localhost:2567/health |
| Backend Monitor | http://localhost:2567/monitor |

## Adding Dependencies

```bash
# Add to specific package
pnpm --filter frontend add phaser
pnpm --filter backend add express

# Add dev dependency to root
pnpm add -D -w eslint
```

## Conventions

- **TypeScript**: Strict mode, no `any` types allowed
- **Comments**: English only
- **Module system**: ESM (`"type": "module"`)
- **Formatting**: Prettier (run `pnpm format`)
- **Linting**: ESLint with typescript-eslint

## Workspace Dependencies

Use `workspace:*` protocol for internal packages:

```json
{
  "dependencies": {
    "@dune/shared": "workspace:*"
  }
}
```

## Process Management

**Do not leave dev servers running.** Always kill processes after testing:

```bash
pkill -f "tsx watch"      # Kill backend dev server
pkill -f "vite"           # Kill frontend dev server
```

Or use Ctrl+C in the terminal running `pnpm dev`.

Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.