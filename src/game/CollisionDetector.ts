import type { HandType } from '../types';
import type { EnemyHand } from './EnemyManager';
import { HandSprite } from '../graphics/HandSprite';
import { GAME_CONFIG } from '../utils/Constants';

/**
 * じゃんけんの結果
 */
export type JankenResult = 'win' | 'lose' | 'draw';

/**
 * 衝突判定の結果
 */
export interface CollisionResult {
  enemyIndex: number;
  side: 'left' | 'right';
  result: JankenResult;
  playerHand: HandType;
  enemyHand: HandType;
}

/**
 * 衝突判定とゲームロジッククラス
 */
export class CollisionDetector {
  /**
   * じゃんけんの勝敗を判定
   */
  static judgeJanken(playerHand: HandType, enemyHand: HandType): JankenResult {
    if (playerHand === enemyHand) {
      return 'draw';
    }

    // 勝利条件
    if (
      (playerHand === 'rock' && enemyHand === 'scissors') ||
      (playerHand === 'scissors' && enemyHand === 'paper') ||
      (playerHand === 'paper' && enemyHand === 'rock')
    ) {
      return 'win';
    }

    return 'lose';
  }

  /**
   * プレイヤーの手と敵の手の衝突を検出
   */
  static checkCollisions(
    leftHand: HandSprite | null,
    rightHand: HandSprite | null,
    enemies: EnemyHand[]
  ): CollisionResult[] {
    const results: CollisionResult[] = [];
    const collisionThreshold = 50; // 衝突判定の閾値（ピクセル）

    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      const enemyPos = enemy.sprite.getPosition();

      // 左手との衝突判定
      if (leftHand && enemy.side === 'left') {
        const playerPos = leftHand.getPosition();
        const distance = Math.abs(enemyPos.y - playerPos.y);

        if (distance < collisionThreshold) {
          const playerHandType = leftHand.getHandType();
          const result = this.judgeJanken(playerHandType, enemy.type);
          results.push({
            enemyIndex: i,
            side: 'left',
            result,
            playerHand: playerHandType,
            enemyHand: enemy.type,
          });
        }
      }

      // 右手との衝突判定
      if (rightHand && enemy.side === 'right') {
        const playerPos = rightHand.getPosition();
        const distance = Math.abs(enemyPos.y - playerPos.y);

        if (distance < collisionThreshold) {
          const playerHandType = rightHand.getHandType();
          const result = this.judgeJanken(playerHandType, enemy.type);
          results.push({
            enemyIndex: i,
            side: 'right',
            result,
            playerHand: playerHandType,
            enemyHand: enemy.type,
          });
        }
      }
    }

    return results;
  }

  /**
   * 衝突結果に基づいてスコアとライフを更新
   */
  static applyCollisionResult(
    result: CollisionResult,
    onScoreChange: (points: number) => void,
    onLivesChange: (amount: number) => void,
    onDefeated: () => void
  ): void {
    switch (result.result) {
      case 'win':
        console.log(
          `勝利！ プレイヤー: ${result.playerHand} vs 敵: ${result.enemyHand} (${result.side})`
        );
        onScoreChange(GAME_CONFIG.SCORE_PER_WIN);
        onDefeated();
        break;

      case 'lose':
        console.log(
          `敗北... プレイヤー: ${result.playerHand} vs 敵: ${result.enemyHand} (${result.side})`
        );
        onLivesChange(GAME_CONFIG.LIFE_LOSS_ON_LOSE);
        break;

      case 'draw':
        console.log(
          `あいこ プレイヤー: ${result.playerHand} vs 敵: ${result.enemyHand} (${result.side})`
        );
        onLivesChange(GAME_CONFIG.LIFE_LOSS_ON_DRAW);
        break;
    }
  }
}
