# Backend - Colyseus Game Server

Dune RTS game server built with Colyseus, Express, and TypeScript.

## Quick Start

```bash
pnpm dev              # Start dev server with hot reload (tsx watch)
pnpm build            # Compile TypeScript
pnpm start            # Run compiled server
pnpm test             # Run tests
pnpm typecheck        # Type check
```

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `ws://localhost:2567` | WebSocket (Colyseus) |
| `GET /health` | Health check |
| `GET /monitor` | Colyseus monitor panel (dev only) |

## Structure

```
src/
├── index.ts          # Server entry point
├── config.ts         # Configuration (port, env)
└── rooms/
    ├── GameRoom.ts   # Main game room handler
    └── schema/
        └── GameState.ts  # Colyseus state schemas
```

## Room Definition

Rooms are defined in `src/rooms/`. Current rooms:

| Room | Max Clients | Description |
|------|-------------|-------------|
| `game_room` | 4 | Main RTS game room |

## State Schemas

Colyseus schemas use decorators for binary serialization:

```typescript
import { Schema, type, MapSchema } from '@colyseus/schema';

export class Player extends Schema {
  @type('string') id: string = '';
  @type('string') name: string = '';
  @type('number') resources: number = 0;
}

export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 2567 | Server port |
| `NODE_ENV` | development | Environment |
| `MONITOR_PASSWORD` | admin | Monitor auth (when enabled) |

## Testing

Tests use Vitest:

```bash
pnpm test             # Run once
pnpm test:watch       # Watch mode
```

## Production Deployment

1. Build: `pnpm build`
2. Run: `NODE_ENV=production pnpm start`
3. Use process manager (PM2) for reliability

## Process Cleanup

Do not leave the dev server running. Kill with:

```bash
pkill -f "tsx watch"  # Or Ctrl+C in terminal
```
