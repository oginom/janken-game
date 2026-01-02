import { Scene } from './Scene';
import { Background } from '../graphics/Background';
import { HandSprite } from '../graphics/HandSprite';
import { UIElements } from '../graphics/UIElements';
import { GameState } from '../game/GameState';
import type { HandType } from '../types';
import { PLAYER_HAND_POSITION, GAME_CONFIG } from '../utils/Constants';

/**
 * ゲームプレイ画面
 */
export class GameScene extends Scene {
  private background: Background | null = null;
  private leftHand: HandSprite | null = null;
  private rightHand: HandSprite | null = null;
  private uiElements: UIElements | null = null;
  private gameState: GameState;

  // ダミー操作用の現在の手
  private currentLeftHand: HandType = 'rock';
  private currentRightHand: HandType = 'rock';

  constructor(video: HTMLVideoElement, gameState: GameState) {
    super();
    this.background = new Background(video);
    this.gameState = gameState;
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

    // プレイヤーの手を作成
    this.leftHand = new HandSprite(
      this.currentLeftHand,
      PLAYER_HAND_POSITION.LEFT_X,
      PLAYER_HAND_POSITION.Y
    );
    this.scene.add(this.leftHand.getSprite());

    this.rightHand = new HandSprite(
      this.currentRightHand,
      PLAYER_HAND_POSITION.RIGHT_X,
      PLAYER_HAND_POSITION.Y
    );
    this.scene.add(this.rightHand.getSprite());

    // UI要素を作成
    this.uiElements = new UIElements(GAME_CONFIG.INITIAL_LIVES);
    this.uiElements.getLifeSprites().forEach((sprite) => {
      this.scene.add(sprite);
    });

    // ゲーム状態の初期値でUIを更新
    this.uiElements.updateLives(this.gameState.getLives());
    this.uiElements.updateScore(this.gameState.getScore());

    // ゲーム状態のイベントリスナーを設定
    this.gameState.on('lives-change', (event) => {
      if (this.uiElements) {
        this.uiElements.updateLives(event.data);
      }
    });

    this.gameState.on('score-change', (event) => {
      if (this.uiElements) {
        this.uiElements.updateScore(event.data);
      }
    });

    // キーボードイベントリスナーを設定
    this.setupKeyboardControls();

    console.log('GameScene初期化完了');
  }

  /**
   * キーボードコントロールを設定（ダミー操作用）
   */
  private setupKeyboardControls(): void {
    const handleKeyDown = (event: KeyboardEvent) => {
      let leftHand: HandType | null = null;
      let rightHand: HandType | null = null;

      // 左手の操作（1, 2, 3キー）
      if (event.key === '1') {
        leftHand = 'rock';
      } else if (event.key === '2') {
        leftHand = 'scissors';
      } else if (event.key === '3') {
        leftHand = 'paper';
      }
      // 右手の操作（4, 5, 6キー）
      else if (event.key === '4') {
        rightHand = 'rock';
      } else if (event.key === '5') {
        rightHand = 'scissors';
      } else if (event.key === '6') {
        rightHand = 'paper';
      }

      // 左手を更新
      if (leftHand && this.leftHand) {
        this.currentLeftHand = leftHand;
        this.leftHand.setHandType(leftHand);
        console.log(`左手を変更: ${leftHand}`);
      }

      // 右手を更新
      if (rightHand && this.rightHand) {
        this.currentRightHand = rightHand;
        this.rightHand.setHandType(rightHand);
        console.log(`右手を変更: ${rightHand}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // 終了時にリスナーを削除するために保存
    (this as any)._keydownListener = handleKeyDown;
  }

  /**
   * 更新処理
   */
  update(deltaTime: number): void {
    if (this.background) {
      this.background.update();
    }

    if (this.leftHand) {
      this.leftHand.update(deltaTime);
    }

    if (this.rightHand) {
      this.rightHand.update(deltaTime);
    }
  }

  /**
   * 終了処理
   */
  dispose(): void {
    // キーボードイベントリスナーを削除
    if ((this as any)._keydownListener) {
      window.removeEventListener('keydown', (this as any)._keydownListener);
      (this as any)._keydownListener = null;
    }

    if (this.background) {
      this.background.dispose();
      this.background = null;
    }

    if (this.leftHand) {
      this.scene.remove(this.leftHand.getSprite());
      this.leftHand = null;
    }

    if (this.rightHand) {
      this.scene.remove(this.rightHand.getSprite());
      this.rightHand = null;
    }

    if (this.uiElements) {
      this.uiElements.getLifeSprites().forEach((sprite) => {
        this.scene.remove(sprite);
      });
      this.uiElements.dispose();
      this.uiElements = null;
    }
  }
}
