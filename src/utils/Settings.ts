import type { Settings } from '../types';
import { STORAGE_KEYS } from './Constants';

/**
 * ゲーム設定の管理クラス（LocalStorage使用）
 */
export class SettingsManager {
  private settings: Settings;

  constructor() {
    // LocalStorageから設定を読み込む
    this.settings = this.loadSettings();
  }

  /**
   * LocalStorageから設定を読み込む
   */
  private loadSettings(): Settings {
    const cameraEnabled = localStorage.getItem(STORAGE_KEYS.CAMERA_ENABLED);

    return {
      cameraEnabled: cameraEnabled === 'true', // デフォルトはfalse
    };
  }

  /**
   * 設定をLocalStorageに保存
   */
  private saveSettings(): void {
    localStorage.setItem(
      STORAGE_KEYS.CAMERA_ENABLED,
      String(this.settings.cameraEnabled)
    );
  }

  /**
   * カメラ設定を取得
   */
  getCameraEnabled(): boolean {
    return this.settings.cameraEnabled;
  }

  /**
   * カメラ設定を変更
   */
  setCameraEnabled(enabled: boolean): void {
    this.settings.cameraEnabled = enabled;
    this.saveSettings();
  }

  /**
   * カメラ設定をトグル
   */
  toggleCamera(): boolean {
    this.settings.cameraEnabled = !this.settings.cameraEnabled;
    this.saveSettings();
    return this.settings.cameraEnabled;
  }

  /**
   * ハイスコアを取得
   */
  getHighScore(): number {
    const highScore = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
    return highScore ? parseInt(highScore, 10) : 0;
  }

  /**
   * ハイスコアを保存（現在のスコアより高い場合のみ）
   */
  saveHighScore(score: number): boolean {
    const currentHighScore = this.getHighScore();
    if (score > currentHighScore) {
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, String(score));
      return true; // 新記録
    }
    return false;
  }

  /**
   * すべての設定をリセット
   */
  reset(): void {
    localStorage.removeItem(STORAGE_KEYS.CAMERA_ENABLED);
    localStorage.removeItem(STORAGE_KEYS.HIGH_SCORE);
    this.settings = this.loadSettings();
  }
}

// シングルトンインスタンス
export const settingsManager = new SettingsManager();
