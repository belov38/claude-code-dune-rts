import Phaser from 'phaser';
import type { Room } from 'colyseus.js';
import { ConnectionService } from '../services/ConnectionService';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, MAP_WIDTH, MAP_HEIGHT } from '../config';

interface GameSceneData {
  room: Room;
}

interface PlayerState {
  id: string;
  clientId: string;
  name: string;
  color: string;
  resources: number;
  connected: boolean;
}

export class GameScene extends Phaser.Scene {
  private room: Room | null = null;
  private playerListText: Phaser.GameObjects.Text | null = null;
  private statusText: Phaser.GameObjects.Text | null = null;
  private mapGraphics: Phaser.GameObjects.Graphics | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: GameSceneData): void {
    // Receive room from LobbyScene or reconnection
    this.room = data.room || ConnectionService.getGameRoom();
  }

  create(): void {
    if (!this.room) {
      console.error('No room available');
      this.scene.start('LobbyScene');
      return;
    }

    // Store room in service
    ConnectionService.setGameRoom(this.room);

    this.createUI();
    this.setupRoomListeners();
  }

  private createUI(): void {
    // Title
    this.add
      .text(GAME_WIDTH / 2, 30, 'DUNE RTS - Game', {
        fontSize: '32px',
        color: '#d4a574',
      })
      .setOrigin(0.5);

    // Room ID
    this.add.text(20, 20, `Room: ${this.room?.id.substring(0, 12)}...`, {
      fontSize: '14px',
      color: '#666666',
    });

    // Room status
    this.statusText = this.add.text(20, 70, 'Status: Waiting...', {
      fontSize: '20px',
      color: '#ffffff',
    });

    // Tick counter (static for now)
    this.add.text(20, 100, 'Tick: 0', {
      fontSize: '18px',
      color: '#aaaaaa',
    });

    // Player list header
    this.add.text(20, 140, 'Players:', {
      fontSize: '22px',
      color: '#ffffff',
    });

    // Player list content
    this.playerListText = this.add.text(20, 175, '', {
      fontSize: '16px',
      color: '#cccccc',
      lineSpacing: 10,
    });

    // Map preview header
    this.add
      .text(GAME_WIDTH - 220, 70, 'Map Preview', {
        fontSize: '18px',
        color: '#888888',
      })
      .setOrigin(0.5);

    // Map preview (simple grid)
    this.mapGraphics = this.add.graphics();
    this.drawMapPreview();

    // Leave button
    const leaveBtn = this.add
      .text(GAME_WIDTH - 80, 25, '[ Leave ]', {
        fontSize: '18px',
        color: '#ff4444',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    leaveBtn.on('pointerover', () => leaveBtn.setColor('#ff8888'));
    leaveBtn.on('pointerout', () => leaveBtn.setColor('#ff4444'));
    leaveBtn.on('pointerdown', () => this.leaveGame());

    // Instructions
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 30, 'Waiting for opponent to join...', {
        fontSize: '16px',
        color: '#666666',
      })
      .setOrigin(0.5);
  }

  private drawMapPreview(): void {
    if (!this.mapGraphics) return;

    const mapWidth = MAP_WIDTH;
    const mapHeight = MAP_HEIGHT;

    const previewScale = 0.25;
    const previewWidth = mapWidth * TILE_SIZE * previewScale;
    const previewHeight = mapHeight * TILE_SIZE * previewScale;
    const offsetX = GAME_WIDTH - previewWidth - 20;
    const offsetY = 90;

    // Draw grid background
    this.mapGraphics.fillStyle(0x2a2a2a, 0.9);
    this.mapGraphics.fillRect(offsetX, offsetY, previewWidth, previewHeight);

    // Draw grid border
    this.mapGraphics.lineStyle(2, 0x555555);
    this.mapGraphics.strokeRect(offsetX, offsetY, previewWidth, previewHeight);

    // Draw grid lines
    this.mapGraphics.lineStyle(1, 0x444444, 0.3);
    for (let x = 0; x <= mapWidth; x += 5) {
      this.mapGraphics.moveTo(offsetX + x * TILE_SIZE * previewScale, offsetY);
      this.mapGraphics.lineTo(offsetX + x * TILE_SIZE * previewScale, offsetY + previewHeight);
    }
    for (let y = 0; y <= mapHeight; y += 5) {
      this.mapGraphics.moveTo(offsetX, offsetY + y * TILE_SIZE * previewScale);
      this.mapGraphics.lineTo(offsetX + previewWidth, offsetY + y * TILE_SIZE * previewScale);
    }
    this.mapGraphics.strokePath();
  }

  private setupRoomListeners(): void {
    if (!this.room) return;

    // Player list message - main way to get players
    this.room.onMessage('playerList', (players: PlayerState[]) => {
      console.log('Received player list:', players);
      this.updatePlayerList(players);
    });

    // Game started message
    this.room.onMessage('gameStarted', (data: { players: PlayerState[] }) => {
      console.log('Game started!', data);
      this.statusText?.setText('Status: RUNNING');
      this.statusText?.setColor('#00ff00');
    });

    // Handle disconnection
    this.room.onLeave((code: number) => {
      console.log('Left room with code:', code);
      if (code !== 1000) {
        this.statusText?.setText('Disconnected - Refresh to reconnect');
      }
    });

    this.room.onError((code: number, message?: string) => {
      console.error('Room error:', code, message);
      this.statusText?.setText(`Error: ${message || 'Unknown'}`);
    });
  }

  private updatePlayerList(players: PlayerState[]): void {
    const playerLines: string[] = [];

    for (const player of players) {
      const name = player.name || 'Unknown';
      const isConnected = player.connected !== false;
      const statusIcon = isConnected ? '[ONLINE]' : '[OFFLINE]';
      playerLines.push(`${name} ${statusIcon}`);
    }

    this.playerListText?.setText(playerLines.join('\n') || 'No players yet');
    console.log('Updated player list, count:', playerLines.length);
  }

  private leaveGame(): void {
    ConnectionService.leaveGame();
    this.scene.start('LobbyScene');
  }

  update(_time: number, _delta: number): void {
    // Game loop updates
  }
}
