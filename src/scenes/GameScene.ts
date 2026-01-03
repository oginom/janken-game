import { Scene } from './Scene';
import { Background } from '../graphics/Background';
import { HandSprite } from '../graphics/HandSprite';
import { UIElements } from '../graphics/UIElements';
import { GameState } from '../game/GameState';
import { EnemyManager } from '../game/EnemyManager';
import { DifficultyManager } from '../game/DifficultyManager';
import { CollisionDetector } from '../game/CollisionDetector';
import { HandTracker } from '../game/HandTracker';
import type { HandType } from '../types';
import { PLAYER_HAND_POSITION, GAME_CONFIG } from '../utils/Constants';
import { settingsManager, isKeyboardDebugMode } from '../utils/Settings';

/**
 * ゲームプレイ画面
 */
export class GameScene extends Scene {
  private background: Background | null = null;
  private leftHand: HandSprite | null = null;
  private rightHand: HandSprite | null = null;
  private uiElements: UIElements | null = null;
  private gameState: GameState;
  private enemyManager: EnemyManager | null = null;
  private difficultyManager: DifficultyManager;
  private handTracker: HandTracker | null = null;

  // 現在の手（カメラまたはキーボード操作）
  private currentLeftHand: HandType = 'rock';
  private currentRightHand: HandType = 'rock';

  // 敵生成のタイマー
  private spawnTimer: number = 0;

  // カメラ表示フラグとジェスチャー認識フラグ
  private showsCamera: boolean;
  private usesGesture: boolean;
  private video: HTMLVideoElement;

  constructor(video: HTMLVideoElement, gameState: GameState) {
    super();
    this.video = video;
    this.showsCamera = settingsManager.getCameraVisible();
    this.usesGesture = !isKeyboardDebugMode();
    this.background = new Background(video, this.showsCamera);
    this.gameState = gameState;
    this.difficultyManager = new DifficultyManager();
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
    this.uiElements.updateLevel(
      this.difficultyManager.getCurrentLevel(),
      this.difficultyManager.getDefeatedCount()
    );

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

    // 敵マネージャーを初期化
    this.enemyManager = new EnemyManager(this.scene);

    // HandTrackerを初期化（常に起動を試みる）
    try {
      this.handTracker = new HandTracker(this.video);
      await this.handTracker.init();
      await this.handTracker.startCamera();
      this.handTracker.start();

      // カメラ表示が有効な場合、背景にカメラ映像を表示
      if (this.showsCamera && this.background) {
        this.background.enableCameraBackground();
      }

      console.log('HandTracker初期化完了');
    } catch (error) {
      console.error('HandTracker初期化エラー:', error);
      console.log('ジェスチャー認識が使用できません。キーボード操作にフォールバック');
      this.usesGesture = false;
    }

    // デバッグモードまたはエラー時、キーボードイベントリスナーを設定
    if (!this.usesGesture) {
      this.setupKeyboardControls();
      console.log('🎮 キーボードデバッグモード有効');
    }

    // 最初の敵をすぐに生成
    this.spawnNextEnemy();

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
   * 次の敵を生成
   */
  private spawnNextEnemy(): void {
    if (!this.enemyManager) return;

    const nextHand = this.difficultyManager.generateNextHand();
    const speed = this.difficultyManager.getCurrentSpeed();

    if (nextHand.leftHand) {
      this.enemyManager.spawnEnemy(nextHand.leftHand, 'left', speed);
    }

    if (nextHand.rightHand) {
      this.enemyManager.spawnEnemy(nextHand.rightHand, 'right', speed);
    }

    console.log(`敵を生成: 左=${nextHand.leftHand}, 右=${nextHand.rightHand}, 速度=${speed.toFixed(1)}`);

    // スポーンタイマーをリセット
    this.spawnTimer = 0;
  }

  /**
   * 更新処理
   */
  update(deltaTime: number): void {
    if (this.background) {
      this.background.update();
    }

    // ジェスチャー認識が有効な場合、HandTrackerから手の状態を取得
    if (this.usesGesture && this.handTracker) {
      const leftHandType = this.handTracker.getLeftHandType();
      const rightHandType = this.handTracker.getRightHandType();

      // 左手の更新
      if (leftHandType && leftHandType !== this.currentLeftHand && this.leftHand) {
        this.currentLeftHand = leftHandType;
        this.leftHand.setHandType(leftHandType);
      }

      // 右手の更新
      if (rightHandType && rightHandType !== this.currentRightHand && this.rightHand) {
        this.currentRightHand = rightHandType;
        this.rightHand.setHandType(rightHandType);
      }
    }
    // キーボードデバッグモードの場合はキーボードイベントで更新される

    if (this.leftHand) {
      this.leftHand.update(deltaTime);
    }

    if (this.rightHand) {
      this.rightHand.update(deltaTime);
    }

    if (this.enemyManager) {
      this.enemyManager.update(deltaTime);

      // 衝突判定
      const enemies = this.enemyManager.getEnemies();
      const collisions = CollisionDetector.checkCollisions(
        this.leftHand,
        this.rightHand,
        enemies
      );

      // 衝突があった敵を削除（後ろから削除して配列のインデックスずれを防ぐ）
      const indicesToRemove = collisions.map((c) => c.enemyIndex).sort((a, b) => b - a);

      for (const collision of collisions) {
        CollisionDetector.applyCollisionResult(
          collision,
          (points) => this.gameState.addScore(points),
          (amount) => this.gameState.loseLife(amount),
          () => {
            this.difficultyManager.incrementDefeatedCount();
            // 難易度レベル表示を更新
            if (this.uiElements) {
              this.uiElements.updateLevel(
                this.difficultyManager.getCurrentLevel(),
                this.difficultyManager.getDefeatedCount()
              );
            }
          }
        );
      }

      // 衝突した敵を削除
      for (const index of indicesToRemove) {
        this.enemyManager.removeEnemy(index);
      }
    }

    // 敵の生成タイマー
    this.spawnTimer += deltaTime;
    const interval = this.difficultyManager.getCurrentInterval();
    if (this.spawnTimer >= interval) {
      this.spawnNextEnemy();
    }
  }

  /**
   * 終了処理
   */
  dispose(): void {
    // HandTrackerを破棄
    if (this.handTracker) {
      this.handTracker.dispose();
      this.handTracker = null;
    }

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

    if (this.enemyManager) {
      this.enemyManager.dispose();
      this.enemyManager = null;
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
