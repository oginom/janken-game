import * as THREE from 'three';
import type { HandType } from '../types';
import { PlaceholderGenerator } from './placeholders/PlaceholderGenerator';

/**
 * アセット読み込みと管理を行うクラス
 */
export class AssetLoader {
  private textureLoader: THREE.TextureLoader;
  private textures: Map<string, THREE.Texture>;
  private useRealAssets: boolean;

  constructor() {
    this.textureLoader = new THREE.TextureLoader();
    this.textures = new Map();
    this.useRealAssets = false; // デフォルトはプレースホルダーを使用
  }

  /**
   * すべてのアセットを読み込む
   */
  async loadAll(): Promise<void> {
    if (this.useRealAssets) {
      await this.loadRealAssets();
    } else {
      await this.loadPlaceholderAssets();
    }
  }

  /**
   * プレースホルダー画像を読み込む
   */
  private async loadPlaceholderAssets(): Promise<void> {
    const placeholders = PlaceholderGenerator.generateAll();

    // 手の画像
    this.textures.set('hand-rock', await this.loadTextureFromDataURL(placeholders.hands.rock));
    this.textures.set('hand-scissors', await this.loadTextureFromDataURL(placeholders.hands.scissors));
    this.textures.set('hand-paper', await this.loadTextureFromDataURL(placeholders.hands.paper));

    // 丸枠
    this.textures.set('frame-rock', await this.loadTextureFromDataURL(placeholders.frames.rock));
    this.textures.set('frame-scissors', await this.loadTextureFromDataURL(placeholders.frames.scissors));
    this.textures.set('frame-paper', await this.loadTextureFromDataURL(placeholders.frames.paper));

    // ハート
    this.textures.set('heart-filled', await this.loadTextureFromDataURL(placeholders.hearts.filled));
    this.textures.set('heart-empty', await this.loadTextureFromDataURL(placeholders.hearts.empty));

    // 背景
    this.textures.set('background', await this.loadTextureFromDataURL(placeholders.background));
    this.textures.set('overlay', await this.loadTextureFromDataURL(placeholders.overlay));
  }

  /**
   * 実際の画像ファイルを読み込む（将来の拡張用）
   */
  private async loadRealAssets(): Promise<void> {
    // TODO: 実際の画像ファイルを読み込む
    // 例: this.textures.set('hand-rock', await this.loadTexture('/assets/hand-rock.png'));
    throw new Error('Real assets not implemented yet. Use placeholder assets.');
  }

  /**
   * Data URLからテクスチャを読み込む
   */
  private loadTextureFromDataURL(dataURL: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        dataURL,
        (texture) => {
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          resolve(texture);
        },
        undefined,
        (error) => reject(error)
      );
    });
  }

  /**
   * URLからテクスチャを読み込む（実画像用）
   */
  private loadTexture(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          resolve(texture);
        },
        undefined,
        (error) => reject(error)
      );
    });
  }

  /**
   * 手の画像テクスチャを取得
   */
  getHandTexture(type: HandType): THREE.Texture | undefined {
    return this.textures.get(`hand-${type}`);
  }

  /**
   * 丸枠のテクスチャを取得
   */
  getFrameTexture(type: HandType): THREE.Texture | undefined {
    return this.textures.get(`frame-${type}`);
  }

  /**
   * ハートのテクスチャを取得
   */
  getHeartTexture(filled: boolean): THREE.Texture | undefined {
    return this.textures.get(filled ? 'heart-filled' : 'heart-empty');
  }

  /**
   * 背景のテクスチャを取得
   */
  getBackgroundTexture(): THREE.Texture | undefined {
    return this.textures.get('background');
  }

  /**
   * オーバーレイのテクスチャを取得
   */
  getOverlayTexture(): THREE.Texture | undefined {
    return this.textures.get('overlay');
  }

  /**
   * 実画像の使用を切り替え
   */
  setUseRealAssets(use: boolean): void {
    this.useRealAssets = use;
  }

  /**
   * すべてのテクスチャを破棄
   */
  dispose(): void {
    this.textures.forEach((texture) => {
      texture.dispose();
    });
    this.textures.clear();
  }
}

// シングルトンインスタンス
export const assetLoader = new AssetLoader();
