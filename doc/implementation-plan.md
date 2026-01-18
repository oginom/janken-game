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
> - **常にアプリが動く状態を保ち、各フェーズ完了後に動作確認を行う**

### ✅ 完了済みフェーズ

### フェーズ1: プロジェクトセットアップ
- [x] Vite + TypeScriptプロジェクト初期化
- [x] 必要なパッケージのインストール
  - `three`
  - `@mediapipe/tasks-vision`
  - `@types/three`
- [x] 基本的なHTML構造作成
- [x] Vite設定(開発サーバー、ビルド設定)

### フェーズ2: 型定義と定数
- [x] `types/index.ts` - 全体で使用する型定義
- [x] `utils/Constants.ts` - ゲーム定数の定義
  - 画面サイズ
  - 初期ライフ数
  - スコア加算値
  - 難易度テーブル
  - 色定義(手の種類ごと)
- [x] `utils/Settings.ts` - LocalStorage管理

### フェーズ3: アセット管理
- [x] `assets/placeholders/PlaceholderGenerator.ts` - Canvas APIで図形生成
  - グー・チョキ・パーのシンプルな図形
  - ハート、空ハートの図形
  - 丸枠の図形(3色)
  - 背景用の単色画像
- [x] `assets/AssetLoader.ts` - アセット読み込み管理
  - 画像読み込み
  - テクスチャ作成
  - アセット切り替え機能(プレースホルダー⇔実画像)

### フェーズ4: Three.js基盤
- [x] `graphics/Renderer.ts` - WebGLRenderer初期化
- [x] `graphics/Camera.ts` - OrthographicCamera設定
- [x] `graphics/Background.ts` - 背景描画
  - カメラフィード表示
  - 背景画像表示
  - 半透明オーバーレイ
- [x] `graphics/HandSprite.ts` - 手のスプライト描画
  - テクスチャ適用
  - アニメーション(跳ねる動き)
- [x] `graphics/UIElements.ts` - UI描画
  - ライフ表示
  - スコア表示(HTML要素でも可)

### 🚀 次に実装するフェーズ（動作確認しながら進める）

### フェーズ5: アプリケーション基盤（最小構成）
**目標: タイトル画面が表示される状態にする**
- [x] `app.ts` - アプリケーションメインクラス（最小構成）
  - シーン管理の基本構造
  - レンダリングループ
- [x] `scenes/Scene.ts` - シーン基底クラス
  - 共通インターフェース
- [x] `main.ts` をテストコードから本実装に置き換え
  - App クラスの初期化
  - エラーハンドリング

### フェーズ6: タイトル画面実装
**目標: タイトル画面が表示され、ボタンクリックで次の画面に遷移**
- [x] `scenes/TitleScene.ts` - タイトル画面
  - タイトルテキスト表示（HTML）
  - ゲーム開始ボタン（HTML）
  - カメラ設定トグル（HTML）
  - シーン遷移トリガー
- [x] 動作確認: タイトル画面の表示とボタン動作

### フェーズ7: ゲーム状態管理
**目標: ゲーム状態の管理ができる**
- [x] `game/GameState.ts` - 状態管理
  - ゲームフェーズ管理
  - スコア・ライフ管理
  - イベント通知機能
- [x] GameStateをシーンに統合

### フェーズ8: ゲームプレイ画面（基本実装）
**目標: プレイヤーの手が表示され、ダミーで手を切り替えられる**
- [x] `scenes/GameScene.ts` - ゲームプレイ画面（基本）
  - 背景表示
  - プレイヤーの手表示（左右）
  - UI表示（ライフ、スコア）
  - キーボードでダミー操作（1-6キーでグー/チョキ/パー切り替え）
- [x] 動作確認: ゲーム画面の表示と手の切り替え

### フェーズ9: 敵の手の実装
**目標: 敵の手が上から降ってくる**
- [x] `game/EnemyManager.ts` - 敵の手の管理
  - 敵の手の生成
  - 位置更新（降下）
  - 次の手の表示（予告）
  - 削除処理
- [x] `game/DifficultyManager.ts` - 難易度管理（基本）
  - 降下速度・インターバル計算
- [x] GameSceneに統合
- [x] 動作確認: 敵の手が降ってくる様子

### フェーズ10: 衝突判定とゲームロジック
**目標: じゃんけんの勝敗判定が動作する**
- [x] `game/CollisionDetector.ts` - 衝突・勝敗判定
  - 衝突検出
  - じゃんけん勝敗判定
  - スコア加算・ライフ減少処理
- [x] GameSceneに統合
- [x] 動作確認: じゃんけん判定、スコア・ライフの変動

### フェーズ11: 難易度システム
**目標: ゲームの難易度が時間経過で上がる**
- [x] DifficultyManagerの完全実装
  - 倒した数カウント
  - 難易度レベル計算
  - 両手同時出現、ランダム化
- [x] 動作確認: 難易度の変化

### フェーズ12: ゲームオーバー画面
**目標: ゲームオーバー時の画面遷移**
- [x] `scenes/GameOverScene.ts` - ゲームオーバー画面
  - スコア表示
  - 再挑戦ボタン
  - タイトルへ戻るボタン
- [x] GameSceneからの遷移実装
- [x] 動作確認: ゲームオーバーフローの確認

### フェーズ13: プレイ開始待機画面
**目標: ゲーム開始前の待機画面**
- [ ] ~~`scenes/ReadyScene.ts`~~ - スキップ（不要と判断、タイトルから直接ゲーム開始）

### フェーズ14: MediaPipeハンドトラッキング
**目標: 実際の手でプレイできる**
- [x] `game/HandTracker.ts` - MediaPipe Hands統合
  - カメラ初期化
  - ハンドトラッキング開始
  - ジェスチャー認識（グー・チョキ・パー）
  - 左右の手の区別
- [x] GameSceneに統合（ダミー操作から切り替え）
- [x] 動作確認: 実際の手でプレイ

### フェーズ14.5: カメラ表示機能拡張（追加実装）
**目標: カメラ表示とジェスチャー認識を分離し、UX向上**
- [x] カメラ表示とジェスチャー認識の独立化
  - `cameraEnabled` → `cameraVisible`に設定変更
  - `showsCamera`と`usesGesture`フラグの分離
- [x] カメラ映像の改善
  - 左右反転（鏡写し効果）実装
  - アスペクト比維持（fit/contain方式）
  - 白オーバーレイ（50%透明度）
- [x] 全シーンでのカメラ表示対応
  - TitleScene: カメラ起動とカメラ映像表示
  - GameScene: カメラストリーム再利用
  - GameOverScene: カメラストリーム再利用
- [x] カメラストリームのシームレス保持
  - シーン遷移時にカメラストリームを破棄せず保持
  - `handTracker.dispose()` → `handTracker.stop()`に変更
- [x] キーボードデバッグモード拡張
  - 環境変数対応（`VITE_DEBUG_KEYBOARD=true`）
  - URLパラメータ対応（`?debug=keyboard`）
  - 1-6キーで左右の手を個別操作
- [x] バグ修正
  - レースコンディション対策（GameScene.update()のnullチェック）
  - カメラ競合解消（dispose処理の最適化）

### フェーズ15: サウンド
**目標: 効果音が鳴る**
- [x] `audio/SoundManager.ts` - 効果音管理
  - Web Audio API使用
  - 実際の音声ファイル再生
- [x] GameSceneに効果音を追加
  - 勝利時: `/小キック.mp3`
  - 敗北/あいこ時: `/ロボットを殴る3.mp3`
- [ ] その他のシーンに効果音を追加（将来の拡張）
  - ゲームオーバー時

### フェーズ16: ボクサースプライト表示機能
**目標: ゲーム画面にボクサー画像を表示し、インタラクティブに反応**
- [x] `graphics/BoxerSprite.ts` - ボクサー画像管理
  - HTML要素での画像表示
  - 待機モーション（0.5秒ごとの上下動）
  - ポーズ変更アニメーション
  - 左右反転処理
- [x] Constants.ts にボクサー設定を追加
- [x] GameSceneに統合
  - 衝突判定時にポーズ変更
  - 更新・破棄処理
- [x] 動作確認: ボクサーの表示と反応

### フェーズ17: 最終調整
**目標: ゲーム全体の完成度を上げる**
- [ ] バランス調整（継続的に実施）
  - 難易度曲線
  - 降下速度・インターバル
  - スコア配分
- [x] パフォーマンス最適化
  - フレームレート確認
  - メモリリーク確認・対策（dispose処理の適切な実装）
- [ ] UI/UX改善（継続的に実施）
  - アニメーション調整
  - レスポンシブ対応
- [x] エラーハンドリング
  - カメラアクセス失敗時の対応
  - MediaPipe読み込み失敗時の対応（キーボード操作にフォールバック）
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
