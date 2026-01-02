import * as THREE from 'three';
import { SCREEN } from '../utils/Constants';

/**
 * 2D描画用のOrthographicCameraを管理
 */
export class GameCamera {
  private camera: THREE.OrthographicCamera;

  constructor() {
    // 2D描画用の正投影カメラを作成
    // 座標系: 左上が(0,0)、右下が(WIDTH, HEIGHT)
    // OrthographicCamera(left, right, top, bottom, near, far)
    // カメラの中心を画面中心に配置するため、-WIDTH/2 ~ WIDTH/2, -HEIGHT/2 ~ HEIGHT/2 の範囲を設定
    const halfWidth = SCREEN.WIDTH / 2;
    const halfHeight = SCREEN.HEIGHT / 2;
    const near = 0.1;
    const far = 1000;

    this.camera = new THREE.OrthographicCamera(
      -halfWidth,  // left
      halfWidth,   // right
      halfHeight,  // top
      -halfHeight, // bottom
      near,
      far
    );

    // カメラの位置を設定（Z軸方向に離す）
    this.camera.position.z = 10;
    this.camera.lookAt(0, 0, 0);
  }

  /**
   * カメラを取得
   */
  getCamera(): THREE.OrthographicCamera {
    return this.camera;
  }

  /**
   * カメラの位置を更新（必要に応じて）
   */
  updatePosition(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z);
    this.camera.lookAt(0, 0, 0);
  }
}
