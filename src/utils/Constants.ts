import type { DifficultyConfig } from '../types';

/**
 * ゲーム全体で使用する定数
 */

// 画面サイズ（スマホ縦持ち想定）
export const SCREEN = {
  WIDTH: 375,
  HEIGHT: 667,
  ASPECT_RATIO: 375 / 667,
} as const;

// ゲーム設定
export const GAME_CONFIG = {
  INITIAL_LIVES: 3,
  INITIAL_SCORE: 0,
  SCORE_PER_WIN: 10,
  LIFE_LOSS_ON_LOSE: 3,
  LIFE_LOSS_ON_DRAW: 1,
  DIFFICULTY_INTERVAL: 5, // 5個倒すごとに難易度上昇
} as const;

// 難易度テーブル
// 5個倒すごとにレベルアップし、速度とインターバルが変化
export const DIFFICULTY_TABLE: DifficultyConfig[] = [
  {
    level: 1,
    speed: 1.0,
    interval: 3.0,
    bothHands: false, // 片手のみ
    randomHands: false,
  },
  {
    level: 2,
    speed: 1.2,
    interval: 2.5,
    bothHands: true, // 両手だが同じ手
    randomHands: false,
  },
  {
    level: 3,
    speed: 1.5,
    interval: 2.0,
    bothHands: true,
    randomHands: true, // 時々別々の手
  },
  {
    level: 4,
    speed: 1.8,
    interval: 1.5,
    bothHands: true,
    randomHands: true, // ランダム
  },
  {
    level: 5,
    speed: 2.2,
    interval: 1.2,
    bothHands: true,
    randomHands: true,
  },
  // レベル6以降はレベル5の設定を維持しつつ、さらに速度を上げる
  {
    level: 6,
    speed: 2.5,
    interval: 1.0,
    bothHands: true,
    randomHands: true,
  },
] as const;

// 手の種類ごとの色定義
export const HAND_COLORS = {
  rock: 0xff4444, // 赤
  scissors: 0x4444ff, // 青
  paper: 0x44ff44, // 緑
} as const;

// プレイヤーの手の位置
export const PLAYER_HAND_POSITION = {
  Y: 580, // 下部のY座標
  LEFT_X: 100,
  RIGHT_X: 275,
} as const;

// 敵の手の初期位置と範囲
export const ENEMY_HAND_POSITION = {
  START_Y: -50, // 画面上部外側から開始
  PREVIEW_Y: 80, // 予告表示のY座標
  END_Y: 520, // プレイヤーの手の少し上
  LEFT_X: 100,
  RIGHT_X: 275,
} as const;

// 敵の手の基本速度（ピクセル/秒）
export const ENEMY_BASE_SPEED = 100;

// アニメーション設定
export const ANIMATION = {
  HAND_BOUNCE_HEIGHT: 20, // 手が跳ねる高さ
  HAND_BOUNCE_DURATION: 0.3, // 跳ねるアニメーションの時間（秒）
} as const;

// 背景設定
export const BACKGROUND = {
  OVERLAY_ALPHA: 0.7, // 白い半透明オーバーレイの透明度
  COLOR: 0xffffff, // オーバーレイの色（白）
} as const;

// カメラ設定
export const CAMERA_CONFIG = {
  WIDTH: 640,
  HEIGHT: 480,
  FPS: 30,
} as const;

// MediaPipe ジェスチャー名マッピング
export const GESTURE_MAPPING = {
  Closed_Fist: 'rock',
  Victory: 'scissors',
  Open_Palm: 'paper',
} as const;

// LocalStorage キー
export const STORAGE_KEYS = {
  CAMERA_ENABLED: 'janken_camera_enabled',
  HIGH_SCORE: 'janken_high_score',
} as const;
