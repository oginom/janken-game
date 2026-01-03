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
    const cameraVisible = localStorage.getItem(STORAGE_KEYS.CAMERA_VISIBLE);

    return {
      cameraVisible: cameraVisible === 'true', // デフォルトはfalse
    };
  }

  /**
   * 設定をLocalStorageに保存
   */
  private saveSettings(): void {
    localStorage.setItem(
      STORAGE_KEYS.CAMERA_VISIBLE,
      String(this.settings.cameraVisible)
    );
  }

  /**
   * カメラ表示設定を取得
   */
  getCameraVisible(): boolean {
    return this.settings.cameraVisible;
  }

  /**
   * カメラ表示設定を変更
   */
  setCameraVisible(visible: boolean): void {
    this.settings.cameraVisible = visible;
    this.saveSettings();
  }

  /**
   * カメラ表示設定をトグル
   */
  toggleCameraVisible(): boolean {
    this.settings.cameraVisible = !this.settings.cameraVisible;
    this.saveSettings();
    return this.settings.cameraVisible;
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
    localStorage.removeItem(STORAGE_KEYS.CAMERA_VISIBLE);
    localStorage.removeItem(STORAGE_KEYS.HIGH_SCORE);
    this.settings = this.loadSettings();
  }
}

/**
 * キーボードデバッグモード判定
 * 環境変数またはURLクエリパラメータでキーボード操作を有効化
 */
export function isKeyboardDebugMode(): boolean {
  // 環境変数チェック
  if (import.meta.env.VITE_DEBUG_KEYBOARD === 'true') {
    return true;
  }

  // URLクエリパラメータチェック
  const params = new URLSearchParams(window.location.search);
  return params.get('debug') === 'keyboard';
}

// シングルトンインスタンス
export const settingsManager = new SettingsManager();
