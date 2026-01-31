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
  private bgmAudio: HTMLAudioElement | null = null;

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
   * BGMを開始
   */
  playBGM(): void {
    // 既にBGMが再生中の場合はスキップ
    if (this.bgmAudio && !this.bgmAudio.paused) {
      return;
    }

    // BGMオーディオ要素を初期化
    if (!this.bgmAudio) {
      this.bgmAudio = new Audio('/COLORS_2.mp3');
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = 0.5; // ボリュームを50%に設定
    }

    // 効果音が有効な場合のみ再生
    if (settingsManager.getSoundEnabled()) {
      this.bgmAudio.play().catch((error) => {
        console.error('BGM再生エラー:', error);
      });
    }
  }

  /**
   * BGMを停止
   */
  stopBGM(): void {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
    }
  }

  /**
   * BGMの一時停止
   */
  pauseBGM(): void {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
  }

  /**
   * BGMの再開
   */
  resumeBGM(): void {
    if (this.bgmAudio && this.bgmAudio.paused) {
      if (settingsManager.getSoundEnabled()) {
        this.bgmAudio.play().catch((error) => {
          console.error('BGM再開エラー:', error);
        });
      }
    }
  }

  /**
   * リソースの破棄
   */
  dispose(): void {
    this.stopBGM();
    if (this.bgmAudio) {
      this.bgmAudio = null;
    }
    this.sounds.clear();
    this.audioContext.close();
  }
}
