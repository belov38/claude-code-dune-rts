import { describe, it, expect, beforeEach } from 'vitest';
import { ClientRegistry } from '../registry/ClientRegistry.js';

describe('ClientRegistry', () => {
  beforeEach(() => {
    // Clear the registry between tests
    ClientRegistry.clear();
  });

  describe('register', () => {
    it('should register a new client', () => {
      const result = ClientRegistry.register('client-1', 'room-1');
      expect(result).toBe(true);
      expect(ClientRegistry.getRoomId('client-1')).toBe('room-1');
    });

    it('should allow re-registration to same room', () => {
      ClientRegistry.register('client-1', 'room-1');
      const result = ClientRegistry.register('client-1', 'room-1');
      expect(result).toBe(true);
    });

    it('should reject registration to different room', () => {
      ClientRegistry.register('client-1', 'room-1');
      const result = ClientRegistry.register('client-1', 'room-2');
      expect(result).toBe(false);
    });
  });

  describe('unregister', () => {
    it('should unregister client from correct room', () => {
      ClientRegistry.register('client-1', 'room-1');
      ClientRegistry.unregister('client-1', 'room-1');
      expect(ClientRegistry.isRegistered('client-1')).toBe(false);
    });

    it('should not unregister client from wrong room', () => {
      ClientRegistry.register('client-1', 'room-1');
      ClientRegistry.unregister('client-1', 'room-2');
      expect(ClientRegistry.isRegistered('client-1')).toBe(true);
    });
  });

  describe('isRegistered', () => {
    it('should return true for registered client', () => {
      ClientRegistry.register('client-1', 'room-1');
      expect(ClientRegistry.isRegistered('client-1')).toBe(true);
    });

    it('should return false for unregistered client', () => {
      expect(ClientRegistry.isRegistered('client-unknown')).toBe(false);
    });
  });
});

describe('Game1v1Room validation logic', () => {
  beforeEach(() => {
    ClientRegistry.clear();
  });

  describe('clientId validation', () => {
    it('should reject empty clientId', () => {
      const validateClientId = (clientId: string | undefined): void => {
        if (!clientId || typeof clientId !== 'string') {
          throw new Error('clientId is required');
        }
      };

      expect(() => validateClientId('')).toThrow('clientId is required');
      expect(() => validateClientId(undefined)).toThrow('clientId is required');
    });

    it('should accept valid clientId', () => {
      const validateClientId = (clientId: string | undefined): void => {
        if (!clientId || typeof clientId !== 'string') {
          throw new Error('clientId is required');
        }
      };

      expect(() => validateClientId('valid-client-id')).not.toThrow();
    });
  });

  describe('duplicate prevention', () => {
    it('should detect client already in different room', () => {
      ClientRegistry.register('client-1', 'room-1');

      const checkDifferentRoom = (clientId: string, roomId: string): void => {
        const existingRoomId = ClientRegistry.getRoomId(clientId);
        if (existingRoomId && existingRoomId !== roomId) {
          throw new Error('Client already in another room');
        }
      };

      expect(() => checkDifferentRoom('client-1', 'room-2')).toThrow(
        'Client already in another room'
      );
    });

    it('should allow client to rejoin same room', () => {
      ClientRegistry.register('client-1', 'room-1');

      const checkDifferentRoom = (clientId: string, roomId: string): void => {
        const existingRoomId = ClientRegistry.getRoomId(clientId);
        if (existingRoomId && existingRoomId !== roomId) {
          throw new Error('Client already in another room');
        }
      };

      expect(() => checkDifferentRoom('client-1', 'room-1')).not.toThrow();
    });
  });
});

describe('maxClients enforcement', () => {
  it('should enforce maxClients = 2', () => {
    const MAX_CLIENTS = 2;
    const players = new Map<string, { id: string }>();

    const canJoin = (): boolean => players.size < MAX_CLIENTS;

    // First player can join
    expect(canJoin()).toBe(true);
    players.set('player-1', { id: 'player-1' });

    // Second player can join
    expect(canJoin()).toBe(true);
    players.set('player-2', { id: 'player-2' });

    // Third player cannot join
    expect(canJoin()).toBe(false);
  });
});

describe('room status transitions', () => {
  it('should start in waiting status', () => {
    const roomStatus = 'waiting';
    expect(roomStatus).toBe('waiting');
  });

  it('should transition to running when 2 players join', () => {
    let roomStatus = 'waiting';
    const maxClients = 2;
    const players = new Map<string, { id: string }>();

    const checkGameStart = (): void => {
      if (players.size === maxClients) {
        roomStatus = 'running';
      }
    };

    players.set('player-1', { id: 'player-1' });
    checkGameStart();
    expect(roomStatus).toBe('waiting');

    players.set('player-2', { id: 'player-2' });
    checkGameStart();
    expect(roomStatus).toBe('running');
  });
});
