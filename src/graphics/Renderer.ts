import * as THREE from 'three';
import { SCREEN } from '../utils/Constants';

/**
 * Three.js レンダラーの初期化と管理
 */
export class GameRenderer {
  private renderer: THREE.WebGLRenderer;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    // WebGLRendererの初期化
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true, // 透明背景を有効化
      antialias: true, // アンチエイリアスを有効化
    });

    // レンダラーの設定
    this.renderer.setSize(SCREEN.WIDTH, SCREEN.HEIGHT);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // イベントリスナー設定
    this.setupEventListeners();
  }

  /**
   * ウィンドウリサイズイベントの設定
   */
  private setupEventListeners(): void {
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  /**
   * リサイズハンドラー
   */
  private handleResize(): void {
    // スマホ画面に合わせてリサイズ
    const width = window.innerWidth;
    const height = window.innerHeight;

    // アスペクト比を維持しながらフィット
    let renderWidth = width;
    let renderHeight = height;

    const windowAspect = width / height;
    const gameAspect = SCREEN.ASPECT_RATIO;

    if (windowAspect > gameAspect) {
      // 画面が横長の場合、高さを基準にする
      renderWidth = height * gameAspect;
    } else {
      // 画面が縦長の場合、幅を基準にする
      renderHeight = width / gameAspect;
    }

    this.canvas.style.width = `${renderWidth}px`;
    this.canvas.style.height = `${renderHeight}px`;
  }

  /**
   * シーンをレンダリング
   */
  render(scene: THREE.Scene, camera: THREE.Camera): void {
    this.renderer.render(scene, camera);
  }

  /**
   * レンダラーを取得
   */
  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  /**
   * リソースを破棄
   */
  dispose(): void {
    window.removeEventListener('resize', this.handleResize.bind(this));
    this.renderer.dispose();
  }

  /**
   * 初期リサイズを実行
   */
  initialResize(): void {
    this.handleResize();
  }
}
