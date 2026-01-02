import type { HandType } from '../../types';
import { HAND_COLORS } from '../../utils/Constants';

/**
 * Canvas APIを使ってプレースホルダー画像を生成するクラス
 */
export class PlaceholderGenerator {
  /**
   * グー・チョキ・パーの画像を生成
   */
  static generateHandImage(type: HandType, size: number = 80): string {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 3;

    // 背景色（手の種類に応じた色）
    const color = this.colorToHex(HAND_COLORS[type]);

    // 円を描画
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // 手の形を文字で表現
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size / 2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const symbols: Record<HandType, string> = {
      rock: '✊',
      scissors: '✌',
      paper: '✋',
    };

    ctx.fillText(symbols[type], centerX, centerY);

    return canvas.toDataURL();
  }

  /**
   * 丸枠の画像を生成（敵の手を囲む用）
   */
  static generateCircleFrame(type: HandType, size: number = 100): string {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 5;

    // 枠の色（手の種類に応じた色）
    const color = this.colorToHex(HAND_COLORS[type]);

    // 円の枠を描画
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    return canvas.toDataURL();
  }

  /**
   * ハートの画像を生成
   */
  static generateHeart(filled: boolean, size: number = 40): string {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const centerX = size / 2;
    const topY = size / 4;
    const bottomY = size * 0.85;

    ctx.fillStyle = filled ? '#ff4444' : '#666666';

    // ハートの形を描画（簡易版）
    ctx.beginPath();
    ctx.moveTo(centerX, bottomY);

    // 左側の曲線
    ctx.bezierCurveTo(
      size * 0.2, size * 0.6,
      size * 0.2, topY,
      centerX, topY
    );

    // 右側の曲線
    ctx.bezierCurveTo(
      size * 0.8, topY,
      size * 0.8, size * 0.6,
      centerX, bottomY
    );

    ctx.fill();

    // 塗りつぶしていない場合は枠線を追加
    if (!filled) {
      ctx.strokeStyle = '#444444';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    return canvas.toDataURL();
  }

  /**
   * 背景画像を生成（単色のグラデーション）
   */
  static generateBackground(width: number, height: number): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // グラデーション背景
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    return canvas.toDataURL();
  }

  /**
   * 白い半透明オーバーレイを生成
   */
  static generateOverlay(
    width: number,
    height: number,
    alpha: number = 0.7
  ): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(0, 0, width, height);

    return canvas.toDataURL();
  }

  /**
   * 数値カラーを16進数文字列に変換
   */
  private static colorToHex(color: number): string {
    return '#' + color.toString(16).padStart(6, '0');
  }

  /**
   * すべてのプレースホルダー画像を一括生成
   */
  static generateAll() {
    return {
      hands: {
        rock: this.generateHandImage('rock'),
        scissors: this.generateHandImage('scissors'),
        paper: this.generateHandImage('paper'),
      },
      frames: {
        rock: this.generateCircleFrame('rock'),
        scissors: this.generateCircleFrame('scissors'),
        paper: this.generateCircleFrame('paper'),
      },
      hearts: {
        filled: this.generateHeart(true),
        empty: this.generateHeart(false),
      },
      background: this.generateBackground(375, 667),
      overlay: this.generateOverlay(375, 667, 0.7),
    };
  }
}
