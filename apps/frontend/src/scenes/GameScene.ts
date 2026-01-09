import Phaser from 'phaser';
import { Client, Room } from 'colyseus.js';
import { COLYSEUS_URL } from '../config';

export class GameScene extends Phaser.Scene {
  private client: Client | null = null;
  private room: Room | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.add
      .text(this.cameras.main.centerX, this.cameras.main.centerY, 'Dune RTS\nGame Scene', {
        fontSize: '32px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);

    this.connectToServer();
  }

  private async connectToServer(): Promise<void> {
    try {
      this.client = new Client(COLYSEUS_URL);
      this.room = await this.client.joinOrCreate('game_room');

      console.log('Connected to room:', this.room.id);

      this.room.onStateChange((state) => {
        console.log('State changed:', state);
      });

      this.room.onMessage('*', (type, message) => {
        console.log('Message:', type, message);
      });
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  }

  update(_time: number, _delta: number): void {}
}
