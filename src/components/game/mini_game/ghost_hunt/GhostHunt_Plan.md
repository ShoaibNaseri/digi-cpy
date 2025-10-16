# 🎮 GhostHunt Mini Game - Detailed Implementation Plan

Based on your existing codebase patterns and React Vite setup, here's a comprehensive plan for the GhostHunt mini game:

## 📁 **Project Structure**
```
src/components/game/mini_game/ghost_hunt/
├── GhostHunt.jsx                 # Main game component
├── GhostHunt.css                 # Main game styles
├── components/
│   ├── Ghost.jsx                 # Individual ghost component
│   ├── Ghost.css                 # Ghost-specific styles
│   ├── GameUI.jsx                # Score, timer, controls
│   ├── GameUI.css                # UI component styles
│   ├── TitleCard.jsx             # Game instructions/intro
│   ├── TitleCard.css             # Title card styles
│   └── GameCompleteModal.jsx     # End game modal
├── hooks/
│   ├── useGhostHunt.js           # Game logic hook
│   └── useAudioManager.js        # Audio management hook
└── utils/
    ├── ghostConfig.js            # Ghost types, speeds, behaviors
    └── gameConstants.js          # Game settings and constants
```

## 🎯 **Game Features & Mechanics**

### **Core Gameplay**
- **Objective**: Catch as many ghosts as possible within the time limit
- **Controls**: Click/tap on ghosts to catch them
- **Duration**: 60-90 seconds (configurable)
- **Difficulty**: Progressive - ghosts appear faster and move quicker over time

### **Ghost Behavior**
- **Spawn**: Random positions around screen edges
- **Movement**: Fly in random directions with varying speeds
- **Types**: 
  - 👻 **Friendly Ghosts** (easy to catch, 10 points)
  - 👹 **Tricky Ghosts** (faster, 20 points) 
  - 👻 **Rare Ghosts** (very fast, 50 points)
- **Lifespan**: 3-8 seconds before disappearing
- **Animation**: Floating, bobbing motion with transparency effects

### **Scoring System**
- **Points**: Based on ghost type and catch speed
- **Combo**: Consecutive catches increase multiplier (max 3x)
- **Bonus**: Time bonus for quick catches
- **Achievements**: Special rewards for milestones

## 🎨 **UI Design (Kids-Friendly)**

### **Visual Style**
- **Color Scheme**: Dark purple/blue night sky with bright, friendly colors
- **Background**: Animated starry night with floating clouds
- **Ghosts**: Cute, cartoon-style with glowing effects
- **UI Elements**: Rounded corners, bright colors, large touch targets

### **Screen Layout**
```
┌─────────────────────────────────────┐
│  [Score: 150]  [Time: 45s]  [Combo: 2x]  │
├─────────────────────────────────────┤
│                                     │
│           👻      👹                │
│                                     │
│     👻                    👻        │
│                                     │
│                👹                   │
│                                     │
├─────────────────────────────────────┤
│        [Pause]  [Settings]          │
└─────────────────────────────────────┘
```

### **Animations**
- **Ghost Spawn**: Fade in with sparkle effect
- **Ghost Catch**: Explosion with confetti particles
- **Score Update**: Bouncing number animation
- **Combo**: Glowing border effect
- **Background**: Gentle floating stars and clouds

## 🔊 **Audio Integration**

### **Sound Effects** (using existing audio patterns)
- **Ghost Spawn**: `magic.wav` or `sparkle.wav`
- **Ghost Catch**: `pop.wav` or `success.mp3`
- **Combo**: `confetti.wav`
- **Miss**: `fail.wav`
- **Background Music**: Custom spooky but friendly track

### **Audio Manager Integration**
```javascript
// Following your existing audioManager.js pattern
import { Howl } from 'howler'
import ghostSpawnSound from '@/assets/game/game_sounds/sparkle.wav'
import ghostCatchSound from '@/assets/game/game_sounds/pop.wav'
import comboSound from '@/assets/game/game_sounds/confetti.wav'
```

## 🎮 **Game States & Flow**

### **Game States**
1. **Loading**: Asset preloading with progress bar
2. **Instructions**: Title card with game rules
3. **Playing**: Active gameplay
4. **Paused**: Game paused with overlay
5. **Complete**: Results screen with replay option

### **Game Flow**
```
Start → Instructions → Countdown (3,2,1) → Play → Time Up → Results → Replay/Continue
```

## ⚙️ **Technical Implementation**

### **Core Components**

#### **1. GhostHunt.jsx** (Main Game Component)
```javascript
// State management
const [gameState, setGameState] = useState('loading')
const [score, setScore] = useState(0)
const [timeLeft, setTimeLeft] = useState(90)
const [ghosts, setGhosts] = useState([])
const [combo, setCombo] = useState(0)
```

#### **2. Ghost.jsx** (Individual Ghost)
```javascript
// Props: type, position, speed, direction, onCatch
// Features: click handling, movement animation, lifecycle
```

#### **3. useGhostHunt.js** (Game Logic Hook)
```javascript
// Custom hook managing:
// - Ghost spawning logic
// - Movement calculations
// - Collision detection
// - Score calculations
// - Game timer
```

### **Performance Optimizations**
- **Ghost Pooling**: Reuse ghost components instead of creating/destroying
- **RequestAnimationFrame**: Smooth 60fps animations
- **Debounced Events**: Prevent rapid-fire clicking
- **Memory Management**: Clean up timers and event listeners

## 🎯 **Game Rules & Difficulty**

### **Basic Rules**
- Click on ghosts to catch them
- Different ghost types give different points
- Maintain combo by catching ghosts quickly
- Game ends when time runs out

### **Difficulty Progression**
- **0-30s**: 1-2 ghosts every 2-3 seconds, slow speed
- **30-60s**: 2-3 ghosts every 1-2 seconds, medium speed  
- **60-90s**: 3-4 ghosts every 1 second, fast speed

### **Power-ups** (Optional)
- **Slow Time**: All ghosts move slower for 5 seconds
- **Magnet**: Ghosts are attracted to cursor for 3 seconds
- **Double Points**: 2x points for 10 seconds

## 🔧 **Configuration Options**

### **Game Settings**
```javascript
const GAME_CONFIG = {
  duration: 90,           // seconds
  maxGhosts: 8,           // max ghosts on screen
  spawnRate: 2000,        // milliseconds between spawns
  ghostLifespan: 5000,    // milliseconds
  comboTimeout: 2000,     // milliseconds to maintain combo
  difficulty: 'easy'      // easy, medium, hard
}
```

### **Ghost Types**
```javascript
const GHOST_TYPES = {
  friendly: { speed: 1, points: 10, color: '#4CAF50', size: 'medium' },
  tricky: { speed: 2, points: 20, color: '#FF9800', size: 'small' },
  rare: { speed: 3, points: 50, color: '#9C27B0', size: 'large' }
}
```

## 📱 **Responsive Design**
- **Mobile**: Touch-optimized with larger ghost targets
- **Tablet**: Medium-sized elements with good spacing
- **Desktop**: Precise mouse controls with hover effects

## 🎨 **Accessibility Features**
- **High Contrast**: Option for better visibility
- **Large Text**: Readable score and timer
- **Sound Controls**: Mute/unmute options
- **Keyboard Support**: Space bar to pause/resume

## 🚀 **Implementation Steps**

### **Phase 1: Core Setup**
1. Create folder structure
2. Set up basic GhostHunt component
3. Implement game state management
4. Create basic UI layout

### **Phase 2: Ghost System**
1. Create Ghost component
2. Implement ghost spawning logic
3. Add movement animations
4. Create ghost types configuration

### **Phase 3: Game Logic**
1. Implement click detection
2. Add scoring system
3. Create combo mechanics
4. Add timer functionality

### **Phase 4: Audio & Polish**
1. Integrate sound effects
2. Add background music
3. Implement animations
4. Add visual feedback

### **Phase 5: Testing & Optimization**
1. Performance testing
2. Mobile responsiveness
3. Accessibility testing
4. Bug fixes and refinements

## ❓ **Questions for Clarification**

Before implementation, please clarify:

1. **Game Duration**: How long should each round be? (Suggested: 90 seconds)

2. **Difficulty Levels**: Multiple difficulty settings or progressive difficulty?

3. **Ghost Types**: Do you like the 3 ghost types suggested, or different ones?

4. **Scoring**: Any specific scoring system preferences? Combo bonuses?

5. **Power-ups**: Special power-ups or keep it simple?

6. **Audio Files**: Specific ghost-themed sounds or use existing ones?

7. **Visual Style**: Color preferences or spooky-but-friendly theme?

---

**Created**: $(date)
**Status**: Planning Complete - Ready for Implementation
**Next Steps**: Awaiting clarification on game preferences before coding begins
