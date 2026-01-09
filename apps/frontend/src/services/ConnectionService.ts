import { Client, Room } from 'colyseus.js';
import { COLYSEUS_URL } from '../config';
import type { GameJoinOptions, SessionData } from '@dune/shared';

const SESSION_KEY = 'dune_session';
const NAME_KEY = 'dune_player_name';

class ConnectionServiceClass {
  private client: Client;
  private lobbyRoom: Room | null = null;
  private gameRoom: Room | null = null;

  constructor() {
    this.client = new Client(COLYSEUS_URL);
  }

  // Session persistence
  saveSession(roomId: string, reconnectionToken: string, clientId: string, name: string): void {
    const data: SessionData = { clientId, reconnectionToken, roomId, name };
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  }

  getSession(): SessionData | null {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as SessionData;
    } catch {
      return null;
    }
  }

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  }

  // Name persistence
  saveName(name: string): void {
    localStorage.setItem(NAME_KEY, name);
  }

  getName(): string {
    return localStorage.getItem(NAME_KEY) || '';
  }

  // Get or generate clientId
  getClientId(): string {
    const session = this.getSession();
    if (session?.clientId) return session.clientId;

    // Generate new UUID
    return crypto.randomUUID();
  }

  // Lobby operations
  async joinLobby(): Promise<Room> {
    this.lobbyRoom = await this.client.joinOrCreate('lobby');
    return this.lobbyRoom;
  }

  leaveLobby(): void {
    this.lobbyRoom?.leave();
    this.lobbyRoom = null;
  }

  // Game room operations
  async createGame(options: GameJoinOptions): Promise<Room> {
    this.gameRoom = await this.client.create('game_1v1', options);
    this.saveSession(
      this.gameRoom.id,
      this.gameRoom.reconnectionToken,
      options.clientId,
      options.name || ''
    );
    return this.gameRoom;
  }

  async joinGame(roomId: string, options: GameJoinOptions): Promise<Room> {
    this.gameRoom = await this.client.joinById(roomId, options);
    this.saveSession(
      this.gameRoom.id,
      this.gameRoom.reconnectionToken,
      options.clientId,
      options.name || ''
    );
    return this.gameRoom;
  }

  async tryReconnect(): Promise<Room | null> {
    const session = this.getSession();
    if (!session?.reconnectionToken) return null;

    try {
      this.gameRoom = await this.client.reconnect(session.reconnectionToken);
      // Update token after reconnection
      this.saveSession(
        this.gameRoom.id,
        this.gameRoom.reconnectionToken,
        session.clientId,
        session.name
      );
      return this.gameRoom;
    } catch (error) {
      console.log('Reconnection failed:', error);
      this.clearSession();
      return null;
    }
  }

  leaveGame(): void {
    this.gameRoom?.leave();
    this.gameRoom = null;
    this.clearSession();
  }

  getGameRoom(): Room | null {
    return this.gameRoom;
  }

  setGameRoom(room: Room): void {
    this.gameRoom = room;
  }
}

export const ConnectionService = new ConnectionServiceClass();
