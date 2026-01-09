// Process-level singleton to track clientId -> roomId mapping
// Prevents same clientId from joining multiple rooms

class ClientRegistryClass {
  private registry = new Map<string, string>();

  register(clientId: string, roomId: string): boolean {
    const existingRoomId = this.registry.get(clientId);
    if (existingRoomId && existingRoomId !== roomId) {
      return false;
    }
    this.registry.set(clientId, roomId);
    return true;
  }

  unregister(clientId: string, roomId: string): void {
    if (this.registry.get(clientId) === roomId) {
      this.registry.delete(clientId);
    }
  }

  isRegistered(clientId: string): boolean {
    return this.registry.has(clientId);
  }

  getRoomId(clientId: string): string | undefined {
    return this.registry.get(clientId);
  }

  // For testing purposes
  clear(): void {
    this.registry.clear();
  }
}

export const ClientRegistry = new ClientRegistryClass();
