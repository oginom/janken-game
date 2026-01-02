import type { GamePhase } from '../types';
import { GAME_CONFIG } from '../utils/Constants';

/**
 * ゲーム状態のイベント
 */
export type GameStateEventType =
  | 'phase-change'
  | 'score-change'
  | 'lives-change'
  | 'game-over';

export interface GameStateEvent {
  type: GameStateEventType;
  data?: any;
}

/**
 * ゲーム状態管理クラス
 */
export class GameState {
  private phase: GamePhase = 'title';
  private score: number = GAME_CONFIG.INITIAL_SCORE;
  private lives: number = GAME_CONFIG.INITIAL_LIVES;
  private defeatedCount: number = 0;
  private difficulty: number = 1;
  private listeners: Map<GameStateEventType, Set<(event: GameStateEvent) => void>> = new Map();

  constructor() {
    // イベントリスナーマップを初期化
    this.listeners.set('phase-change', new Set());
    this.listeners.set('score-change', new Set());
    this.listeners.set('lives-change', new Set());
    this.listeners.set('game-over', new Set());
  }

  /**
   * イベントリスナーを追加
   */
  on(eventType: GameStateEventType, callback: (event: GameStateEvent) => void): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.add(callback);
    }
  }

  /**
   * イベントリスナーを削除
   */
  off(eventType: GameStateEventType, callback: (event: GameStateEvent) => void): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * イベントを発火
   */
  private emit(event: GameStateEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach((callback) => callback(event));
    }
  }

  /**
   * ゲームフェーズを取得
   */
  getPhase(): GamePhase {
    return this.phase;
  }

  /**
   * ゲームフェーズを設定
   */
  setPhase(phase: GamePhase): void {
    if (this.phase !== phase) {
      this.phase = phase;
      this.emit({ type: 'phase-change', data: phase });
    }
  }

  /**
   * スコアを取得
   */
  getScore(): number {
    return this.score;
  }

  /**
   * スコアを加算
   */
  addScore(points: number): void {
    this.score += points;
    this.emit({ type: 'score-change', data: this.score });
  }

  /**
   * スコアをリセット
   */
  resetScore(): void {
    this.score = GAME_CONFIG.INITIAL_SCORE;
    this.emit({ type: 'score-change', data: this.score });
  }

  /**
   * ライフを取得
   */
  getLives(): number {
    return this.lives;
  }

  /**
   * ライフを減らす
   */
  loseLife(amount: number = 1): void {
    this.lives = Math.max(0, this.lives - amount);
    this.emit({ type: 'lives-change', data: this.lives });

    if (this.lives <= 0) {
      this.emit({ type: 'game-over', data: { score: this.score } });
    }
  }

  /**
   * ライフをリセット
   */
  resetLives(): void {
    this.lives = GAME_CONFIG.INITIAL_LIVES;
    this.emit({ type: 'lives-change', data: this.lives });
  }

  /**
   * 倒した数を取得
   */
  getDefeatedCount(): number {
    return this.defeatedCount;
  }

  /**
   * 倒した数を増やす
   */
  incrementDefeatedCount(): void {
    this.defeatedCount++;
  }

  /**
   * 倒した数をリセット
   */
  resetDefeatedCount(): void {
    this.defeatedCount = 0;
  }

  /**
   * 難易度レベルを取得
   */
  getDifficulty(): number {
    return this.difficulty;
  }

  /**
   * 難易度レベルを設定
   */
  setDifficulty(difficulty: number): void {
    this.difficulty = difficulty;
  }

  /**
   * ゲーム状態を初期化（新規ゲーム開始時）
   */
  reset(): void {
    this.score = GAME_CONFIG.INITIAL_SCORE;
    this.lives = GAME_CONFIG.INITIAL_LIVES;
    this.defeatedCount = 0;
    this.difficulty = 1;

    // イベントを発火
    this.emit({ type: 'score-change', data: this.score });
    this.emit({ type: 'lives-change', data: this.lives });
  }

  /**
   * 現在の状態を取得（デバッグ用）
   */
  getState() {
    return {
      phase: this.phase,
      score: this.score,
      lives: this.lives,
      defeatedCount: this.defeatedCount,
      difficulty: this.difficulty,
    };
  }
}
