import Phaser from 'phaser';
import { ConnectionService } from '../services/ConnectionService';

export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloaderScene' });
  }

  preload(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '20px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
  }

  async create(): Promise<void> {
    // Try to reconnect to existing session
    const room = await ConnectionService.tryReconnect();

    if (room) {
      // Reconnection successful - go directly to game
      console.log('Reconnected to room:', room.id);
      this.scene.start('GameScene', { room });
    } else {
      // No session or reconnection failed - go to lobby
      this.scene.start('LobbyScene');
    }
  }
}
