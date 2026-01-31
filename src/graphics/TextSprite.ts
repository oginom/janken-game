import * as THREE from 'three';
import { SCREEN } from '../utils/Constants';

/**
 * 画面座標(左上原点)をThree.js座標(中心原点)に変換
 */
function screenToThreeCoords(x: number, y: number): { x: number; y: number } {
  return {
    x: x - SCREEN.WIDTH / 2,
    y: -(y - SCREEN.HEIGHT / 2),
  };
}

export interface TextSpriteOptions {
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  fontWeight?: string;
  textShadow?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  align?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  padding?: number;
}

/**
 * Canvasでテキストを描画してSpriteとして表示するクラス
 */
export class TextSprite {
  private sprite: THREE.Sprite;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;
  private currentText: string;
  private options: Required<TextSpriteOptions>;
  private screenX: number;
  private screenY: number;

  constructor(text: string, screenX: number, screenY: number, options: TextSpriteOptions = {}) {
    this.currentText = text;
    this.screenX = screenX;
    this.screenY = screenY;

    // デフォルトオプション
    this.options = {
      fontSize: options.fontSize ?? 24,
      color: options.color ?? '#ffffff',
      fontFamily: options.fontFamily ?? 'Arial, sans-serif',
      fontWeight: options.fontWeight ?? 'bold',
      textShadow: options.textShadow ?? true,
      shadowColor: options.shadowColor ?? 'rgba(0, 0, 0, 0.8)',
      shadowBlur: options.shadowBlur ?? 4,
      shadowOffsetX: options.shadowOffsetX ?? 2,
      shadowOffsetY: options.shadowOffsetY ?? 2,
      align: options.align ?? 'left',
      backgroundColor: options.backgroundColor ?? 'transparent',
      padding: options.padding ?? 10,
    };

    // Canvas作成
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d')!;

    // テクスチャとスプライトを作成
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;

    const material = new THREE.SpriteMaterial({
      map: this.texture,
      transparent: true,
    });

    this.sprite = new THREE.Sprite(material);

    // 初期描画
    this.updateTexture();
  }

  /**
   * テキストを更新
   */
  setText(text: string): void {
    if (this.currentText !== text) {
      this.currentText = text;
      this.updateTexture();
    }
  }

  /**
   * テキストを取得
   */
  getText(): string {
    return this.currentText;
  }

  /**
   * Canvasにテキストを描画してテクスチャを更新
   */
  private updateTexture(): void {
    const ctx = this.context;
    const { fontSize, color, fontFamily, fontWeight, textShadow, shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY, padding } = this.options;

    // フォント設定
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

    // テキストサイズを測定
    const metrics = ctx.measureText(this.currentText);
    const textWidth = metrics.width;
    const textHeight = fontSize * 1.2; // フォントサイズから概算

    // Canvas サイズを設定（高解像度対応）
    const scale = window.devicePixelRatio || 1;
    const canvasWidth = Math.ceil((textWidth + padding * 2) * scale);
    const canvasHeight = Math.ceil((textHeight + padding * 2) * scale);

    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;

    // スケーリング適用
    ctx.scale(scale, scale);

    // フォント設定（canvasサイズ変更後に再設定が必要）
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'top';
    ctx.textAlign = this.options.align;

    // 背景を描画（必要な場合）
    if (this.options.backgroundColor !== 'transparent') {
      ctx.fillStyle = this.options.backgroundColor;
      ctx.fillRect(0, 0, textWidth + padding * 2, textHeight + padding * 2);
    }

    // テキストの影
    if (textShadow) {
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = shadowBlur;
      ctx.shadowOffsetX = shadowOffsetX;
      ctx.shadowOffsetY = shadowOffsetY;
    }

    // テキストを描画
    ctx.fillStyle = color;
    let textX = padding;
    if (this.options.align === 'center') {
      textX = (textWidth + padding * 2) / 2;
    } else if (this.options.align === 'right') {
      textX = textWidth + padding;
    }
    ctx.fillText(this.currentText, textX, padding);

    // テクスチャを再作成（Canvasサイズ変更時に必要）
    const oldTexture = this.texture;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;

    // マテリアルのマップを更新
    const material = this.sprite.material as THREE.SpriteMaterial;
    material.map = this.texture;
    material.needsUpdate = true;

    // 古いテクスチャを破棄
    oldTexture.dispose();

    // スプライトのサイズと位置を更新
    const spriteWidth = textWidth + padding * 2;
    const spriteHeight = textHeight + padding * 2;

    this.sprite.scale.set(spriteWidth, spriteHeight, 1);

    // 画面座標をthree.js座標に変換
    const coords = screenToThreeCoords(this.screenX, this.screenY);

    // アライメントに応じてオフセット調整
    let offsetX = 0;
    if (this.options.align === 'left') {
      offsetX = spriteWidth / 2;
    } else if (this.options.align === 'right') {
      offsetX = -spriteWidth / 2;
    }

    const finalX = coords.x + offsetX;
    const finalY = coords.y - spriteHeight / 2;

    // z座標は2に設定（他のUI要素と同じ深度、背景より手前）
    this.sprite.position.set(finalX, finalY, 2);
  }

  /**
   * Spriteを取得
   */
  getSprite(): THREE.Sprite {
    return this.sprite;
  }

  /**
   * 表示/非表示を設定
   */
  setVisible(visible: boolean): void {
    this.sprite.visible = visible;
  }

  /**
   * リソースを破棄
   */
  dispose(): void {
    this.texture.dispose();
    this.sprite.material.dispose();
  }
}
