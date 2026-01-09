# Frontend - Phaser 3 Game Client

Dune RTS game client built with Phaser 3, Vite, and TypeScript.

## Quick Start

```bash
pnpm dev              # Start dev server (http://localhost:5173)
pnpm build            # Production build
pnpm preview          # Preview production build
pnpm test             # Run tests
pnpm typecheck        # Type check
```

## Structure

```
src/
├── main.ts           # Entry point, creates Phaser.Game
├── config.ts         # Game configuration constants
├── vite-env.d.ts     # Vite type definitions
└── scenes/
    ├── BootScene.ts      # Initial boot, minimal loading
    ├── PreloaderScene.ts # Asset loading with progress bar
    └── GameScene.ts      # Main game scene

public/assets/        # Static assets (served at /assets/)
```

## Game Configuration

| Setting | Value |
|---------|-------|
| Resolution | 1280x720 |
| Tile size | 32px |
| Map size | 40x22 tiles |
| Colyseus URL | ws://localhost:2567 |

## Asset Loading

**Import method** (bundled, for small assets):
```typescript
import logoImg from './assets/logo.png';
this.load.image('logo', logoImg);
```

**Static method** (from public/, for large assets):
```typescript
this.load.image('tileset', 'assets/tileset.png');
```

## Colyseus Connection

The client connects to the Colyseus server via WebSocket:

```typescript
import { Client } from 'colyseus.js';

const client = new Client('ws://localhost:2567');
const room = await client.joinOrCreate('game_room');
```

Vite proxies `/colyseus` to backend during development.

## Testing

Tests use Vitest. Focus on pure logic functions, not Phaser rendering:

```bash
pnpm test             # Run once
pnpm test:watch       # Watch mode
```

## Process Cleanup

Do not leave the dev server running. Kill with:

```bash
pkill -f "vite"       # Or Ctrl+C in terminal
```
