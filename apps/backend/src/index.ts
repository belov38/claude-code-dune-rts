import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { monitor } from '@colyseus/monitor';

import { PORT, NODE_ENV } from './config.js';
import { GameRoom } from './rooms/GameRoom.js';

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

const transport = new WebSocketTransport({ server });
const gameServer = new Server({ transport });

gameServer.define('game_room', GameRoom);

if (NODE_ENV === 'development') {
  app.use('/monitor', monitor());
}

gameServer.listen(PORT).then(() => {
  console.log(`🎮 Colyseus server running on http://localhost:${PORT}`);
  console.log(`📊 Monitor: http://localhost:${PORT}/monitor`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
});
