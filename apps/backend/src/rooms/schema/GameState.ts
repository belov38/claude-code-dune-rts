import { Schema, MapSchema, type } from '@colyseus/schema';

export class Player extends Schema {
  @type('string') id: string = '';
  @type('string') clientId: string = '';
  @type('string') name: string = '';
  @type('string') color: string = '';
  @type('number') resources: number = 0;
  @type('boolean') connected: boolean = true;
}

export class Unit extends Schema {
  @type('string') id: string = '';
  @type('string') type: string = '';
  @type('string') owner: string = '';
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('number') health: number = 100;
  @type('number') maxHealth: number = 100;
}

export class Building extends Schema {
  @type('string') id: string = '';
  @type('string') type: string = '';
  @type('string') owner: string = '';
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('number') health: number = 100;
  @type('number') maxHealth: number = 100;
}

export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: Unit }) units = new MapSchema<Unit>();
  @type({ map: Building }) buildings = new MapSchema<Building>();
  @type('number') tick: number = 0;
  @type('string') roomStatus: string = 'waiting';
  @type('number') mapWidth: number = 40;
  @type('number') mapHeight: number = 22;
}
