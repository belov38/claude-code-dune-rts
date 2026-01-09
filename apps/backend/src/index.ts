import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { Server, LobbyRoom } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { monitor } from '@colyseus/monitor';

import { PORT, NODE_ENV } from './config.js';
import { GameRoom } from './rooms/GameRoom.js';
import { Game1v1Room } from './rooms/Game1v1Room.js';

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

const transport = new WebSocketTransport({ server });
const gameServer = new Server({ transport });

// Define lobby room for room listing
gameServer.define('lobby', LobbyRoom);

// Keep legacy game room (for backwards compatibility)
gameServer.define('game_room', GameRoom);

// Define 1v1 game room with realtime listing enabled
gameServer.define('game_1v1', Game1v1Room).enableRealtimeListing();

if (NODE_ENV === 'development') {
  app.use('/monitor', monitor());
}

gameServer.listen(PORT).then(() => {
  console.log(`🎮 Colyseus server running on http://localhost:${PORT}`);
  console.log(`📊 Monitor: http://localhost:${PORT}/monitor`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
});
