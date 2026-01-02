import * as THREE from 'three';
import { SCREEN, BACKGROUND } from '../utils/Constants';
import { assetLoader } from '../assets/AssetLoader';

/**
 * 背景の描画管理
 */
export class Background {
  private backgroundPlane: THREE.Mesh;
  private overlayPlane: THREE.Mesh;
  private videoTexture: THREE.VideoTexture | null = null;
  private video: HTMLVideoElement;

  constructor(video: HTMLVideoElement) {
    this.video = video;

    // 背景プレーンの作成
    const bgGeometry = new THREE.PlaneGeometry(SCREEN.WIDTH, SCREEN.HEIGHT);
    const bgMaterial = new THREE.MeshBasicMaterial({
      map: assetLoader.getBackgroundTexture(),
      transparent: false,
    });
    this.backgroundPlane = new THREE.Mesh(bgGeometry, bgMaterial);
    this.backgroundPlane.position.set(0, 0, -10); // 中心座標系なので(0,0)

    // オーバーレイプレーンの作成（白の半透明）
    const overlayGeometry = new THREE.PlaneGeometry(SCREEN.WIDTH, SCREEN.HEIGHT);
    const overlayMaterial = new THREE.MeshBasicMaterial({
      color: BACKGROUND.COLOR,
      transparent: true,
      opacity: BACKGROUND.OVERLAY_ALPHA,
    });
    this.overlayPlane = new THREE.Mesh(overlayGeometry, overlayMaterial);
    this.overlayPlane.position.set(0, 0, -9); // 中心座標系なので(0,0)
  }

  /**
   * カメラフィードを背景に設定
   */
  enableCameraBackground(): void {
    if (!this.video.srcObject) {
      console.warn('Camera video not initialized');
      return;
    }

    // VideoTextureを作成
    this.videoTexture = new THREE.VideoTexture(this.video);
    this.videoTexture.minFilter = THREE.LinearFilter;
    this.videoTexture.magFilter = THREE.LinearFilter;

    // 背景マテリアルを更新
    const bgMaterial = this.backgroundPlane.material as THREE.MeshBasicMaterial;
    bgMaterial.map = this.videoTexture;
    bgMaterial.needsUpdate = true;
  }

  /**
   * 静的背景画像に戻す
   */
  disableCameraBackground(): void {
    const bgMaterial = this.backgroundPlane.material as THREE.MeshBasicMaterial;
    bgMaterial.map = assetLoader.getBackgroundTexture() || null;
    bgMaterial.needsUpdate = true;

    if (this.videoTexture) {
      this.videoTexture.dispose();
      this.videoTexture = null;
    }
  }

  /**
   * 背景プレーンを取得
   */
  getBackgroundPlane(): THREE.Mesh {
    return this.backgroundPlane;
  }

  /**
   * オーバーレイプレーンを取得
   */
  getOverlayPlane(): THREE.Mesh {
    return this.overlayPlane;
  }

  /**
   * 更新処理（VideoTextureの更新など）
   */
  update(): void {
    // VideoTextureは自動的に更新されるため、特に処理は不要
  }

  /**
   * リソースを破棄
   */
  dispose(): void {
    this.backgroundPlane.geometry.dispose();
    (this.backgroundPlane.material as THREE.Material).dispose();

    this.overlayPlane.geometry.dispose();
    (this.overlayPlane.material as THREE.Material).dispose();

    if (this.videoTexture) {
      this.videoTexture.dispose();
    }
  }
}
