import * as THREE from 'three';
import { assetLoader } from '../assets/AssetLoader';
import { SCREEN } from '../utils/Constants';
import { TextSprite } from './TextSprite';

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
 * UI要素（ライフ、スコア）の描画管理
 */
export class UIElements {
  private lifeSprites: THREE.Sprite[] = [];
  private scoreText: TextSprite;
  private levelText: TextSprite;
  private maxLives: number;

  constructor(maxLives: number) {
    this.maxLives = maxLives;

    // スコア表示用のTextSpriteを作成（右上に配置）
    this.scoreText = new TextSprite('Score: 0', SCREEN.WIDTH - 10, 10, {
      fontSize: 24,
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      textShadow: true,
      shadowColor: 'rgba(0, 0, 0, 0.8)',
      shadowBlur: 4,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      align: 'right',
    });

    // 難易度レベル表示用のTextSpriteを作成（右上、スコアの下）
    this.levelText = new TextSprite('Level 1', SCREEN.WIDTH - 10, 40, {
      fontSize: 18,
      color: '#ffff00',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      textShadow: true,
      shadowColor: 'rgba(0, 0, 0, 0.8)',
      shadowBlur: 4,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      align: 'right',
    });

    // ライフ表示用のスプライトを作成
    this.createLifeSprites();
  }

  /**
   * ライフ表示用のスプライトを作成
   */
  private createLifeSprites(): void {
    const heartSize = 20;
    const spacing = 25;
    const totalWidth = (this.maxLives - 1) * spacing + heartSize;
    const centerX = SCREEN.WIDTH / 2;
    const startX = centerX - totalWidth / 2 + heartSize / 2;
    const startY = 630;

    for (let i = 0; i < this.maxLives; i++) {
      const material = new THREE.SpriteMaterial({
        map: assetLoader.getHeartTexture(true),
        transparent: true,
      });

      const sprite = new THREE.Sprite(material);
      const coords = screenToThreeCoords(startX + i * spacing, startY);
      sprite.position.set(coords.x, coords.y, 1);
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
    this.scoreText.setText(`Score: ${score}`);
  }

  /**
   * 難易度レベル表示を更新
   */
  updateLevel(level: number, _defeatedCount: number): void {
    //this.levelText.setText(`Level ${level} (${defeatedCount % 5}/5)`);
    this.levelText.setText(`Level ${level}`);
  }

  /**
   * ライフスプライトを取得
   */
  getLifeSprites(): THREE.Sprite[] {
    return this.lifeSprites;
  }

  /**
   * テキストスプライトを取得
   */
  getTextSprites(): THREE.Sprite[] {
    return [this.scoreText.getSprite(), this.levelText.getSprite()];
  }

  /**
   * UI要素の表示/非表示を設定
   */
  setVisible(visible: boolean): void {
    this.lifeSprites.forEach((sprite) => {
      sprite.visible = visible;
    });
    this.scoreText.setVisible(visible);
    this.levelText.setVisible(visible);
  }

  /**
   * リソースを破棄
   */
  dispose(): void {
    this.lifeSprites.forEach((sprite) => {
      sprite.material.dispose();
    });
    this.lifeSprites = [];

    this.scoreText.dispose();
    this.levelText.dispose();
  }
}
