import './style.css';
import { App } from './app';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { settingsManager } from './utils/Settings';

console.log('じゃんけんボクサー - 起動中...');

/**
 * アプリケーションのエントリーポイント
 */
async function main() {
  try {
    // キャンバスとビデオ要素を取得
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    const video = document.getElementById('camera-feed') as HTMLVideoElement;

    if (!canvas || !video) {
      throw new Error('必要な要素が見つかりません');
    }

    // アプリケーションを作成
    const app = new App(canvas);

    // 初期化
    await app.init();

    // ゲーム開始処理
    const startGame = async () => {
      console.log('ゲーム開始');

      // ゲーム状態をリセット
      const gameState = app.getGameState();
      gameState.reset();
      gameState.setPhase('playing');

      // ゲームシーンを作成
      const gameScene = new GameScene(video, gameState);

      // ゲームオーバー時の処理を設定
      gameState.on('game-over', async (event) => {
        console.log('ゲームオーバー！スコア:', event.data.score);

        // ハイスコアを更新
        settingsManager.saveHighScore(event.data.score);
        const highScore = settingsManager.getHighScore();

        // ゲームオーバー画面に遷移
        const gameOverScene = new GameOverScene(video, event.data.score, highScore);

        // 再挑戦ボタンのコールバック
        gameOverScene.onRetry(async () => {
          await startGame();
        });

        // タイトルへ戻るボタンのコールバック
        gameOverScene.onTitle(async () => {
          const titleScene = new TitleScene(video);
          titleScene.onStart(async () => {
            await startGame();
          });
          await app.changeScene(titleScene);
        });

        await app.changeScene(gameOverScene);
      });

      // ゲームシーンに切り替え
      await app.changeScene(gameScene);
    };

    // タイトル画面を作成
    const titleScene = new TitleScene(video);
    titleScene.onStart(async () => {
      await startGame();
    });

    // タイトル画面を表示
    await app.changeScene(titleScene);

    // アプリケーション開始
    app.start();

    // ウィンドウを閉じる時にリソースを破棄
    window.addEventListener('beforeunload', () => {
      app.dispose();
    });
  } catch (error) {
    console.error('初期化エラー:', error);
    alert(`エラーが発生しました: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// 初期化実行
main();
