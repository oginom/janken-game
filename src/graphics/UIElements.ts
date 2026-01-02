import * as THREE from 'three';
import { assetLoader } from '../assets/AssetLoader';
import { SCREEN } from '../utils/Constants';

/**
 * UI要素（ライフ、スコア）の描画管理
 */
export class UIElements {
  private lifeSprites: THREE.Sprite[] = [];
  private scoreText: HTMLDivElement;
  private maxLives: number;

  constructor(maxLives: number) {
    this.maxLives = maxLives;

    // スコア表示用のHTML要素を作成
    this.scoreText = document.createElement('div');
    this.scoreText.style.position = 'absolute';
    this.scoreText.style.top = '10px';
    this.scoreText.style.right = '10px';
    this.scoreText.style.color = '#ffffff';
    this.scoreText.style.fontSize = '24px';
    this.scoreText.style.fontWeight = 'bold';
    this.scoreText.style.fontFamily = 'Arial, sans-serif';
    this.scoreText.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';
    this.scoreText.style.zIndex = '1000';
    document.body.appendChild(this.scoreText);

    // ライフ表示用のスプライトを作成
    this.createLifeSprites();
  }

  /**
   * ライフ表示用のスプライトを作成
   */
  private createLifeSprites(): void {
    const heartSize = 40;
    const spacing = 45;
    const startX = 20;
    const startY = 20;

    for (let i = 0; i < this.maxLives; i++) {
      const material = new THREE.SpriteMaterial({
        map: assetLoader.getHeartTexture(true),
        transparent: true,
      });

      const sprite = new THREE.Sprite(material);
      sprite.position.set(startX + i * spacing, startY, 1);
      sprite.scale.set(heartSize, heartSize, 1);

      this.lifeSprites.push(sprite);
    }
  }

  /**
   * ライフ表示を更新
   */
  updateLives(currentLives: number): void {
    for (let i = 0; i < this.maxLives; i++) {
      const material = this.lifeSprites[i].material as THREE.SpriteMaterial;
      const filled = i < currentLives;
      material.map = assetLoader.getHeartTexture(filled);
      material.needsUpdate = true;
    }
  }

  /**
   * スコア表示を更新
   */
  updateScore(score: number): void {
    this.scoreText.textContent = `Score: ${score}`;
  }

  /**
   * ライフスプライトを取得
   */
  getLifeSprites(): THREE.Sprite[] {
    return this.lifeSprites;
  }

  /**
   * スコアテキスト要素を取得
   */
  getScoreElement(): HTMLDivElement {
    return this.scoreText;
  }

  /**
   * UI要素の表示/非表示を設定
   */
  setVisible(visible: boolean): void {
    this.lifeSprites.forEach((sprite) => {
      sprite.visible = visible;
    });
    this.scoreText.style.display = visible ? 'block' : 'none';
  }

  /**
   * リソースを破棄
   */
  dispose(): void {
    this.lifeSprites.forEach((sprite) => {
      sprite.material.dispose();
    });
    this.lifeSprites = [];

    if (this.scoreText.parentElement) {
      this.scoreText.parentElement.removeChild(this.scoreText);
    }
  }
}
