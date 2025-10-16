import { Howl, Howler } from 'howler'
import music from '@/assets/game/bg_musics/bg_music_1.mp3'
import music2 from '@/assets/game/bg_musics/bg_music_2.mp3'

// Create separate Howl instances for each track
const track1 = new Howl({
  src: [music],
  volume: 0.25,
  autoplay: false,
  onend: function () {
    // When track1 ends, play track2
    console.log('Track 1 finished, starting Track 2')
    track2.play()
    currentTrack = track2
  }
})

const track2 = new Howl({
  src: [music2],
  volume: 0.25,
  autoplay: false,
  onend: function () {
    // When track2 ends, play track1 again
    console.log('Track 2 finished, starting Track 1')
    track1.play()
    currentTrack = track1
  }
})

// Keep track of which track is currently playing
let currentTrack = track1
// Stores the last paused position
let musicPosition = 0

// Play music from last position
export const playMusic = () => {
  if (!currentTrack.playing()) {
    currentTrack.play()
    if (musicPosition > 0) {
      currentTrack.seek(musicPosition)
    }
  }
}

// Pause music and save position
export const pauseMusic = () => {
  if (currentTrack.playing()) {
    musicPosition = currentTrack.seek() // Save current position
    currentTrack.pause()
  }
}

// Set volume for both tracks
export const setMusicVolume = (vol) => {
  track1.volume(vol)
  track2.volume(vol)
}
