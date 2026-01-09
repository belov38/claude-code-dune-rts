import { Room, Client } from 'colyseus';
import { GameState, Player } from './schema/GameState.js';

interface MoveData {
  unitIds: string[];
  x: number;
  y: number;
}

interface AttackData {
  unitIds: string[];
  targetId: string;
}

interface JoinOptions {
  name?: string;
}

export class GameRoom extends Room<GameState> {
  maxClients = 4;

  onCreate(_options: Record<string, unknown>): void {
    this.setState(new GameState());

    this.onMessage('move', (client, data: MoveData) => {
      console.log(`Player ${client.sessionId} moving units:`, data);
    });

    this.onMessage('attack', (client, data: AttackData) => {
      console.log(`Player ${client.sessionId} attacking:`, data);
    });

    console.log('GameRoom created');
  }

  onJoin(client: Client, options: JoinOptions): void {
    const player = new Player();
    player.id = client.sessionId;
    player.name = options.name || `Player ${this.state.players.size + 1}`;
    player.color = this.getPlayerColor(this.state.players.size);
    player.resources = 1000;

    this.state.players.set(client.sessionId, player);

    console.log(`${player.name} joined (${client.sessionId})`);
  }

  onLeave(client: Client, _consented: boolean): void {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      console.log(`${player.name} left (${client.sessionId})`);
      this.state.players.delete(client.sessionId);
    }
  }

  onDispose(): void {
    console.log('GameRoom disposed');
  }

  private getPlayerColor(index: number): string {
    const colors = ['#ff0000', '#0000ff', '#00ff00', '#ffff00'];
    return colors[index % colors.length];
  }
}
