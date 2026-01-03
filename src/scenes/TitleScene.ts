import * as THREE from 'three';
import { Scene } from './Scene';
import { Background } from '../graphics/Background';
import { settingsManager, isKeyboardDebugMode } from '../utils/Settings';

/**
 * タイトル画面
 */
export class TitleScene extends Scene {
  private background: Background | null = null;
  private uiContainer: HTMLDivElement | null = null;
  private onStartCallback: (() => void) | null = null;
  private video: HTMLVideoElement;

  constructor(video: HTMLVideoElement) {
    super();
    this.video = video;
    const showCamera = settingsManager.getCameraVisible();
    this.background = new Background(video, showCamera);
  }

  /**
   * シーンの初期化
   */
  async init(): Promise<void> {
    // 背景を追加
    if (this.background) {
      this.scene.add(this.background.getBackgroundPlane());
      this.scene.add(this.background.getOverlayPlane());
    }

    // UI要素を作成
    this.createUI();
  }

  /**
   * UI要素を作成
   */
  private createUI(): void {
    // UIコンテナを作成
    this.uiContainer = document.createElement('div');
    this.uiContainer.style.position = 'absolute';
    this.uiContainer.style.top = '0';
    this.uiContainer.style.left = '0';
    this.uiContainer.style.width = '100%';
    this.uiContainer.style.height = '100%';
    this.uiContainer.style.display = 'flex';
    this.uiContainer.style.flexDirection = 'column';
    this.uiContainer.style.justifyContent = 'center';
    this.uiContainer.style.alignItems = 'center';
    this.uiContainer.style.pointerEvents = 'none';
    this.uiContainer.style.zIndex = '100';

    // タイトル
    const title = document.createElement('h1');
    title.textContent = 'じゃんけんボクサー';
    title.style.color = '#ffffff';
    title.style.fontSize = '48px';
    title.style.fontWeight = 'bold';
    title.style.textShadow = '4px 4px 8px rgba(0, 0, 0, 0.8)';
    title.style.marginBottom = '60px';
    this.uiContainer.appendChild(title);

    // ゲーム開始ボタン
    const startButton = document.createElement('button');
    startButton.textContent = 'ゲーム開始';
    startButton.style.fontSize = '24px';
    startButton.style.padding = '15px 40px';
    startButton.style.backgroundColor = '#4444ff';
    startButton.style.color = '#ffffff';
    startButton.style.border = 'none';
    startButton.style.borderRadius = '8px';
    startButton.style.cursor = 'pointer';
    startButton.style.pointerEvents = 'auto';
    startButton.style.marginBottom = '20px';
    startButton.style.fontWeight = 'bold';
    startButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    startButton.addEventListener('click', () => {
      if (this.onStartCallback) {
        this.onStartCallback();
      }
    });
    startButton.addEventListener('mouseenter', () => {
      startButton.style.backgroundColor = '#6666ff';
    });
    startButton.addEventListener('mouseleave', () => {
      startButton.style.backgroundColor = '#4444ff';
    });
    this.uiContainer.appendChild(startButton);

    // 注意書き
    const notice = document.createElement('p');
    const isDebugMode = isKeyboardDebugMode();

    if (isDebugMode) {
      notice.textContent =
        'カメラON: 背景にカメラ映像を表示\nカメラOFF: 白い背景のみ表示\n\nジェスチャー認識で操作します\nグー・チョキ・パー\n\n🎮 デバッグモード: キーボード操作\n(1,2,3 = 左手 / 4,5,6 = 右手)';
    } else {
      notice.textContent =
        'カメラON: 背景にカメラ映像を表示\nカメラOFF: 白い背景のみ表示\n\nジェスチャー認識で操作します\nグー・チョキ・パー';
    }

    notice.style.color = '#ffffff';
    notice.style.fontSize = '14px';
    notice.style.textAlign = 'center';
    notice.style.whiteSpace = 'pre-line';
    notice.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';
    notice.style.marginBottom = '30px';
    notice.style.lineHeight = '1.6';
    this.uiContainer.appendChild(notice);

    // カメラ設定トグル
    const cameraToggleContainer = document.createElement('div');
    cameraToggleContainer.style.display = 'flex';
    cameraToggleContainer.style.alignItems = 'center';
    cameraToggleContainer.style.pointerEvents = 'auto';

    const cameraLabel = document.createElement('label');
    cameraLabel.textContent = 'カメラを表示: ';
    cameraLabel.style.color = '#ffffff';
    cameraLabel.style.fontSize = '16px';
    cameraLabel.style.marginRight = '10px';
    cameraLabel.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';

    const cameraToggle = document.createElement('input');
    cameraToggle.type = 'checkbox';
    cameraToggle.checked = settingsManager.getCameraVisible();
    cameraToggle.style.width = '20px';
    cameraToggle.style.height = '20px';
    cameraToggle.style.cursor = 'pointer';
    cameraToggle.addEventListener('change', () => {
      settingsManager.setCameraVisible(cameraToggle.checked);
    });

    cameraToggleContainer.appendChild(cameraLabel);
    cameraToggleContainer.appendChild(cameraToggle);
    this.uiContainer.appendChild(cameraToggleContainer);

    // DOMに追加
    document.body.appendChild(this.uiContainer);
  }

  /**
   * ゲーム開始コールバックを設定
   */
  onStart(callback: () => void): void {
    this.onStartCallback = callback;
  }

  /**
   * 更新処理
   */
  update(deltaTime: number): void {
    if (this.background) {
      this.background.update();
    }
  }

  /**
   * 終了処理
   */
  dispose(): void {
    if (this.background) {
      this.background.dispose();
      this.background = null;
    }

    if (this.uiContainer && this.uiContainer.parentElement) {
      this.uiContainer.parentElement.removeChild(this.uiContainer);
      this.uiContainer = null;
    }
  }
}
