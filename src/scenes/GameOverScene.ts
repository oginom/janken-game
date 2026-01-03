import { Scene } from './Scene';
import { Background } from '../graphics/Background';
import { settingsManager } from '../utils/Settings';

/**
 * ゲームオーバー画面
 */
export class GameOverScene extends Scene {
  private background: Background | null = null;
  private uiContainer: HTMLDivElement | null = null;
  private onRetryCallback: (() => void) | null = null;
  private onTitleCallback: (() => void) | null = null;
  private finalScore: number;
  private highScore: number;

  constructor(video: HTMLVideoElement, finalScore: number, highScore: number) {
    super();
    const showCamera = settingsManager.getCameraVisible();
    this.background = new Background(video, showCamera);
    this.finalScore = finalScore;
    this.highScore = highScore;
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

    // ゲームオーバータイトル
    const title = document.createElement('h1');
    title.textContent = 'GAME OVER';
    title.style.color = '#ff4444';
    title.style.fontSize = '48px';
    title.style.fontWeight = 'bold';
    title.style.textShadow = '4px 4px 8px rgba(0, 0, 0, 0.8)';
    title.style.marginBottom = '40px';
    this.uiContainer.appendChild(title);

    // スコア表示
    const scoreText = document.createElement('div');
    scoreText.textContent = `Score: ${this.finalScore}`;
    scoreText.style.color = '#ffffff';
    scoreText.style.fontSize = '32px';
    scoreText.style.fontWeight = 'bold';
    scoreText.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';
    scoreText.style.marginBottom = '20px';
    this.uiContainer.appendChild(scoreText);

    // ハイスコア表示
    const highScoreText = document.createElement('div');
    highScoreText.textContent = `High Score: ${this.highScore}`;
    highScoreText.style.color = '#ffff00';
    highScoreText.style.fontSize = '24px';
    highScoreText.style.fontWeight = 'bold';
    highScoreText.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';
    highScoreText.style.marginBottom = '60px';
    this.uiContainer.appendChild(highScoreText);

    // 再挑戦ボタン
    const retryButton = document.createElement('button');
    retryButton.textContent = 'もう一度プレイ';
    retryButton.style.fontSize = '24px';
    retryButton.style.padding = '15px 40px';
    retryButton.style.backgroundColor = '#4444ff';
    retryButton.style.color = '#ffffff';
    retryButton.style.border = 'none';
    retryButton.style.borderRadius = '8px';
    retryButton.style.cursor = 'pointer';
    retryButton.style.pointerEvents = 'auto';
    retryButton.style.marginBottom = '20px';
    retryButton.style.fontWeight = 'bold';
    retryButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    retryButton.addEventListener('click', () => {
      if (this.onRetryCallback) {
        this.onRetryCallback();
      }
    });
    retryButton.addEventListener('mouseenter', () => {
      retryButton.style.backgroundColor = '#6666ff';
    });
    retryButton.addEventListener('mouseleave', () => {
      retryButton.style.backgroundColor = '#4444ff';
    });
    this.uiContainer.appendChild(retryButton);

    // タイトルへ戻るボタン
    const titleButton = document.createElement('button');
    titleButton.textContent = 'タイトルへ戻る';
    titleButton.style.fontSize = '20px';
    titleButton.style.padding = '12px 30px';
    titleButton.style.backgroundColor = '#666666';
    titleButton.style.color = '#ffffff';
    titleButton.style.border = 'none';
    titleButton.style.borderRadius = '8px';
    titleButton.style.cursor = 'pointer';
    titleButton.style.pointerEvents = 'auto';
    titleButton.style.fontWeight = 'bold';
    titleButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    titleButton.addEventListener('click', () => {
      if (this.onTitleCallback) {
        this.onTitleCallback();
      }
    });
    titleButton.addEventListener('mouseenter', () => {
      titleButton.style.backgroundColor = '#888888';
    });
    titleButton.addEventListener('mouseleave', () => {
      titleButton.style.backgroundColor = '#666666';
    });
    this.uiContainer.appendChild(titleButton);

    // DOMに追加
    document.body.appendChild(this.uiContainer);
  }

  /**
   * 再挑戦コールバックを設定
   */
  onRetry(callback: () => void): void {
    this.onRetryCallback = callback;
  }

  /**
   * タイトルへ戻るコールバックを設定
   */
  onTitle(callback: () => void): void {
    this.onTitleCallback = callback;
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
