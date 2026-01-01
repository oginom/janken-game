# じゃんけんボクサー - 実装計画

## プロジェクト構成

```
janken-game/
├── src/
│   ├── main.ts                 # エントリーポイント
│   ├── app.ts                  # アプリケーションメインクラス
│   ├── scenes/                 # 各画面の実装
│   │   ├── TitleScene.ts       # タイトル画面
│   │   ├── ReadyScene.ts       # プレイ開始待機画面
│   │   ├── GameScene.ts        # ゲームプレイ画面
│   │   └── GameOverScene.ts    # ゲームオーバー画面
│   ├── game/                   # ゲームロジック
│   │   ├── GameState.ts        # ゲーム状態管理
│   │   ├── HandTracker.ts      # MediaPipeハンドトラッキング
│   │   ├── EnemyManager.ts     # 敵の手の生成・管理
│   │   ├── CollisionDetector.ts # 衝突判定
│   │   └── DifficultyManager.ts # 難易度管理
│   ├── graphics/               # Three.js描画関連
│   │   ├── Renderer.ts         # レンダラー初期化
│   │   ├── Camera.ts           # カメラ設定
│   │   ├── Background.ts       # 背景描画
│   │   ├── HandSprite.ts       # 手のスプライト
│   │   └── UIElements.ts       # UI要素(ライフ、スコア)
│   ├── assets/                 # アセット管理
│   │   ├── AssetLoader.ts      # アセット読み込み
│   │   └── placeholders/       # プレースホルダー画像生成
│   │       └── PlaceholderGenerator.ts
│   ├── audio/                  # サウンド管理
│   │   ├── SoundManager.ts     # 効果音管理
│   │   └── sounds/             # 効果音ファイル(後で追加)
│   ├── utils/                  # ユーティリティ
│   │   ├── Settings.ts         # 設定管理(LocalStorage)
│   │   └── Constants.ts        # 定数定義
│   └── types/                  # 型定義
│       └── index.ts
├── public/                     # 静的ファイル
│   └── assets/                 # 実際の画像・音声(後で追加)
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 実装フェーズ

> **注意事項**
> - 実装完了したら、このドキュメントのチェックリストを checked に更新する
> - フェーズごとに、実装完了したらユーザーにレビューを依頼する
> - 実際の動作確認はユーザーが行う

### フェーズ1: プロジェクトセットアップ
- [x] Vite + TypeScriptプロジェクト初期化
- [x] 必要なパッケージのインストール
  - `three`
  - `@mediapipe/tasks-vision`
  - `@types/three`
- [x] 基本的なHTML構造作成
- [x] Vite設定(開発サーバー、ビルド設定)

### フェーズ2: 型定義と定数
- [ ] `types/index.ts` - 全体で使用する型定義
- [ ] `utils/Constants.ts` - ゲーム定数の定義
  - 画面サイズ
  - 初期ライフ数
  - スコア加算値
  - 難易度テーブル
  - 色定義(手の種類ごと)
- [ ] `utils/Settings.ts` - LocalStorage管理

### フェーズ3: アセット管理
- [ ] `assets/placeholders/PlaceholderGenerator.ts` - Canvas APIで図形生成
  - グー・チョキ・パーのシンプルな図形
  - ハート、空ハートの図形
  - 丸枠の図形(3色)
  - 背景用の単色画像
- [ ] `assets/AssetLoader.ts` - アセット読み込み管理
  - 画像読み込み
  - テクスチャ作成
  - アセット切り替え機能(プレースホルダー⇔実画像)

### フェーズ4: Three.js基盤
- [ ] `graphics/Renderer.ts` - WebGLRenderer初期化
- [ ] `graphics/Camera.ts` - OrthographicCamera設定
- [ ] `graphics/Background.ts` - 背景描画
  - カメラフィード表示
  - 背景画像表示
  - 半透明オーバーレイ
- [ ] `graphics/HandSprite.ts` - 手のスプライト描画
  - テクスチャ適用
  - アニメーション(跳ねる動き)
- [ ] `graphics/UIElements.ts` - UI描画
  - ライフ表示
  - スコア表示(HTML要素でも可)

### フェーズ5: MediaPipeハンドトラッキング
- [ ] `game/HandTracker.ts` - MediaPipe Hands統合
  - カメラ初期化
  - ハンドトラッキング開始
  - ジェスチャー認識(グー・チョキ・パー)
  - 左右の手の区別
  - トラッキング状態管理

### フェーズ6: ゲームロジック
- [ ] `game/GameState.ts` - 状態管理
  - ゲームフェーズ管理
  - スコア・ライフ管理
  - 状態変更通知(イベント)
- [ ] `game/DifficultyManager.ts` - 難易度管理
  - 倒した数カウント
  - 難易度レベル計算
  - 降下速度・インターバル計算
- [ ] `game/EnemyManager.ts` - 敵の手の管理
  - 敵の手の生成(タイミング、種類)
  - 位置更新(降下)
  - 次の手の表示(予告)
  - 削除処理
- [ ] `game/CollisionDetector.ts` - 衝突・勝敗判定
  - 敵の手とプレイヤーの手の衝突検出
  - じゃんけん勝敗判定
  - スコア加算・ライフ減少処理

### フェーズ7: シーン実装
- [ ] `scenes/TitleScene.ts` - タイトル画面
  - UIレイアウト
  - ゲーム開始ボタン
  - カメラ設定トグル
  - シーン遷移
- [ ] `scenes/ReadyScene.ts` - プレイ開始待機
  - ダイアログ表示
  - 両手チョキ認識待ち
  - ゲーム開始トリガー
- [ ] `scenes/GameScene.ts` - ゲームプレイ
  - すべてのゲーム要素の統合
  - 更新ループ(敵の移動、衝突判定)
  - 描画更新
- [ ] `scenes/GameOverScene.ts` - ゲームオーバー
  - スコア表示
  - 再挑戦ボタン
  - シーン遷移

### フェーズ8: サウンド
- [ ] `audio/SoundManager.ts` - 効果音管理
  - Web Audio API使用
  - プレースホルダー音(シンプルなビープ音)
  - 後で実際の音声ファイルに差し替え可能にする
- [ ] 効果音トリガー追加
  - 勝利時
  - 敗北/あいこ時
  - ゲームオーバー時

### フェーズ9: アプリケーション統合
- [ ] `app.ts` - アプリケーションメインクラス
  - シーン管理
  - レンダリングループ
  - イベントハンドリング
- [ ] `main.ts` - エントリーポイント
  - アプリケーション初期化
  - DOM Ready処理

### フェーズ10: テスト・調整
- [ ] 動作確認
  - 各シーン遷移
  - ハンドトラッキング精度
  - 衝突判定精度
- [ ] バランス調整
  - 難易度曲線
  - 降下速度・インターバル
  - スコア配分
- [ ] パフォーマンス最適化
  - フレームレート確認
  - メモリリーク確認

### フェーズ11: 仕上げ
- [ ] UI/UX改善
  - アニメーション調整
  - レスポンシブ対応
- [ ] エラーハンドリング
  - カメラアクセス失敗時
  - MediaPipe読み込み失敗時
- [ ] ドキュメント
  - README作成
  - 画像差し替え手順書

## 技術的考慮事項

### MediaPipe統合
```typescript
// HandTracker.ts の基本構造
import { GestureRecognizer, FilesetResolver } from '@mediapipe/tasks-vision';

class HandTracker {
  private gestureRecognizer: GestureRecognizer;
  private video: HTMLVideoElement;

  async initialize() {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );

    this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task"
      },
      numHands: 2,
      runningMode: "VIDEO"
    });
  }

  // ジェスチャー認識処理...
}
```

### Three.js 2D描画
```typescript
// Renderer.ts の基本構造
import * as THREE from 'three';

class GameRenderer {
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.OrthographicCamera;
  private scene: THREE.Scene;

  initialize(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });

    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 10;
    this.camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    this.scene = new THREE.Scene();
  }

  // 描画処理...
}
```

### ゲームループ
```typescript
// app.ts の基本構造
class App {
  private currentScene: Scene;
  private lastTime: number = 0;

  private gameLoop = (currentTime: number) => {
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // 更新
    this.currentScene.update(deltaTime);

    // 描画
    this.currentScene.render();

    requestAnimationFrame(this.gameLoop);
  };

  start() {
    requestAnimationFrame(this.gameLoop);
  }
}
```

## 依存パッケージ

```json
{
  "dependencies": {
    "three": "^0.160.0",
    "@mediapipe/tasks-vision": "^0.10.9"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "vite": "^5.0.0",
    "@types/three": "^0.160.0"
  }
}
```

## 開発Tips

### カメラ映像を背景に使う
- VideoTextureを使用してカメラフィードをテクスチャ化
- PlaneGeometryに適用して背景に配置
- 半透明の白いPlaneを重ねる

### プレースホルダー画像生成
- Canvas APIで図形を描画
- `toDataURL()`でData URI化
- Three.jsのTextureLoaderで読み込み

### 設定の永続化
- LocalStorageに`camera_enabled`などを保存
- 起動時に読み込んで適用

### パフォーマンス最適化
- Three.jsのオブジェクトは使いまわす(Object Pooling)
- MediaPipeの処理は間引く(requestAnimationFrameと別ループ)
- 不要なオブジェクトは`dispose()`で破棄

## 今後の拡張案
- ハイスコア記録機能
- 難易度選択(Easy/Normal/Hard)
- パワーアップアイテム
- コンボシステム
- ランキング機能(オンライン)
