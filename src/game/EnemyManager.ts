import * as THREE from 'three';
import { HandSprite } from '../graphics/HandSprite';
import type { HandType } from '../types';
import { ENEMY_HAND_POSITION, ENEMY_BASE_SPEED } from '../utils/Constants';

/**
 * 敵の手の情報
 */
export interface EnemyHand {
  sprite: HandSprite;
  type: HandType;
  side: 'left' | 'right';
  targetY: number; // プレイヤーの手の位置
  speed: number; // 降下速度（ピクセル/秒）
  isPreview: boolean; // 予告表示中かどうか
}

/**
 * 敵の手の管理クラス
 */
export class EnemyManager {
  private enemies: EnemyHand[] = [];
  private nextHandType: HandType | null = null; // 次に出す手の予告
  private nextHandSide: 'left' | 'right' | null = null;
  private previewSprite: HandSprite | null = null; // 予告表示用スプライト
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * 敵の手を生成
   */
  spawnEnemy(type: HandType, side: 'left' | 'right', speed: number = ENEMY_BASE_SPEED): void {
    const x = side === 'left' ? ENEMY_HAND_POSITION.LEFT_X : ENEMY_HAND_POSITION.RIGHT_X;
    const startY = ENEMY_HAND_POSITION.START_Y;
    const targetY = ENEMY_HAND_POSITION.END_Y;

    // 敵の手スプライトを作成
    const sprite = new HandSprite(type, x, startY);
    sprite.addFrame(); // 敵の手には枠を追加

    // シーンに追加
    this.scene.add(sprite.getSprite());
    const frameSprite = sprite.getFrameSprite();
    if (frameSprite) {
      this.scene.add(frameSprite);
    }

    // 敵リストに追加
    this.enemies.push({
      sprite,
      type,
      side,
      targetY,
      speed,
      isPreview: false,
    });
  }

  /**
   * 次の敵の手を予告表示
   */
  showNextHandPreview(type: HandType, side: 'left' | 'right'): void {
    // 既存の予告を削除
    this.clearPreview();

    this.nextHandType = type;
    this.nextHandSide = side;

    // 予告スプライトを作成
    const x = side === 'left' ? ENEMY_HAND_POSITION.LEFT_X : ENEMY_HAND_POSITION.RIGHT_X;
    const y = ENEMY_HAND_POSITION.PREVIEW_Y;

    this.previewSprite = new HandSprite(type, x, y);
    this.previewSprite.addFrame();
    this.previewSprite.setVisible(true);

    // シーンに追加
    this.scene.add(this.previewSprite.getSprite());
    const frameSprite = this.previewSprite.getFrameSprite();
    if (frameSprite) {
      this.scene.add(frameSprite);
    }
  }

  /**
   * 予告表示をクリア
   */
  private clearPreview(): void {
    if (this.previewSprite) {
      this.scene.remove(this.previewSprite.getSprite());
      const frameSprite = this.previewSprite.getFrameSprite();
      if (frameSprite) {
        this.scene.remove(frameSprite);
      }
      this.previewSprite = null;
    }
    this.nextHandType = null;
    this.nextHandSide = null;
  }

  /**
   * 予告を実際の敵として生成
   */
  spawnPreviewedEnemy(speed: number = ENEMY_BASE_SPEED): void {
    if (this.nextHandType && this.nextHandSide) {
      this.spawnEnemy(this.nextHandType, this.nextHandSide, speed);
      this.clearPreview();
    }
  }

  /**
   * 全ての敵の手を更新（降下処理）
   */
  update(deltaTime: number): void {
    // 予告スプライトの更新
    if (this.previewSprite) {
      this.previewSprite.update(deltaTime);
    }

    // 各敵の手を更新
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      // スプライトのアニメーション更新
      enemy.sprite.update(deltaTime);

      // 降下処理
      const currentPos = enemy.sprite.getPosition();
      const newY = currentPos.y - enemy.speed * deltaTime;

      // 画面下端を超えたら削除
      if (newY < -ENEMY_HAND_POSITION.END_Y - 100) {
        this.removeEnemy(i);
        continue;
      }

      // 位置を更新（screen座標系に戻す必要がある）
      // Three.js座標からscreen座標に変換
      const screenY = -(newY - 667 / 2); // Y座標反転と中心からのオフセット
      const screenX = enemy.side === 'left' ? ENEMY_HAND_POSITION.LEFT_X : ENEMY_HAND_POSITION.RIGHT_X;
      enemy.sprite.setPosition(screenX, screenY);
    }
  }

  /**
   * 敵の手を削除
   */
  removeEnemy(index: number): void {
    if (index < 0 || index >= this.enemies.length) return;

    const enemy = this.enemies[index];

    // シーンから削除
    this.scene.remove(enemy.sprite.getSprite());
    const frameSprite = enemy.sprite.getFrameSprite();
    if (frameSprite) {
      this.scene.remove(frameSprite);
    }

    // 配列から削除
    this.enemies.splice(index, 1);
  }

  /**
   * 全ての敵の手を取得
   */
  getEnemies(): EnemyHand[] {
    return this.enemies;
  }

  /**
   * 全ての敵の手をクリア
   */
  clear(): void {
    while (this.enemies.length > 0) {
      this.removeEnemy(0);
    }
    this.clearPreview();
  }

  /**
   * リソースを破棄
   */
  dispose(): void {
    this.clear();
  }
}
