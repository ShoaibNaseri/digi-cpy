# GamePreloader Component

A reusable preloader component for games that ensures all assets are loaded before the game starts.

## Features

- 🎮 Automatically detects file types (images, audio, other)
- 📊 Shows real-time loading progress with visual progress bar
- 💡 Displays dynamic tips based on loading progress
- 🛡️ Graceful error handling - continues loading even if some assets fail
- 📱 Mobile responsive design
- ✨ Modern animations and visual effects
- 🔄 Reusable across all games

## Supported File Types

- **Images**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp`, `.svg`
- **Audio**: `.mp3`, `.wav`, `.m4a`, `.ogg`
- **Other files**: Will attempt to fetch via HTTP

## Props

| Prop         | Type       | Required | Default  | Description                                       |
| ------------ | ---------- | -------- | -------- | ------------------------------------------------- |
| `assets`     | `string[]` | Yes      | -        | Array of asset URLs to preload                    |
| `onComplete` | `function` | Yes      | -        | Callback function called when loading is complete |
| `gameName`   | `string`   | No       | `"Game"` | Name of the game to display                       |

## Basic Usage

```jsx
import GamePreloader from '@/components/common/GamePreloader'
import { useState } from 'react'

const MyGame = () => {
  const [isPreloading, setIsPreloading] = useState(true)

  // Define all your game assets
  const gameAssets = [
    '/path/to/image1.png',
    '/path/to/image2.jpg',
    '/path/to/audio1.mp3',
    '/path/to/audio2.wav',
    '/path/to/background.webp'
  ]

  const handlePreloadComplete = () => {
    setIsPreloading(false)
  }

  if (isPreloading) {
    return (
      <GamePreloader
        assets={gameAssets}
        onComplete={handlePreloadComplete}
        gameName='My Awesome Game'
      />
    )
  }

  return <div>{/* Your game content here */}</div>
}
```

## Advanced Usage with Dynamic Assets

```jsx
import GamePreloader from '@/components/common/GamePreloader'
import { useState, useEffect } from 'react'

const MyGame = () => {
  const [isPreloading, setIsPreloading] = useState(true)
  const [gameAssets, setGameAssets] = useState([])

  useEffect(() => {
    // Dynamically build asset list based on game configuration
    const buildAssetList = () => {
      const assets = [
        // Core assets
        '/assets/ui/button.png',
        '/assets/audio/music.mp3',

        // Level-specific assets
        ...levelData.map((level) => level.backgroundImage),
        ...characters.map((char) => char.spriteImage),

        // Sound effects
        '/assets/sounds/click.wav',
        '/assets/sounds/victory.mp3'
      ]

      setGameAssets(assets)
    }

    buildAssetList()
  }, [])

  const handlePreloadComplete = () => {
    setIsPreloading(false)
  }

  if (isPreloading && gameAssets.length > 0) {
    return (
      <GamePreloader
        assets={gameAssets}
        onComplete={handlePreloadComplete}
        gameName='Dynamic Assets Game'
      />
    )
  }

  return <div>Game Content</div>
}
```

## Implementation Details

The GamePreloader component:

1. **Asset Detection**: Automatically detects file types based on extensions
2. **Progressive Loading**: Loads assets sequentially and updates progress
3. **Error Handling**: Continues loading even if individual assets fail
4. **Visual Feedback**: Shows progress bar, percentage, and dynamic tips
5. **Completion Animation**: Beautiful completion animation before starting the game

## Styling

The component comes with pre-built modern CSS styling featuring:

- Animated gradient backgrounds
- Glowing progress bars
- Responsive design
- Smooth transitions and animations
- Custom loading indicators

## Used In

- Chat Moderator Game
- Other mini-games (can be easily integrated)
