/**
 * ゲーム全体で使用する型定義
 */

// ゲームフェーズ
export type GamePhase = 'title' | 'ready' | 'playing' | 'gameover';

// 手の種類
export type HandType = 'rock' | 'scissors' | 'paper';

// 手の位置（左右）
export type HandPosition = 'left' | 'right';

// プレイヤーの両手の状態
export interface PlayerHands {
  left: HandType;
  right: HandType;
}

// ゲーム状態
export interface GameState {
  phase: GamePhase;
  score: number;
  lives: number;
  difficulty: number; // 難易度レベル
  defeatedCount: number; // 倒した相手の手の数
}

// 敵の手
export interface EnemyHand {
  id: string;
  type: HandType;
  position: { x: number; y: number };
  target: HandPosition; // どちらの手に向かってくるか
  isPreview: boolean; // 次の手（予告）かどうか
  speed: number; // 降下速度
}

// 難易度設定
export interface DifficultyConfig {
  level: number;
  speed: number; // 降下速度倍率
  interval: number; // 出現インターバル（秒）
  bothHands: boolean; // 両手同時に出現するか
  randomHands: boolean; // 左右で異なる手を出すか
}

// じゃんけんの勝敗結果
export type GameResult = 'win' | 'lose' | 'draw';

// サウンドの種類
export type SoundType = 'win' | 'lose' | 'gameover';

// 設定
export interface Settings {
  cameraVisible: boolean;
}
