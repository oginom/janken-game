import './style.css';
import * as THREE from 'three';
import { assetLoader } from './assets/AssetLoader';
import { GameRenderer } from './graphics/Renderer';
import { GameCamera } from './graphics/Camera';
import { Background } from './graphics/Background';
import { HandSprite } from './graphics/HandSprite';
import { UIElements } from './graphics/UIElements';
import { PLAYER_HAND_POSITION, ENEMY_HAND_POSITION, GAME_CONFIG } from './utils/Constants';

console.log('じゃんけんボクサー - 起動中...');

/**
 * 簡易的な動作確認用のテストコード
 * フェーズ9で本格的なアプリケーションに置き換えます
 */
async function initTest() {
  console.log('テストモード: 初期化中...');

  // キャンバスとビデオ要素を取得
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const video = document.getElementById('camera-feed') as HTMLVideoElement;

  if (!canvas || !video) {
    console.error('必要な要素が見つかりません');
    return;
  }

  // アセットを読み込み
  console.log('アセット読み込み中...');
  await assetLoader.loadAll();
  console.log('アセット読み込み完了');

  // レンダラーとカメラを初期化
  const renderer = new GameRenderer(canvas);
  const camera = new GameCamera();
  renderer.initialResize();

  // シーンを作成
  const scene = new THREE.Scene();

  // 背景を追加
  const background = new Background(video);
  scene.add(background.getBackgroundPlane());
  scene.add(background.getOverlayPlane());

  // プレイヤーの手を追加（左右）
  const playerLeftHand = new HandSprite(
    'rock',
    PLAYER_HAND_POSITION.LEFT_X,
    PLAYER_HAND_POSITION.Y
  );
  const playerRightHand = new HandSprite(
    'scissors',
    PLAYER_HAND_POSITION.RIGHT_X,
    PLAYER_HAND_POSITION.Y
  );
  scene.add(playerLeftHand.getSprite());
  scene.add(playerRightHand.getSprite());

  // 敵の手を追加（予告表示）
  const enemyLeftHand = new HandSprite(
    'paper',
    ENEMY_HAND_POSITION.LEFT_X,
    ENEMY_HAND_POSITION.PREVIEW_Y
  );
  const enemyRightHand = new HandSprite(
    'rock',
    ENEMY_HAND_POSITION.RIGHT_X,
    ENEMY_HAND_POSITION.PREVIEW_Y
  );
  enemyLeftHand.addFrame();
  enemyRightHand.addFrame();
  scene.add(enemyLeftHand.getSprite());
  if (enemyLeftHand.getFrameSprite()) {
    scene.add(enemyLeftHand.getFrameSprite()!);
  }
  scene.add(enemyRightHand.getSprite());
  if (enemyRightHand.getFrameSprite()) {
    scene.add(enemyRightHand.getFrameSprite()!);
  }

  // UI要素を追加
  const uiElements = new UIElements(GAME_CONFIG.INITIAL_LIVES);
  uiElements.getLifeSprites().forEach((sprite) => {
    scene.add(sprite);
  });
  uiElements.updateScore(0);
  uiElements.updateLives(GAME_CONFIG.INITIAL_LIVES);

  console.log('初期化完了');

  // アニメーションループ
  let lastTime = performance.now();
  let testTimer = 0;
  let handIndex = 0;
  const handTypes: Array<'rock' | 'scissors' | 'paper'> = ['rock', 'scissors', 'paper'];

  function animate() {
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // 2秒ごとに手を切り替えてアニメーションテスト
    testTimer += deltaTime;
    if (testTimer > 2) {
      testTimer = 0;
      handIndex = (handIndex + 1) % handTypes.length;
      playerLeftHand.setHandType(handTypes[handIndex], true);
      playerRightHand.setHandType(handTypes[(handIndex + 1) % handTypes.length], true);
    }

    // スプライトのアニメーション更新
    playerLeftHand.update(deltaTime);
    playerRightHand.update(deltaTime);
    enemyLeftHand.update(deltaTime);
    enemyRightHand.update(deltaTime);

    // 背景更新
    background.update();

    // レンダリング
    renderer.render(scene, camera.getCamera());
  }

  console.log('レンダリング開始');
  animate();
}

// 初期化実行
initTest().catch((error) => {
  console.error('初期化エラー:', error);
});
