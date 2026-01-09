import { Room, Client, Deferred } from 'colyseus';
import { GameState, Player } from './schema/GameState.js';
import { ClientRegistry } from '../registry/ClientRegistry.js';

interface GameJoinOptions {
  clientId: string;
  name?: string;
}

interface MoveData {
  unitIds: string[];
  x: number;
  y: number;
}

interface AttackData {
  unitIds: string[];
  targetId: string;
}

export class Game1v1Room extends Room<GameState> {
  maxClients = 2;

  // Map sessionId -> clientId for lookups
  private sessionToClientId = new Map<string, string>();

  // Map clientId -> reconnection deferred for manual rejection
  private reconnections = new Map<string, Deferred<Client>>();

  onCreate(_options: Record<string, unknown>): void {
    this.setState(new GameState());

    // Set metadata for lobby listing
    this.setMetadata({
      playerCount: 0,
      maxPlayers: this.maxClients,
      status: 'waiting',
      mapWidth: this.state.mapWidth,
      mapHeight: this.state.mapHeight,
    });

    // Simulation interval at 100ms (10 ticks/second)
    this.setSimulationInterval((deltaTime) => {
      this.update(deltaTime);
    }, 100);

    // Message handlers
    this.onMessage('move', (client, data: MoveData) => {
      console.log(`Player ${client.sessionId} moving units:`, data);
    });

    this.onMessage('attack', (client, data: AttackData) => {
      console.log(`Player ${client.sessionId} attacking:`, data);
    });

    console.log(`Game1v1Room created: ${this.roomId}`);
  }

  onAuth(_client: Client, options: GameJoinOptions): boolean | GameJoinOptions {
    // Validate clientId is provided
    if (!options.clientId || typeof options.clientId !== 'string') {
      throw new Error('clientId is required');
    }

    // Check if clientId is already in a different room
    const existingRoomId = ClientRegistry.getRoomId(options.clientId);
    if (existingRoomId && existingRoomId !== this.roomId) {
      throw new Error('Client already in another room');
    }

    // Check if clientId is already in this room's players (duplicate join attempt)
    for (const [, player] of this.state.players) {
      if (player.clientId === options.clientId) {
        throw new Error('Client already in this room');
      }
    }

    return options;
  }

  onJoin(client: Client, options: GameJoinOptions): void {
    const { clientId, name } = options;

    // Register in global registry
    ClientRegistry.register(clientId, this.roomId);
    this.sessionToClientId.set(client.sessionId, clientId);

    // Create player
    const player = new Player();
    player.id = client.sessionId;
    player.clientId = clientId;
    player.name = name || `Player ${this.state.players.size + 1}`;
    player.color = this.getPlayerColor(this.state.players.size);
    player.resources = 1000;
    player.connected = true;

    this.state.players.set(client.sessionId, player);

    // Update metadata
    this.updateMetadata();

    // Check if game should start
    if (this.state.players.size === this.maxClients) {
      this.startGame();
    }

    console.log(`${player.name} joined (session: ${client.sessionId}, client: ${clientId})`);

    // Send current player list to the newly joined client
    this.sendPlayerList(client);

    // Broadcast updated player list to all clients
    this.broadcastPlayerList();
  }

  private sendPlayerList(client: Client): void {
    const playerList = this.getPlayerListData();
    client.send('playerList', playerList);
  }

  private getPlayerListData(): Array<{
    id: string;
    clientId: string;
    name: string;
    color: string;
    resources: number;
    connected: boolean;
  }> {
    return Array.from(this.state.players.values()).map((p) => ({
      id: p.id,
      clientId: p.clientId,
      name: p.name,
      color: p.color,
      resources: p.resources,
      connected: p.connected,
    }));
  }

  private broadcastPlayerList(): void {
    this.broadcast('playerList', this.getPlayerListData());
  }

  async onLeave(client: Client, consented: boolean): Promise<void> {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    const clientId = this.sessionToClientId.get(client.sessionId);

    // Mark player as disconnected
    player.connected = false;
    this.updateMetadata();
    this.broadcastPlayerList();

    console.log(`${player.name} disconnected (consented: ${consented})`);

    try {
      if (consented) {
        throw new Error('consented leave');
      }

      // Allow indefinite reconnection with manual control
      const reconnection = this.allowReconnection(client, 'manual');

      if (clientId) {
        this.reconnections.set(clientId, reconnection);
      }

      // Wait for reconnection
      await reconnection;

      // Reconnection successful
      player.connected = true;
      if (clientId) {
        this.reconnections.delete(clientId);
      }
      this.updateMetadata();
      this.broadcastPlayerList();

      console.log(`${player.name} reconnected`);
    } catch (e) {
      // Reconnection rejected or consented leave
      console.log(`${player.name} removed from room`);

      // Cleanup
      this.state.players.delete(client.sessionId);
      this.sessionToClientId.delete(client.sessionId);

      if (clientId) {
        ClientRegistry.unregister(clientId, this.roomId);
        this.reconnections.delete(clientId);
      }

      this.updateMetadata();
      this.broadcastPlayerList();
    }
  }

  onDispose(): void {
    // Cleanup all client registrations
    for (const [sessionId] of this.state.players) {
      const clientId = this.sessionToClientId.get(sessionId);
      if (clientId) {
        ClientRegistry.unregister(clientId, this.roomId);
      }
    }

    console.log(`Game1v1Room disposed: ${this.roomId}`);
  }

  private update(_deltaTime: number): void {
    if (this.state.roomStatus === 'running') {
      this.state.tick++;
    }
  }

  private startGame(): void {
    this.state.roomStatus = 'running';
    this.broadcast('gameStarted', {
      players: Array.from(this.state.players.values()).map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
      })),
    });
    this.updateMetadata();
    console.log('Game started!');
  }

  private updateMetadata(): void {
    const connectedCount = Array.from(this.state.players.values()).filter(
      (p) => p.connected
    ).length;

    this.setMetadata({
      playerCount: connectedCount,
      maxPlayers: this.maxClients,
      status: this.state.roomStatus,
      mapWidth: this.state.mapWidth,
      mapHeight: this.state.mapHeight,
    });
  }

  private getPlayerColor(index: number): string {
    const colors = ['#ff0000', '#0000ff'];
    return colors[index % colors.length];
  }
}
