import { Scene } from './Scene';
import { Background } from '../graphics/Background';
import { settingsManager, isKeyboardDebugMode } from '../utils/Settings';
import { HandTracker } from '../game/HandTracker';

/**
 * タイトル画面
 */
export class TitleScene extends Scene {
  private background: Background | null = null;
  private uiContainer: HTMLDivElement | null = null;
  private onStartCallback: (() => void) | null = null;
  private video: HTMLVideoElement;
  private handTracker: HandTracker | null = null;

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

    // カメラ表示が有効な場合、カメラを起動
    const showCamera = settingsManager.getCameraVisible();
    if (showCamera) {
      try {
        this.handTracker = new HandTracker(this.video);
        await this.handTracker.init();
        await this.handTracker.startCamera();

        // 背景にカメラ映像を表示
        if (this.background) {
          this.background.enableCameraBackground();
        }

        console.log('タイトル画面: カメラ起動完了');
      } catch (error) {
        console.error('タイトル画面: カメラ起動エラー:', error);
      }
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
        'カメラON: 背景にカメラ映像を表示\nカメラOFF: 白い背景のみ表示\n\nグー・チョキ・パーを\nジェスチャー認識で操作します\n\n🎮 デバッグモード: キーボード操作\n(1,2,3 = 左手 / 4,5,6 = 右手)';
    } else {
      notice.textContent =
        'カメラON: 背景にカメラ映像を表示\nカメラOFF: 白い背景のみ表示\n\nグー・チョキ・パーを\nジェスチャー認識で操作します';
    }

    notice.style.color = '#ffffff';
    notice.style.fontSize = '14px';
    notice.style.textAlign = 'center';
    notice.style.whiteSpace = 'pre-line';
    notice.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';
    notice.style.marginBottom = '30px';
    notice.style.lineHeight = '1.6';
    this.uiContainer.appendChild(notice);

    // 設定コンテナ（カメラと効果音）
    const settingsContainer = document.createElement('div');
    settingsContainer.style.display = 'flex';
    settingsContainer.style.flexDirection = 'column';
    settingsContainer.style.alignItems = 'flex-start';
    settingsContainer.style.gap = '10px';
    settingsContainer.style.pointerEvents = 'auto';

    // カメラ設定トグル
    const cameraToggleContainer = document.createElement('div');
    cameraToggleContainer.style.display = 'flex';
    cameraToggleContainer.style.alignItems = 'center';

    const cameraLabel = document.createElement('label');
    cameraLabel.textContent = 'カメラON/OFF: ';
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
    cameraToggle.addEventListener('change', async () => {
      settingsManager.setCameraVisible(cameraToggle.checked);

      // カメラ設定を即座に反映
      if (cameraToggle.checked) {
        // カメラON
        try {
          if (!this.handTracker) {
            this.handTracker = new HandTracker(this.video);
            await this.handTracker.init();
          }
          await this.handTracker.startCamera();

          // 背景にカメラ映像を表示
          if (this.background) {
            this.background.enableCameraBackground();
          }

          console.log('カメラON: カメラ映像を表示');
        } catch (error) {
          console.error('カメラ起動エラー:', error);
        }
      } else {
        // カメラOFF
        if (this.handTracker) {
          this.handTracker.dispose();
          this.handTracker = null;
        }

        // 白背景に戻す
        if (this.background) {
          this.background.disableCameraBackground();
        }

        console.log('カメラOFF: 白背景を表示');
      }
    });

    cameraToggleContainer.appendChild(cameraLabel);
    cameraToggleContainer.appendChild(cameraToggle);

    // 効果音設定トグル
    const soundToggleContainer = document.createElement('div');
    soundToggleContainer.style.display = 'flex';
    soundToggleContainer.style.alignItems = 'center';

    const soundLabel = document.createElement('label');
    soundLabel.textContent = '効果音: ';
    soundLabel.style.color = '#ffffff';
    soundLabel.style.fontSize = '16px';
    soundLabel.style.marginRight = '10px';
    soundLabel.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';

    const soundToggle = document.createElement('input');
    soundToggle.type = 'checkbox';
    soundToggle.checked = settingsManager.getSoundEnabled();
    soundToggle.style.width = '20px';
    soundToggle.style.height = '20px';
    soundToggle.style.cursor = 'pointer';
    soundToggle.addEventListener('change', () => {
      settingsManager.setSoundEnabled(soundToggle.checked);
    });

    soundToggleContainer.appendChild(soundLabel);
    soundToggleContainer.appendChild(soundToggle);

    // 設定コンテナに追加
    settingsContainer.appendChild(cameraToggleContainer);
    settingsContainer.appendChild(soundToggleContainer);
    this.uiContainer.appendChild(settingsContainer);

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
  update(_deltaTime: number): void {
    if (this.background) {
      this.background.update();
    }
  }

  /**
   * 終了処理
   */
  dispose(): void {
    // HandTrackerは破棄しない（カメラストリームを次のシーンでも使用するため）
    // ジェスチャー認識のみ停止（タイトル画面では使用していないが一貫性のため）
    if (this.handTracker) {
      this.handTracker.stop();
      this.handTracker = null;
    }

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
