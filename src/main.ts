import './style.css';
import { App } from './app';
import { TitleScene } from './scenes/TitleScene';

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
    titleScene.onStart(() => {
      console.log('ゲーム開始ボタンがクリックされました');
      // TODO: フェーズ13でReadySceneに遷移
      alert('次のフェーズで実装します: プレイ開始待機画面');
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
