import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Couple, Profile } from '../types'
import { coupleService } from '../services/couple.service'
import { useAuthStore } from './auth'

export const useCoupleStore = defineStore('couple', () => {
  const myProfile = ref<Profile | null>(null)
  const couple = ref<Couple | null>(null)
  const profiles = ref<Profile[]>([])
  const loading = ref(false)
  const error = ref('')
  const partnerProfile = computed(() => profiles.value.find((profile) => profile.id !== myProfile.value?.id) ?? null)

  let inFlight: Promise<void> | null = null

  async function load() {
    if (inFlight) return inFlight
    inFlight = (async () => {
      loading.value = true
      error.value = ''
      try {
        const auth = useAuthStore()
        if (!auth.user?.id) throw new Error('Không có user đăng nhập')

        let profile = await coupleService.getMyProfile(auth.user.id)
        if (!profile) {
          profile = await coupleService.createProfile({
            id: auth.user.id,
            display_name: auth.user.email?.split('@')[0] || 'Bạn'
          })
        }
        myProfile.value = profile

        if (profile.couple_id) {
          const [coupleRow, coupleProfiles] = await Promise.all([
            coupleService.getCouple(profile.couple_id),
            coupleService.getProfiles(profile.couple_id)
          ])
          couple.value = coupleRow
          profiles.value = coupleProfiles
        } else {
          couple.value = null
          profiles.value = [profile]
          error.value = 'Tài khoản chưa được gán couple_id. Xem README mục 7-8 để gán trong Supabase.'
        }
      } catch (loadError) {
        error.value = loadError instanceof Error ? loadError.message : 'Không tải được hồ sơ'
      } finally {
        loading.value = false
      }
    })()
    try {
      await inFlight
    } finally {
      inFlight = null
    }
  }

  async function saveProfile(input: Partial<Profile> & { id: string }) {
    const updated = await coupleService.updateProfile(input)
    myProfile.value = updated
    const index = profiles.value.findIndex((item) => item.id === updated.id)
    if (index >= 0) profiles.value[index] = updated
  }

  return { myProfile, couple, profiles, partnerProfile, loading, error, load, saveProfile }
})
