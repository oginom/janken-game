import type { HandType } from '../types';
import { DIFFICULTY_TABLE, ENEMY_BASE_SPEED } from '../utils/Constants';

/**
 * 難易度設定の情報
 */
export interface DifficultyConfig {
  level: number;
  speed: number; // 速度倍率
  interval: number; // 次の敵が出るまでの間隔（秒）
  bothHands: boolean; // 両手同時に出すか
  randomHands: boolean; // 左右の手を別々にするか
}

/**
 * 難易度管理クラス
 */
export class DifficultyManager {
  private defeatedCount: number = 0;
  private currentLevel: number = 1;

  /**
   * 倒した数をカウント
   */
  incrementDefeatedCount(): void {
    this.defeatedCount++;
    this.updateLevel();
  }

  /**
   * 倒した数をリセット
   */
  resetDefeatedCount(): void {
    this.defeatedCount = 0;
    this.currentLevel = 1;
  }

  /**
   * 倒した数を取得
   */
  getDefeatedCount(): number {
    return this.defeatedCount;
  }

  /**
   * 現在のレベルを取得
   */
  getCurrentLevel(): number {
    return this.currentLevel;
  }

  /**
   * レベルを更新（5個倒すごとにレベルアップ）
   */
  private updateLevel(): void {
    const newLevel = Math.floor(this.defeatedCount / 5) + 1;
    if (newLevel !== this.currentLevel) {
      this.currentLevel = newLevel;
      console.log(`難易度レベルアップ: ${this.currentLevel}`);
    }
  }

  /**
   * 現在の難易度設定を取得
   */
  getCurrentConfig(): DifficultyConfig {
    // レベルに対応する設定を取得（存在しない場合は最高レベルの設定）
    const config = DIFFICULTY_TABLE.find((c) => c.level === this.currentLevel);
    if (config) {
      return config;
    }

    // レベルが最大を超えた場合、速度とインターバルを調整
    const maxConfig = DIFFICULTY_TABLE[DIFFICULTY_TABLE.length - 1];
    const extraLevels = this.currentLevel - maxConfig.level;

    // インターバル: a + b/(x + c) 形式で0.5秒に漸近
    // maxConfig時（extraLevels=0）のインターバル: maxConfigInterval = a + b/(1 - c)
    // 最小値（漸近値）: a = 0.5
    // maxConfig時の傾き: d/dx[a + b/(x+c)] = -b/(x+c)² で x=1 のとき -0.1
    // よって: -b/(1+c)² = -0.1 → b = 0.1*(1+c)²
    // また: a + b/(1+c) = 1.0 → 0.5 + b/(1+c) = 1.0 → b/(1+c) = 0.5
    // b = 0.5*(1+c) より、0.1*(1+c)² = 0.5*(1+c)
    // 0.1*(1+c) = 0.5 → 1+c = 5 → c = 4
    const a = 0.5;
    const c = 4;
    const b = 0.5 * (1 + c); // b = 0.5 * 5 = 2.5
    const x = extraLevels + 1; // extraLevels=0のとき x=1
    const newInterval = a + b / (x + c);

    // 速度: intervalの逆数に比例
    // maxConfig時の速度: maxConfigSpeed
    // maxConfig時のインターバル: maxConfigInterval
    // newSpeed / maxConfigSpeed = maxConfigInterval / newInterval
    const newSpeed = maxConfig.speed * (maxConfig.interval / newInterval);

    return {
      ...maxConfig,
      level: this.currentLevel,
      speed: newSpeed,
      interval: newInterval,
    };
  }

  /**
   * 現在の降下速度を取得（ピクセル/秒）
   */
  getCurrentSpeed(): number {
    const config = this.getCurrentConfig();
    return ENEMY_BASE_SPEED * config.speed;
  }

  /**
   * 現在の生成インターバルを取得（秒）
   */
  getCurrentInterval(): number {
    const config = this.getCurrentConfig();
    return config.interval;
  }

  /**
   * 次の敵の手を生成（ランダム）
   */
  generateNextHand(): {
    leftHand: HandType | null;
    rightHand: HandType | null;
  } {
    const config = this.getCurrentConfig();
    const handTypes: HandType[] = ['rock', 'scissors', 'paper'];

    if (!config.bothHands) {
      // 片手のみ
      const side = Math.random() < 0.5 ? 'left' : 'right';
      const type = handTypes[Math.floor(Math.random() * handTypes.length)];

      return {
        leftHand: side === 'left' ? type : null,
        rightHand: side === 'right' ? type : null,
      };
    } else {
      // 両手
      const leftType = handTypes[Math.floor(Math.random() * handTypes.length)];

      if (config.randomHands && Math.random() < 0.5) {
        // 別々の手
        const rightType = handTypes[Math.floor(Math.random() * handTypes.length)];
        return {
          leftHand: leftType,
          rightHand: rightType,
        };
      } else {
        // 同じ手
        return {
          leftHand: leftType,
          rightHand: leftType,
        };
      }
    }
  }
}
