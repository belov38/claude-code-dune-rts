import Phaser from 'phaser';
import type { Room, RoomAvailable } from 'colyseus.js';
import { ConnectionService } from '../services/ConnectionService';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

interface RoomMetadata {
  playerCount: number;
  maxPlayers: number;
  status: string;
  mapWidth: number;
  mapHeight: number;
}

interface RoomListing extends RoomAvailable {
  metadata: RoomMetadata;
}

export class LobbyScene extends Phaser.Scene {
  private lobbyRoom: Room | null = null;
  private roomListings: RoomListing[] = [];
  private roomListContainer: Phaser.GameObjects.Container | null = null;
  private statusText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: 'LobbyScene' });
  }

  create(): void {
    this.createUI();
    this.connectToLobby();
  }

  private createUI(): void {
    const centerX = GAME_WIDTH / 2;

    // Title
    this.add
      .text(centerX, 50, 'DUNE RTS', {
        fontSize: '48px',
        color: '#d4a574',
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(centerX, 100, '1v1 Multiplayer', {
        fontSize: '24px',
        color: '#888888',
      })
      .setOrigin(0.5);

    // Name input label
    this.add.text(centerX - 150, 150, 'Your Name:', {
      fontSize: '20px',
      color: '#ffffff',
    });

    // Name input (using DOM element for text input)
    const savedName = ConnectionService.getName();
    const inputHTML = `<input type="text" id="nameInput" value="${savedName}"
      style="width: 200px; padding: 8px; font-size: 16px; background: #333; color: #fff; border: 1px solid #666; border-radius: 4px;"
      placeholder="Enter your name" maxlength="20">`;
    this.add.dom(centerX + 50, 158).createFromHTML(inputHTML);

    // Create Game button
    const createBtn = this.add
      .text(centerX, 220, '[ Create 1v1 Game ]', {
        fontSize: '24px',
        color: '#00ff00',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    createBtn.on('pointerover', () => createBtn.setColor('#88ff88'));
    createBtn.on('pointerout', () => createBtn.setColor('#00ff00'));
    createBtn.on('pointerdown', () => this.createGame());

    // Room list header
    this.add
      .text(centerX, 290, 'Available Games', {
        fontSize: '28px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Divider line
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x666666);
    graphics.moveTo(centerX - 200, 320);
    graphics.lineTo(centerX + 200, 320);
    graphics.strokePath();

    // Room list container
    this.roomListContainer = this.add.container(0, 340);

    // Status text
    this.statusText = this.add
      .text(centerX, GAME_HEIGHT - 40, 'Connecting to lobby...', {
        fontSize: '16px',
        color: '#888888',
      })
      .setOrigin(0.5);
  }

  private async connectToLobby(): Promise<void> {
    try {
      this.lobbyRoom = await ConnectionService.joinLobby();
      this.statusText?.setText('Connected to lobby');

      // Handle initial room list
      this.lobbyRoom.onMessage('rooms', (rooms: RoomListing[]) => {
        this.roomListings = rooms.filter(
          (r) => r.metadata?.status === 'waiting' && r.metadata?.playerCount < r.metadata?.maxPlayers
        );
        this.updateRoomList();
      });

      // Handle room added/updated
      this.lobbyRoom.onMessage('+', ([roomId, room]: [string, RoomListing]) => {
        const index = this.roomListings.findIndex((r) => r.roomId === roomId);
        const listing = { ...room, roomId } as RoomListing;

        const isJoinable =
          listing.metadata?.status === 'waiting' &&
          listing.metadata?.playerCount < listing.metadata?.maxPlayers;

        if (!isJoinable) {
          // Remove if not joinable
          if (index !== -1) {
            this.roomListings.splice(index, 1);
          }
        } else if (index !== -1) {
          this.roomListings[index] = listing;
        } else {
          this.roomListings.push(listing);
        }
        this.updateRoomList();
      });

      // Handle room removed
      this.lobbyRoom.onMessage('-', (roomId: string) => {
        this.roomListings = this.roomListings.filter((r) => r.roomId !== roomId);
        this.updateRoomList();
      });
    } catch (error) {
      console.error('Failed to connect to lobby:', error);
      this.statusText?.setText('Failed to connect to lobby');
    }
  }

  private updateRoomList(): void {
    if (!this.roomListContainer) return;

    // Clear existing list
    this.roomListContainer.removeAll(true);

    const centerX = GAME_WIDTH / 2;

    if (this.roomListings.length === 0) {
      const noRooms = this.add
        .text(centerX, 20, 'No games available. Create one!', {
          fontSize: '18px',
          color: '#666666',
        })
        .setOrigin(0.5);
      this.roomListContainer.add(noRooms);
      return;
    }

    this.roomListings.forEach((room, index) => {
      const y = index * 50 + 20;
      const playerCount = room.metadata?.playerCount || 0;
      const maxPlayers = room.metadata?.maxPlayers || 2;

      // Room info
      const roomText = this.add.text(
        centerX - 150,
        y,
        `Game ${room.roomId.substring(0, 8)}...  (${playerCount}/${maxPlayers} players)`,
        {
          fontSize: '18px',
          color: '#ffffff',
        }
      );

      // Join button
      const joinBtn = this.add
        .text(centerX + 180, y, '[ Join ]', {
          fontSize: '18px',
          color: '#00ff00',
        })
        .setInteractive({ useHandCursor: true });

      joinBtn.on('pointerover', () => joinBtn.setColor('#88ff88'));
      joinBtn.on('pointerout', () => joinBtn.setColor('#00ff00'));
      joinBtn.on('pointerdown', () => this.joinGame(room.roomId));

      this.roomListContainer!.add([roomText, joinBtn]);
    });
  }

  private getPlayerName(): string {
    const input = document.getElementById('nameInput') as HTMLInputElement;
    const name = input?.value?.trim() || `Player_${Date.now() % 10000}`;
    ConnectionService.saveName(name);
    return name;
  }

  private async createGame(): Promise<void> {
    this.statusText?.setText('Creating game...');

    try {
      const name = this.getPlayerName();
      const clientId = ConnectionService.getClientId();

      const room = await ConnectionService.createGame({ clientId, name });

      ConnectionService.leaveLobby();
      this.scene.start('GameScene', { room });
    } catch (error) {
      console.error('Failed to create game:', error);
      this.statusText?.setText(`Error: ${(error as Error).message}`);
    }
  }

  private async joinGame(roomId: string): Promise<void> {
    this.statusText?.setText('Joining game...');

    try {
      const name = this.getPlayerName();
      const clientId = ConnectionService.getClientId();

      const room = await ConnectionService.joinGame(roomId, { clientId, name });

      ConnectionService.leaveLobby();
      this.scene.start('GameScene', { room });
    } catch (error) {
      console.error('Failed to join game:', error);
      this.statusText?.setText(`Error: ${(error as Error).message}`);
    }
  }
}
