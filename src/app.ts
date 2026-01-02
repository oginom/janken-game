import * as THREE from 'three';
import { GameRenderer } from './graphics/Renderer';
import { GameCamera } from './graphics/Camera';
import { assetLoader } from './assets/AssetLoader';
import { Scene } from './scenes/Scene';
import { GameState } from './game/GameState';

/**
 * アプリケーションのメインクラス
 * シーン管理とレンダリングループを担当
 */
export class App {
  private renderer: GameRenderer;
  private camera: GameCamera;
  private gameState: GameState;
  private currentScene: Scene | null = null;
  private lastTime: number = 0;
  private isRunning: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new GameRenderer(canvas);
    this.camera = new GameCamera();
    this.gameState = new GameState();
  }

  /**
   * アプリケーションの初期化
   */
  async init(): Promise<void> {
    console.log('アプリケーション初期化中...');

    // アセットを読み込み
    await assetLoader.loadAll();
    console.log('アセット読み込み完了');

    // レンダラーの初期リサイズ
    this.renderer.initialResize();

    console.log('アプリケーション初期化完了');
  }

  /**
   * シーンを切り替える
   */
  async changeScene(scene: Scene): Promise<void> {
    // 現在のシーンを破棄
    if (this.currentScene) {
      this.currentScene.dispose();
    }

    // 新しいシーンを設定
    this.currentScene = scene;
    await this.currentScene.init();

    console.log(`シーン切り替え: ${scene.constructor.name}`);
  }

  /**
   * アプリケーションを開始
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);

    console.log('アプリケーション開始');
  }

  /**
   * アプリケーションを停止
   */
  stop(): void {
    this.isRunning = false;
    console.log('アプリケーション停止');
  }

  /**
   * ゲームループ
   */
  private gameLoop = (currentTime: number): void => {
    if (!this.isRunning) return;

    requestAnimationFrame(this.gameLoop);

    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // 現在のシーンを更新
    if (this.currentScene) {
      this.currentScene.update(deltaTime);

      // レンダリング
      this.renderer.render(
        this.currentScene.getScene(),
        this.camera.getCamera()
      );
    }
  };

  /**
   * ゲーム状態を取得
   */
  getGameState(): GameState {
    return this.gameState;
  }

  /**
   * リソースを破棄
   */
  dispose(): void {
    this.stop();
    if (this.currentScene) {
      this.currentScene.dispose();
    }
    this.renderer.dispose();
    assetLoader.dispose();
  }
}
