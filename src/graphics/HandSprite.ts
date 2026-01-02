import * as THREE from 'three';
import type { HandType } from '../types';
import { assetLoader } from '../assets/AssetLoader';
import { ANIMATION, SCREEN } from '../utils/Constants';

/**
 * 画面座標(左上原点)をThree.js座標(中心原点)に変換
 */
function screenToThreeCoords(x: number, y: number): { x: number; y: number } {
  return {
    x: x - SCREEN.WIDTH / 2,
    y: -(y - SCREEN.HEIGHT / 2),
  };
}

/**
 * 手のスプライト（プレイヤー・敵共通）
 */
export class HandSprite {
  private sprite: THREE.Sprite;
  private currentType: HandType;
  private frameSprite: THREE.Sprite | null = null;
  private baseY: number; // アニメーションの基準となるY座標
  private bounceAnimation: {
    active: boolean;
    startTime: number;
  } | null = null;

  constructor(type: HandType, x: number, y: number, size: number = 80) {
    this.currentType = type;

    // テクスチャを取得
    const texture = assetLoader.getHandTexture(type);
    if (!texture) {
      console.error(`Hand texture for type "${type}" not found!`);
    }

    // スプライトマテリアルの作成
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    });

    this.sprite = new THREE.Sprite(material);
    const coords = screenToThreeCoords(x, y);
    this.sprite.position.set(coords.x, coords.y, 0);
    this.sprite.scale.set(size, size, 1);

    // 基準Y座標を保存
    this.baseY = coords.y;
  }

  /**
   * 手の種類を変更
   */
  setHandType(type: HandType, animate: boolean = true): void {
    if (this.currentType === type) return;

    this.currentType = type;

    // テクスチャを更新
    const texture = assetLoader.getHandTexture(type);
    if (!texture) {
      console.error(`Hand texture for type "${type}" not found!`);
      return;
    }

    const material = this.sprite.material as THREE.SpriteMaterial;
    material.map = texture;
    material.needsUpdate = true;

    // アニメーションを開始
    if (animate) {
      this.startBounceAnimation();
    }

    // フレームがある場合は更新
    if (this.frameSprite) {
      this.updateFrame();
    }
  }

  /**
   * 跳ねるアニメーションを開始
   */
  private startBounceAnimation(): void {
    // アニメーション開始時に位置を基準位置にリセット
    this.sprite.position.y = this.baseY;
    if (this.frameSprite) {
      this.frameSprite.position.y = this.baseY;
    }

    this.bounceAnimation = {
      active: true,
      startTime: performance.now(),
    };
  }

  /**
   * 丸枠を追加（敵の手用）
   */
  addFrame(): void {
    if (this.frameSprite) return;

    const frameMaterial = new THREE.SpriteMaterial({
      map: assetLoader.getFrameTexture(this.currentType),
      transparent: true,
    });

    this.frameSprite = new THREE.Sprite(frameMaterial);
    this.frameSprite.scale.set(
      this.sprite.scale.x * 1.3,
      this.sprite.scale.y * 1.3,
      1
    );

    // 親スプライトと同じ位置に配置
    this.frameSprite.position.copy(this.sprite.position);
    this.frameSprite.position.z = -0.1; // 手の後ろに配置
  }

  /**
   * 丸枠のテクスチャを更新
   */
  private updateFrame(): void {
    if (!this.frameSprite) return;

    const texture = assetLoader.getFrameTexture(this.currentType);
    if (!texture) {
      console.error(`Frame texture for type "${this.currentType}" not found!`);
      return;
    }

    const frameMaterial = this.frameSprite.material as THREE.SpriteMaterial;
    frameMaterial.map = texture;
    frameMaterial.needsUpdate = true;
  }

  /**
   * 位置を設定
   */
  setPosition(x: number, y: number): void {
    const coords = screenToThreeCoords(x, y);
    this.baseY = coords.y; // 基準Y座標を更新
    this.sprite.position.set(coords.x, coords.y, this.sprite.position.z);
    if (this.frameSprite) {
      this.frameSprite.position.set(coords.x, coords.y, this.frameSprite.position.z);
    }
  }

  /**
   * 位置を取得
   */
  getPosition(): THREE.Vector3 {
    return this.sprite.position.clone();
  }

  /**
   * スプライトを取得
   */
  getSprite(): THREE.Sprite {
    return this.sprite;
  }

  /**
   * 丸枠スプライトを取得
   */
  getFrameSprite(): THREE.Sprite | null {
    return this.frameSprite;
  }

  /**
   * 現在の手の種類を取得
   */
  getHandType(): HandType {
    return this.currentType;
  }

  /**
   * 更新処理（アニメーション）
   */
  update(_deltaTime: number): void {
    if (!this.bounceAnimation?.active) return;

    const elapsed = performance.now() - this.bounceAnimation.startTime;
    const progress = elapsed / (ANIMATION.HAND_BOUNCE_DURATION * 1000);

    if (progress >= 1) {
      // アニメーション終了 - 基準位置に戻す
      this.sprite.position.y = this.baseY;
      this.bounceAnimation.active = false;
      if (this.frameSprite) {
        this.frameSprite.position.y = this.baseY;
      }
      return;
    }

    // イージング関数（ease-out）
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const offset = Math.sin(easeOut * Math.PI) * ANIMATION.HAND_BOUNCE_HEIGHT;

    this.sprite.position.y = this.baseY + offset; // Y座標反転のため+に変更
    if (this.frameSprite) {
      this.frameSprite.position.y = this.sprite.position.y;
    }
  }

  /**
   * 表示/非表示を設定
   */
  setVisible(visible: boolean): void {
    this.sprite.visible = visible;
    if (this.frameSprite) {
      this.frameSprite.visible = visible;
    }
  }

  /**
   * リソースを破棄
   */
  dispose(): void {
    this.sprite.material.dispose();
    if (this.frameSprite) {
      this.frameSprite.material.dispose();
    }
  }
}
