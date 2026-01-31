# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a real-time rock-paper-scissors (janken) boxing game using MediaPipe hand tracking and Three.js for 2D rendering. Players use their hands to make rock, paper, or scissors gestures to defeat falling opponent hands.

## Development Commands

```bash
# Start development server with hot reload
pnpm dev

# Build for production (runs TypeScript compiler + Vite build)
pnpm build

# Preview production build locally
pnpm preview
```

## Architecture

### Scene-Based Architecture

The application uses a scene management pattern where each game screen is a separate scene:

- [app.ts](src/app.ts) - Main application class managing scene lifecycle and rendering loop
- [scenes/Scene.ts](src/scenes/Scene.ts) - Base class defining scene interface (`init()`, `update()`, `render()`, `dispose()`)
- Scene implementations:
  - [TitleScene.ts](src/scenes/TitleScene.ts) - Title screen with camera toggle
  - [GameScene.ts](src/scenes/GameScene.ts) - Main gameplay
  - [GameOverScene.ts](src/scenes/GameOverScene.ts) - Game over screen with retry option

Scenes are responsible for their own resource management. When switching scenes via `app.changeScene()`, the previous scene's `dispose()` is called to clean up resources (Three.js objects, event listeners, etc.).

### Three.js 2D Rendering

Despite using Three.js (a 3D library), this game renders in 2D using:

- **OrthographicCamera** ([graphics/Camera.ts](src/graphics/Camera.ts)) - 2D projection without perspective
- **Sprite objects** - For all visual elements (hands, UI, etc.)
- **Coordinate system** - Based on [SCREEN constants](src/utils/Constants.ts#L8-L12) (375x667, mobile portrait orientation)

Key rendering components:
- [graphics/Renderer.ts](src/graphics/Renderer.ts) - WebGLRenderer initialization and rendering
- [graphics/HandSprite.ts](src/graphics/HandSprite.ts) - Hand sprite with bounce animation
- [graphics/UIElements.ts](src/graphics/UIElements.ts) - Lives/score display using TextSprite
- [graphics/Background.ts](src/graphics/Background.ts) - Camera feed or static background with white overlay

### MediaPipe Hand Tracking

[game/HandTracker.ts](src/game/HandTracker.ts) manages hand tracking:

- Initializes MediaPipe GestureRecognizer with 2 hands support
- Maps gestures to hand types (see [GESTURE_MAPPING](src/utils/Constants.ts#L121-L125)):
  - `Closed_Fist` → rock
  - `Victory` → scissors
  - `Open_Palm` → paper
- Distinguishes left/right hands using handedness detection
- Camera stream is preserved across scene transitions (started in TitleScene, reused in GameScene/GameOverScene)

### Game Logic Components

- [game/GameState.ts](src/game/GameState.ts) - Centralized state management with event emission
- [game/EnemyManager.ts](src/game/EnemyManager.ts) - Spawns and updates falling enemy hands
- [game/DifficultyManager.ts](src/game/DifficultyManager.ts) - Calculates difficulty based on defeated count (see [DIFFICULTY_TABLE](src/utils/Constants.ts#L26-L70))
- [game/CollisionDetector.ts](src/game/CollisionDetector.ts) - Collision detection and rock-paper-scissors logic

### Resource Management Patterns

**Singleton Pattern**: Used for shared resources
- [assets/AssetLoader.ts](src/assets/AssetLoader.ts) - `assetLoader` singleton
- [audio/SoundManager.ts](src/audio/SoundManager.ts) - `soundManager` singleton

**Disposal Pattern**: All scenes and graphics classes implement `dispose()` to:
- Remove Three.js objects from scene
- Dispose textures/geometries
- Remove event listeners
- Stop MediaPipe processing

**Important**: Always call `dispose()` on objects that use Three.js resources or event listeners to prevent memory leaks.

## Key Files and Their Roles

### Configuration
- [src/utils/Constants.ts](src/utils/Constants.ts) - All game constants (screen size, difficulty table, positions, colors)
- [src/utils/Settings.ts](src/utils/Settings.ts) - LocalStorage wrapper for camera/sound settings
- [src/types/index.ts](src/types/index.ts) - TypeScript type definitions

### Assets
- [assets/AssetLoader.ts](src/assets/AssetLoader.ts) - Loads textures from placeholders or real images
- [assets/placeholders/PlaceholderGenerator.ts](src/assets/placeholders/PlaceholderGenerator.ts) - Generates placeholder images using Canvas API

### Debug Mode

Keyboard controls are available for testing without camera:
- Set `VITE_DEBUG_KEYBOARD=true` in environment or add `?debug=keyboard` to URL
- Keys 1-3: Set left hand (rock/scissors/paper)
- Keys 4-6: Set right hand (rock/scissors/paper)

See [game/HandTracker.ts](src/game/HandTracker.ts) for implementation.

## Important Implementation Details

### Difficulty System

Difficulty increases every 5 defeated enemies ([GAME_CONFIG.DIFFICULTY_INTERVAL](src/utils/Constants.ts#L21)). This affects:
- Enemy fall speed (multiplier applied to base speed)
- Spawn interval (seconds between spawns)
- Hand patterns (single hand → both hands same → both hands random)

### Collision Detection

Collisions are checked in [GameScene.ts](src/scenes/GameScene.ts) when enemy Y position reaches player hand Y position. The rock-paper-scissors logic is in [CollisionDetector.ts](src/game/CollisionDetector.ts):
- Win: +10 score
- Draw: -1 life
- Lose: -3 lives

### Camera Stream Handling

Camera stream is initialized once in TitleScene and reused across scenes to avoid permission re-prompts. HandTracker has two modes:
- `showsCamera: true` - Display video feed
- `usesGesture: true` - Enable gesture recognition

Use `stop()` instead of `dispose()` when transitioning between scenes to preserve the camera stream.

## Documentation References

- [doc/specification.md](doc/specification.md) - Full game specification (in Japanese)
- [doc/implementation-plan.md](doc/implementation-plan.md) - Implementation phases and checklist (in Japanese)

## Common Patterns

When adding new visual elements:
1. Create sprites using Three.js Sprite with SpriteMaterial
2. Add to scene via `scene.add(sprite)`
3. Update position/scale in `update(deltaTime)`
4. Implement `dispose()` to call `sprite.geometry.dispose()` and `sprite.material.dispose()`

When adding new game features:
1. Add constants to [Constants.ts](src/utils/Constants.ts)
2. Add types to [types/index.ts](src/types/index.ts)
3. Emit events through GameState for UI updates
4. Test with keyboard debug mode before testing with hand tracking
