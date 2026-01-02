import * as THREE from 'three';

/**
 * シーンの基底クラス
 * すべてのゲームシーン（タイトル、ゲーム、ゲームオーバーなど）はこのクラスを継承する
 */
export abstract class Scene {
  protected scene: THREE.Scene;

  constructor() {
    this.scene = new THREE.Scene();
  }

  /**
   * シーンの初期化（アセット読み込み後に呼ばれる）
   */
  abstract init(): Promise<void>;

  /**
   * シーンの更新処理
   * @param deltaTime 前フレームからの経過時間（秒）
   */
  abstract update(deltaTime: number): void;

  /**
   * シーンの終了処理（シーン切り替え時に呼ばれる）
   */
  abstract dispose(): void;

  /**
   * Three.jsのシーンを取得
   */
  getScene(): THREE.Scene {
    return this.scene;
  }
}
