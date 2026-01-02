import './style.css';
import { App } from './app';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';

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

    // タイトル画面を作成
    const titleScene = new TitleScene(video);
    titleScene.onStart(async () => {
      console.log('ゲーム開始ボタンがクリックされました');

      // ゲーム状態をリセット
      const gameState = app.getGameState();
      gameState.reset();
      gameState.setPhase('playing');

      // ゲームシーンを作成して切り替え
      const gameScene = new GameScene(video, gameState);
      await app.changeScene(gameScene);

      console.log('ゲームシーンに遷移しました');
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
