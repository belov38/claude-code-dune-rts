export interface Position {
  x: number;
  y: number;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  resources: number;
}

export interface Unit {
  id: string;
  type: UnitType;
  owner: string;
  position: Position;
  health: number;
  maxHealth: number;
}

export enum UnitType {
  Harvester = 'harvester',
  Infantry = 'infantry',
  Tank = 'tank',
}

export interface Building {
  id: string;
  type: BuildingType;
  owner: string;
  position: Position;
  health: number;
  maxHealth: number;
}

export enum BuildingType {
  Base = 'base',
  Barracks = 'barracks',
  Factory = 'factory',
  Refinery = 'refinery',
}

export type ClientMessage =
  | { type: 'move'; unitIds: string[]; target: Position }
  | { type: 'attack'; unitIds: string[]; targetId: string }
  | { type: 'build'; buildingType: BuildingType; position: Position }
  | { type: 'train'; buildingId: string; unitType: UnitType };

export type ServerMessage =
  | { type: 'gameStarted'; players: Player[] }
  | { type: 'unitSpawned'; unit: Unit }
  | { type: 'unitMoved'; unitId: string; position: Position }
  | { type: 'unitDestroyed'; unitId: string }
  | { type: 'buildingPlaced'; building: Building }
  | { type: 'buildingDestroyed'; buildingId: string }
  | { type: 'resourcesUpdated'; playerId: string; resources: number };
