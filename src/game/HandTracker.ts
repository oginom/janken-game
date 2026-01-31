import { GestureRecognizer, FilesetResolver } from '@mediapipe/tasks-vision';
import type { HandType } from '../types';
import { CAMERA_CONFIG, GESTURE_MAPPING } from '../utils/Constants';

/**
 * MediaPipe Hands統合クラス
 * カメラからの手のジェスチャー認識を行う
 */
export class HandTracker {
  private gestureRecognizer: GestureRecognizer | null = null;
  private video: HTMLVideoElement;
  private isRunning: boolean = false;
  private lastVideoTime: number = -1;

  // 認識された手の状態
  private leftHandType: HandType | null = null;
  private rightHandType: HandType | null = null;

  constructor(video: HTMLVideoElement) {
    this.video = video;
  }

  /**
   * MediaPipe Hands初期化
   */
  async init(): Promise<void> {
    try {
      console.log('MediaPipe Hands 初期化中...');

      // MediaPipe Vision タスクの初期化
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
      );

      // GestureRecognizer作成
      this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2, // 両手を認識
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      console.log('MediaPipe Hands 初期化完了');
    } catch (error) {
      console.error('MediaPipe Hands 初期化エラー:', error);
      throw error;
    }
  }

  /**
   * カメラを開始
   */
  async startCamera(): Promise<void> {
    try {
      console.log('カメラ起動中...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: CAMERA_CONFIG.WIDTH,
          height: CAMERA_CONFIG.HEIGHT,
          frameRate: CAMERA_CONFIG.FPS,
          facingMode: 'user',
        },
      });

      this.video.srcObject = stream;
      this.video.addEventListener('loadeddata', () => {
        console.log('カメラ起動完了');
      });

      await this.video.play();
    } catch (error) {
      console.error('カメラ起動エラー:', error);
      throw error;
    }
  }

  /**
   * ジェスチャー認識を開始
   */
  start(): void {
    this.isRunning = true;
    this.processFrame();
  }

  /**
   * ジェスチャー認識を停止
   */
  stop(): void {
    this.isRunning = false;
  }

  /**
   * フレーム処理（再帰的に呼ばれる）
   */
  private processFrame = (): void => {
    if (!this.isRunning || !this.gestureRecognizer) {
      return;
    }

    const nowInMs = Date.now();

    // ビデオが新しいフレームを持っている場合のみ処理
    if (this.video.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = this.video.currentTime;

      // ジェスチャー認識実行
      const results = this.gestureRecognizer.recognizeForVideo(this.video, nowInMs);

      // 結果をリセット
      this.leftHandType = null;
      this.rightHandType = null;

      // 認識された手をチェック
      if (results.gestures && results.gestures.length > 0) {
        for (let i = 0; i < results.gestures.length; i++) {
          const gestures = results.gestures[i];
          const handedness = results.handednesses[i];

          if (gestures.length > 0 && handedness.length > 0) {
            const gestureName = gestures[0].categoryName;
            const handLabel = handedness[0].categoryName; // "Left" or "Right"

            // ジェスチャーをHandTypeにマッピング
            const handType = this.mapGestureToHandType(gestureName);

            if (handType) {
              // MediaPipeの"Left"は実際のカメラでは右手（鏡像）
              if (handLabel === 'Left') {
                this.rightHandType = handType; // 鏡像なので右手
              } else if (handLabel === 'Right') {
                this.leftHandType = handType; // 鏡像なので左手
              }
            }
          }
        }
      }
    }

    // 次のフレームを処理
    requestAnimationFrame(this.processFrame);
  };

  /**
   * MediaPipeジェスチャー名をHandTypeにマッピング
   */
  private mapGestureToHandType(gestureName: string): HandType | null {
    const mapping = GESTURE_MAPPING as Record<string, string>;
    return (mapping[gestureName] as HandType) || null;
  }

  /**
   * 左手の現在の手を取得
   */
  getLeftHandType(): HandType | null {
    return this.leftHandType;
  }

  /**
   * 右手の現在の手を取得
   */
  getRightHandType(): HandType | null {
    return this.rightHandType;
  }

  /**
   * リソースを破棄
   */
  dispose(): void {
    this.stop();

    // カメラストリームを停止
    const stream = this.video.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    // GestureRecognizerを破棄
    if (this.gestureRecognizer) {
      this.gestureRecognizer.close();
      this.gestureRecognizer = null;
    }
  }
}
