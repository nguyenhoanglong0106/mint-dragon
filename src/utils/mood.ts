import { Cloud, Frown, Heart, Smile, Sparkles } from '@lucide/vue'
import type { Mood } from '../types'

export const moodOptions = [
  { value: 'love' as Mood, label: 'Yêu', line: 'Muốn được dỗ dành và ôm thật lâu', icon: Heart },
  { value: 'happy' as Mood, label: 'Vui xinh', line: 'Hôm nay lòng mình nhẹ và sáng', icon: Smile },
  { value: 'excited' as Mood, label: 'Háo hức', line: 'Có chuyện làm tim mình nhảy nhót', icon: Sparkles },
  { value: 'normal' as Mood, label: 'Bình yên', line: 'Một ngày dịu, không ồn ào', icon: Cloud },
  { value: 'sad' as Mood, label: 'Cần được thương', line: 'Hôm nay mình hơi chùng xuống', icon: Frown },
  { value: 'calm' as Mood, label: 'Yên bình', line: 'Mình chỉ muốn ở cạnh người ấy thật lâu', icon: Cloud }
]

export function moodMeta(value?: Mood | null) {
  return moodOptions.find((mood) => mood.value === value) ?? moodOptions[0]
}
