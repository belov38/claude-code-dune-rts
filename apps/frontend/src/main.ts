import Phaser from 'phaser';
import { gameConfig } from './config';
import { BootScene } from './scenes/BootScene';
import { PreloaderScene } from './scenes/PreloaderScene';
import { LobbyScene } from './scenes/LobbyScene';
import { GameScene } from './scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
  ...gameConfig,
  scene: [BootScene, PreloaderScene, LobbyScene, GameScene],
  dom: {
    createContainer: true,
  },
};

new Phaser.Game(config);
