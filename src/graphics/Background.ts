import * as THREE from 'three';
import { SCREEN, BACKGROUND } from '../utils/Constants';

/**
 * 背景の描画管理
 */
export class Background {
  private backgroundPlane: THREE.Mesh;
  private overlayPlane: THREE.Mesh;
  private videoTexture: THREE.VideoTexture | null = null;
  private video: HTMLVideoElement;
  private showCamera: boolean;

  constructor(video: HTMLVideoElement, showCamera: boolean = true) {
    this.video = video;
    this.showCamera = showCamera;

    // 背景プレーンの作成
    const bgGeometry = new THREE.PlaneGeometry(SCREEN.WIDTH, SCREEN.HEIGHT);
    const bgMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff, // 初期は白
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
   * カメラフィードを背景に設定（初期化時に自動的に呼ばれる）
   */
  enableCameraBackground(): void {
    if (!this.showCamera) {
      // カメラ非表示の場合は白背景のまま
      return;
    }

    if (!this.video.srcObject) {
      console.warn('Camera video not initialized');
      return;
    }

    // VideoTextureを作成
    this.videoTexture = new THREE.VideoTexture(this.video);
    this.videoTexture.minFilter = THREE.LinearFilter;
    this.videoTexture.magFilter = THREE.LinearFilter;

    // カメラ映像の縦横比を計算
    const videoAspect = this.video.videoWidth / this.video.videoHeight;
    const screenAspect = SCREEN.WIDTH / SCREEN.HEIGHT;

    let planeWidth = SCREEN.WIDTH;
    let planeHeight = SCREEN.HEIGHT;

    // 縦横比を維持しながら画面に収める（fit方式 / contain方式）
    if (videoAspect > screenAspect) {
      // ビデオが横長の場合、幅を基準にする
      planeWidth = SCREEN.WIDTH;
      planeHeight = SCREEN.WIDTH / videoAspect;
    } else {
      // ビデオが縦長の場合、高さを基準にする
      planeHeight = SCREEN.HEIGHT;
      planeWidth = SCREEN.HEIGHT * videoAspect;
    }

    // 背景プレーンのジオメトリを更新
    this.backgroundPlane.geometry.dispose();
    this.backgroundPlane.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

    // 左右反転のために scale.x を -1 にする
    this.backgroundPlane.scale.x = -1;

    // 背景マテリアルを更新
    const bgMaterial = this.backgroundPlane.material as THREE.MeshBasicMaterial;
    bgMaterial.map = this.videoTexture;
    bgMaterial.color.setHex(0xffffff); // カラーをリセット
    bgMaterial.needsUpdate = true;
  }

  /**
   * 静的背景画像に戻す
   */
  disableCameraBackground(): void {
    // ジオメトリを元のサイズに戻す
    this.backgroundPlane.geometry.dispose();
    this.backgroundPlane.geometry = new THREE.PlaneGeometry(SCREEN.WIDTH, SCREEN.HEIGHT);

    // スケールをリセット
    this.backgroundPlane.scale.x = 1;

    const bgMaterial = this.backgroundPlane.material as THREE.MeshBasicMaterial;
    bgMaterial.map = null;
    bgMaterial.color.setHex(0xffffff); // 白背景
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
