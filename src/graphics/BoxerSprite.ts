import type { HandType } from '../types';

/**
 * ボクサー画像スプライト
 * HTML要素として画面下部にボクサーを表示し、待機モーションとポーズ変更を管理
 */
export class BoxerSprite {
  private element: HTMLImageElement | null = null;
  private isFlipped: boolean = false;

  // 待機モーション用
  private idleTimer: number = 0;
  private isIdleUp: boolean = false;

  // ポーズ変更用
  private poseTimer: number = 0;
  private isPosing: boolean = false;

  // 定数
  private readonly IDLE_INTERVAL = 0.5; // 待機モーション間隔（秒）
  private readonly IDLE_OFFSET_PERCENT = 7.5; // 待機モーションの移動量（%）
  private readonly POSE_DURATION = 0.5; // ポーズ表示時間（秒）

  // 画像パス
  private readonly IMAGES = {
    base: '/boxer_base.png',
    rock: '/boxer_gu.png',
    scissors: '/boxer_cho.png',
    paper: '/boxer_pa.png',
  };

  /**
   * 初期化してHTML要素を作成
   */
  init(): void {
    // img要素を作成
    this.element = document.createElement('img');
    this.element.id = 'boxer-sprite';
    this.element.src = this.IMAGES.base;
    this.element.alt = 'Boxer';

    // スタイルを設定
    this.element.style.position = 'fixed';
    this.element.style.bottom = '12%';
    this.element.style.left = '50%';
    this.element.style.transform = 'translateX(-50%)';
    this.element.style.height = '25vh';
    this.element.style.width = 'auto';
    this.element.style.zIndex = '100';
    this.element.style.pointerEvents = 'none';

    // bodyに追加
    document.body.appendChild(this.element);
  }

  /**
   * 更新処理（待機モーションとポーズタイマー）
   */
  update(deltaTime: number): void {
    if (!this.element) return;

    // ポーズ中の場合、タイマーを減らす
    if (this.isPosing) {
      this.poseTimer -= deltaTime;

      if (this.poseTimer <= 0) {
        // ポーズ終了、base画像に戻す
        this.element.src = this.IMAGES.base;
        this.isFlipped = false;
        this.isPosing = false;

        // 待機モーションを再開（タイマーリセット）
        this.idleTimer = 0;
      } else {
        // ポーズ中は待機モーションを実行しない
        return;
      }
    }

    // 待機モーション
    this.idleTimer += deltaTime;

    if (this.idleTimer >= this.IDLE_INTERVAL) {
      this.idleTimer = 0;
      this.isIdleUp = !this.isIdleUp;

      // Y座標をオフセット
      const offsetY = this.isIdleUp
        ? -this.IDLE_OFFSET_PERCENT
        : this.IDLE_OFFSET_PERCENT;

      const scaleX = this.isFlipped ? -1 : 1;
      this.element.style.transform = `translateX(-50%) translateY(${offsetY}%) scaleX(${scaleX})`;
    }
  }

  /**
   * ポーズを変更（衝突判定時に呼ばれる）
   * @param handType プレイヤーの手の種類
   * @param isLeftHand 左手かどうか
   */
  showPose(handType: HandType, isLeftHand: boolean): void {
    if (!this.element) return;

    // ポーズ状態に移行
    this.isPosing = true;
    this.poseTimer = this.POSE_DURATION;
    this.isFlipped = isLeftHand;

    // 画像を変更
    this.element.src = this.IMAGES[handType];

    // 左手の場合は反転
    const scaleX = isLeftHand ? -1 : 1;

    // 待機モーションの現在のオフセットを維持しつつ反転を適用
    const offsetY = this.isIdleUp
      ? -this.IDLE_OFFSET_PERCENT
      : this.IDLE_OFFSET_PERCENT;

    this.element.style.transform = `translateX(-50%) translateY(${offsetY}%) scaleX(${scaleX})`;
  }

  /**
   * 破棄処理（HTML要素を削除）
   */
  dispose(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}
