import { ref } from 'vue'

// Player YouTube ẩn dùng chung cho cả app (module-level state) - để bấm
// nhạc ở người này thì tự dừng nhạc đang phát của người kia, thay vì mỗi
// nơi gọi tạo 1 player riêng chồng chéo tiếng lên nhau.
//
// Không cài @types/youtube chỉ vì vài API dùng ở đây nên khai báo tối
// thiểu bằng `any` cho global YT.
interface YoutubePlayer {
  playVideo(): void
  pauseVideo(): void
  stopVideo(): void
  loadVideoById(videoId: string): void
}

declare global {
  interface Window {
    YT: {
      Player: new (el: HTMLElement, options: Record<string, unknown>) => YoutubePlayer
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiReady: Promise<void> | null = null
function loadYoutubeApi(): Promise<void> {
  if (apiReady) return apiReady
  apiReady = new Promise((resolve) => {
    if (window.YT?.Player) { resolve(); return }
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => { previous?.(); resolve() }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
  })
  return apiReady
}

let player: YoutubePlayer | null = null
let playerReady: Promise<YoutubePlayer> | null = null
const currentVideoId = ref<string | null>(null)
const isPlaying = ref(false)

async function ensurePlayer(): Promise<YoutubePlayer> {
  if (playerReady) return playerReady
  playerReady = loadYoutubeApi().then(() => new Promise<YoutubePlayer>((resolve) => {
    const host = document.createElement('div')
    host.id = 'yt-audio-player-host'
    host.style.cssText = 'position:fixed;width:1px;height:1px;bottom:0;right:0;opacity:0;pointer-events:none;'
    document.body.appendChild(host)
    player = new window.YT.Player(host, {
      height: '1',
      width: '1',
      playerVars: { playsinline: 1 },
      events: {
        onReady: () => resolve(player!),
        onStateChange: (event: { data: number }) => {
          isPlaying.value = event.data === window.YT.PlayerState.PLAYING
          if (event.data === window.YT.PlayerState.ENDED) currentVideoId.value = null
        }
      }
    })
  }))
  return playerReady
}

export function useYoutubePlayer() {
  // Bấm lại đúng bài đang phát -> dừng hẳn (không phải tạm dừng rồi bấm
  // tiếp lại resume) - lần bấm kế tiếp sẽ phát lại từ đầu, đúng như 1 nút
  // bật/tắt nhạc chứ không phải nút play/pause.
  async function toggle(videoId: string) {
    const instance = await ensurePlayer()
    if (currentVideoId.value === videoId) {
      instance.pauseVideo()
      currentVideoId.value = null
      isPlaying.value = false
      return
    }
    currentVideoId.value = videoId
    instance.loadVideoById(videoId)
  }

  function stop() {
    player?.stopVideo()
    currentVideoId.value = null
  }

  return { toggle, stop, isPlaying, currentVideoId }
}
