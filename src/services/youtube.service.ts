import { youtubeApiKey } from './supabase'

export interface YoutubeSearchResult {
  videoId: string
  title: string
  channelTitle: string
  thumbnailUrl: string
}

export const youtubeService = {
  async search(query: string): Promise<YoutubeSearchResult[]> {
    if (!youtubeApiKey) throw new Error('Chưa cấu hình VITE_YOUTUBE_API_KEY nên chưa tìm được nhạc')
    const url = new URL('https://www.googleapis.com/youtube/v3/search')
    url.searchParams.set('part', 'snippet')
    url.searchParams.set('type', 'video')
    url.searchParams.set('videoCategoryId', '10')
    url.searchParams.set('maxResults', '8')
    url.searchParams.set('q', query)
    url.searchParams.set('key', youtubeApiKey)
    const res = await fetch(url.toString())
    if (!res.ok) throw new Error('Không tìm được bài hát, thử lại nhé')
    const data = await res.json()
    return (data.items ?? []).map((item: { id: { videoId: string }; snippet: { title: string; channelTitle: string; thumbnails?: { default?: { url: string } } } }) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails?.default?.url ?? ''
    }))
  }
}
