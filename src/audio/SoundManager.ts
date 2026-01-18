/**
 * 効果音管理クラス（シングルトン）
 * Web Audio APIを使用して音声ファイルを再生
 */

import { settingsManager } from '../utils/Settings';

export type SoundType = 'win' | 'draw_or_lose';

export class SoundManager {
  private static instance: SoundManager | null = null;
  private audioContext: AudioContext;
  private sounds: Map<SoundType, AudioBuffer> = new Map();
  private initialized = false;

  private constructor() {
    this.audioContext = new AudioContext();
  }

  /**
   * シングルトンインスタンスを取得
   */
  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * 音声ファイルを読み込む
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // 勝利時の効果音
      const winBuffer = await this.loadSound('/小キック.mp3');
      this.sounds.set('win', winBuffer);

      // あいこ・負け時の効果音
      const drawLoseBuffer = await this.loadSound('/ロボットを殴る3.mp3');
      this.sounds.set('draw_or_lose', drawLoseBuffer);

      this.initialized = true;
    } catch (error) {
      console.error('Failed to load sounds:', error);
    }
  }

  /**
   * 音声ファイルを読み込んでAudioBufferに変換
   */
  private async loadSound(url: string): Promise<AudioBuffer> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await this.audioContext.decodeAudioData(arrayBuffer);
  }

  /**
   * 効果音を再生
   */
  play(type: SoundType): void {
    // 効果音が無効な場合は再生しない
    if (!settingsManager.getSoundEnabled()) {
      return;
    }

    if (!this.initialized) {
      console.warn('SoundManager not initialized');
      return;
    }

    const buffer = this.sounds.get(type);
    if (!buffer) {
      console.warn(`Sound not found: ${type}`);
      return;
    }

    // AudioContextが停止している場合は再開
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // AudioBufferSourceNodeを作成して再生
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start(0);
  }

  /**
   * リソースの破棄
   */
  dispose(): void {
    this.sounds.clear();
    this.audioContext.close();
  }
}
