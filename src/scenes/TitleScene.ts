import { Scene } from './Scene';
import { Background } from '../graphics/Background';
import { settingsManager, isKeyboardDebugMode } from '../utils/Settings';
import { HandTracker } from '../game/HandTracker';
import { SoundManager } from '../audio/SoundManager';

/**
 * タイトル画面
 */
export class TitleScene extends Scene {
  private background: Background | null = null;
  private uiContainer: HTMLDivElement | null = null;
  private creditModal: HTMLDivElement | null = null;
  private onStartCallback: (() => void) | null = null;
  private video: HTMLVideoElement;
  private handTracker: HandTracker | null = null;

  constructor(video: HTMLVideoElement) {
    super();
    this.video = video;
    this.background = new Background(video);
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

    // ボクサー画像を事前にプリロード
    this.preloadBoxerImages();

    // 効果音を事前にプリロード
    this.preloadSounds();

    // BGMを開始
    const soundManager = SoundManager.getInstance();
    soundManager.playBGM();

    // MediaPipeモデルを事前にダウンロード（カメラ設定に関わらず）
    const showCamera = settingsManager.getCameraVisible();
    try {
      this.handTracker = new HandTracker(this.video);
      await this.handTracker.init(); // モデルをダウンロード

      // カメラ表示が有効な場合のみカメラを起動
      if (showCamera) {
        await this.handTracker.startCamera();

        // 背景にカメラ映像を表示
        if (this.background) {
          this.background.enableCameraBackground();
        }

        console.log('タイトル画面: MediaPipeモデルダウンロード完了、カメラ起動完了');
      } else {
        console.log('タイトル画面: MediaPipeモデルダウンロード完了（カメラは未起動）');
      }
    } catch (error) {
      console.error('タイトル画面: MediaPipe初期化エラー:', error);
    }

    // UI要素を作成
    this.createUI();
  }

  /**
   * ボクサー画像を事前にプリロード
   */
  private preloadBoxerImages(): void {
    const imagePaths = [
      '/boxer_base.png',
      '/boxer_gu.png',
      '/boxer_cho.png',
      '/boxer_pa.png',
      '/heart_full.png',
      '/heart_null.png',
    ];

    imagePaths.forEach((path) => {
      const img = new Image();
      img.src = path;
    });

    console.log('タイトル画面: ボクサー画像とハート画像をプリロード開始');
  }

  /**
   * 効果音を事前にプリロード
   */
  private async preloadSounds(): Promise<void> {
    try {
      const soundManager = SoundManager.getInstance();
      await soundManager.initialize();
      console.log('タイトル画面: 効果音をプリロード完了');
    } catch (error) {
      console.error('タイトル画面: 効果音プリロードエラー:', error);
    }
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
    title.style.fontSize = '36px';
    title.style.fontWeight = 'bold';
    title.style.textShadow = '4px 4px 8px rgba(0, 0, 0, 0.8)';
    title.style.marginBottom = '40px';
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
      // ブラウザの自動再生ポリシー対策：ユーザーインタラクション時にBGMを確実に再生
      const soundManager = SoundManager.getInstance();
      soundManager.playBGM();

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

    // 操作説明テキスト
    const gestureNotice = document.createElement('p');
    const isDebugMode = isKeyboardDebugMode();

    if (isDebugMode) {
      gestureNotice.textContent =
        'グー・チョキ・パーを\nジェスチャー認識で操作します\n\n🎮 デバッグモード: キーボード操作\n(1,2,3 = 左手 / 4,5,6 = 右手)';
    } else {
      gestureNotice.textContent = 'グー・チョキ・パーを\nジェスチャー認識で操作します';
    }

    gestureNotice.style.color = '#ffffff';
    gestureNotice.style.fontSize = '14px';
    gestureNotice.style.textAlign = 'center';
    gestureNotice.style.whiteSpace = 'pre-line';
    gestureNotice.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';
    gestureNotice.style.marginBottom = '20px';
    gestureNotice.style.lineHeight = '1.6';
    this.uiContainer.appendChild(gestureNotice);

    // 説明画像
    const instructionImage = document.createElement('img');
    instructionImage.src = '/janbox_inst.gif';
    instructionImage.alt = 'ゲームの説明';
    instructionImage.style.maxWidth = '150px';
    instructionImage.style.height = 'auto';
    instructionImage.style.marginBottom = '20px';
    instructionImage.style.borderRadius = '16px';
    this.uiContainer.appendChild(instructionImage);

    // カメラ設定の説明
    const cameraNotice = document.createElement('p');
    cameraNotice.textContent =
      'カメラ ON: 背景にカメラ映像を表示\nカメラ OFF: 白い背景のみ表示';
    cameraNotice.style.color = '#ffffff';
    cameraNotice.style.fontSize = '14px';
    cameraNotice.style.textAlign = 'center';
    cameraNotice.style.whiteSpace = 'pre-line';
    cameraNotice.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';
    cameraNotice.style.marginBottom = '20px';
    cameraNotice.style.lineHeight = '1.6';
    this.uiContainer.appendChild(cameraNotice);

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
    cameraLabel.textContent = 'カメラ ON: ';
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

      // カメラ表示設定を即座に反映
      if (cameraToggle.checked) {
        // カメラ表示ON
        try {
          // HandTrackerは既にinit()済みなので、カメラ起動のみ行う
          if (this.handTracker) {
            await this.handTracker.startCamera();
          }

          // 背景にカメラ映像を表示
          if (this.background) {
            this.background.enableCameraBackground();
          }

          console.log('カメラ表示ON: カメラ映像を表示');
        } catch (error) {
          console.error('カメラ起動エラー:', error);
        }
      } else {
        // カメラ表示OFF（白背景に戻す）
        if (this.background) {
          this.background.disableCameraBackground();
        }

        console.log('カメラ表示OFF: 白背景を表示');
      }
    });

    cameraToggleContainer.appendChild(cameraLabel);
    cameraToggleContainer.appendChild(cameraToggle);

    // 効果音設定トグル
    const soundToggleContainer = document.createElement('div');
    soundToggleContainer.style.display = 'flex';
    soundToggleContainer.style.alignItems = 'center';

    const soundLabel = document.createElement('label');
    soundLabel.textContent = 'BGM・効果音: ';
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

      // BGMも効果音設定に連動させる
      const soundManager = SoundManager.getInstance();
      if (soundToggle.checked) {
        soundManager.resumeBGM();
      } else {
        soundManager.pauseBGM();
      }
    });

    soundToggleContainer.appendChild(soundLabel);
    soundToggleContainer.appendChild(soundToggle);

    // 設定コンテナに追加
    settingsContainer.appendChild(cameraToggleContainer);
    settingsContainer.appendChild(soundToggleContainer);
    this.uiContainer.appendChild(settingsContainer);

    // クレジットボタン（画面下部に小さめに配置）
    const creditButton = document.createElement('button');
    creditButton.textContent = 'クレジット';
    creditButton.style.fontSize = '14px';
    creditButton.style.padding = '8px 20px';
    creditButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    creditButton.style.color = '#ffffff';
    creditButton.style.border = '1px solid rgba(255, 255, 255, 0.5)';
    creditButton.style.borderRadius = '4px';
    creditButton.style.cursor = 'pointer';
    creditButton.style.pointerEvents = 'auto';
    creditButton.style.marginTop = '30px';
    creditButton.style.fontWeight = 'normal';
    creditButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
    creditButton.addEventListener('click', () => {
      this.openCreditModal();
    });
    creditButton.addEventListener('mouseenter', () => {
      creditButton.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    });
    creditButton.addEventListener('mouseleave', () => {
      creditButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    });
    this.uiContainer.appendChild(creditButton);

    // DOMに追加
    document.body.appendChild(this.uiContainer);
  }

  /**
   * クレジットモーダルを作成
   */
  private createCreditModal(): HTMLDivElement {
    // モーダル背景
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.display = 'none';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    modal.style.pointerEvents = 'auto';

    // モーダルコンテンツ
    const content = document.createElement('div');
    content.style.backgroundColor = '#ffffff';
    content.style.padding = '30px';
    content.style.borderRadius = '12px';
    content.style.maxWidth = '400px';
    content.style.width = '90%';
    content.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
    content.style.position = 'relative';

    // 閉じるボタン
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.fontSize = '24px';
    closeButton.style.width = '30px';
    closeButton.style.height = '30px';
    closeButton.style.border = 'none';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.color = '#666666';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '0';
    closeButton.style.lineHeight = '1';
    closeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeCreditModal();
    });
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.color = '#000000';
    });
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.color = '#666666';
    });
    content.appendChild(closeButton);

    // タイトル
    const title = document.createElement('h2');
    title.textContent = 'クレジット';
    title.style.fontSize = '24px';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '20px';
    title.style.color = '#333333';
    title.style.textAlign = 'center';
    content.appendChild(title);

    // クレジット情報（表形式）
    const creditInfo = document.createElement('div');
    creditInfo.style.fontSize = '15px';
    creditInfo.style.color = '#333333';

    // 制作セクション
    const creatorRow = document.createElement('div');
    creatorRow.style.display = 'flex';
    creatorRow.style.marginBottom = '20px';
    creatorRow.style.paddingBottom = '15px';
    creatorRow.style.borderBottom = '1px solid #e0e0e0';

    const creatorLabel = document.createElement('div');
    creatorLabel.textContent = '制作';
    creatorLabel.style.fontWeight = 'bold';
    creatorLabel.style.minWidth = '100px';
    creatorLabel.style.color = '#555555';
    creatorRow.appendChild(creatorLabel);

    const creatorValue = document.createElement('div');
    creatorValue.style.flex = '1';
    creatorValue.innerHTML = 'えむおぎ<br>';
    const twitterLink = document.createElement('a');
    twitterLink.textContent = '@emuogi';
    twitterLink.href = 'https://x.com/emuogi';
    twitterLink.target = '_blank';
    twitterLink.rel = 'noopener noreferrer';
    twitterLink.style.color = '#1da1f2';
    twitterLink.style.textDecoration = 'none';
    twitterLink.style.fontSize = '14px';
    twitterLink.addEventListener('mouseenter', () => {
      twitterLink.style.textDecoration = 'underline';
    });
    twitterLink.addEventListener('mouseleave', () => {
      twitterLink.style.textDecoration = 'none';
    });
    creatorValue.appendChild(twitterLink);
    creatorRow.appendChild(creatorValue);
    creditInfo.appendChild(creatorRow);

    // BGM素材セクション
    const bgmRow = document.createElement('div');
    bgmRow.style.display = 'flex';
    bgmRow.style.marginBottom = '20px';
    bgmRow.style.paddingBottom = '15px';
    bgmRow.style.borderBottom = '1px solid #e0e0e0';

    const bgmLabel = document.createElement('div');
    bgmLabel.textContent = 'BGM素材';
    bgmLabel.style.fontWeight = 'bold';
    bgmLabel.style.minWidth = '100px';
    bgmLabel.style.color = '#555555';
    bgmRow.appendChild(bgmLabel);

    const bgmValue = document.createElement('div');
    bgmValue.style.flex = '1';
    bgmValue.innerHTML = 'Kei Morimoto様<br><span style="font-size: 14px; color: #666666;">"COLORS"</span>';
    bgmRow.appendChild(bgmValue);
    creditInfo.appendChild(bgmRow);

    // 効果音素材セクション
    const seRow = document.createElement('div');
    seRow.style.display = 'flex';

    const seLabel = document.createElement('div');
    seLabel.textContent = '効果音素材';
    seLabel.style.fontWeight = 'bold';
    seLabel.style.minWidth = '100px';
    seLabel.style.color = '#555555';
    seRow.appendChild(seLabel);

    const seValue = document.createElement('div');
    seValue.style.flex = '1';
    seValue.textContent = '効果音ラボ様';
    seRow.appendChild(seValue);
    creditInfo.appendChild(seRow);

    content.appendChild(creditInfo);
    modal.appendChild(content);

    // 背景クリックで閉じる
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeCreditModal();
      }
    });

    // コンテンツクリックでイベント伝播を止める
    content.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    return modal;
  }

  /**
   * クレジットモーダルを開く
   */
  private openCreditModal(): void {
    if (!this.creditModal) {
      this.creditModal = this.createCreditModal();
      document.body.appendChild(this.creditModal);
    }
    this.creditModal.style.display = 'flex';
  }

  /**
   * クレジットモーダルを閉じる
   */
  private closeCreditModal(): void {
    if (this.creditModal) {
      this.creditModal.style.display = 'none';
    }
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

    if (this.creditModal && this.creditModal.parentElement) {
      this.creditModal.parentElement.removeChild(this.creditModal);
      this.creditModal = null;
    }
  }
}
