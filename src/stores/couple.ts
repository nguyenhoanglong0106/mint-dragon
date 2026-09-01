import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Couple, Profile } from '../types'
import { coupleService } from '../services/couple.service'

export const useCoupleStore = defineStore('couple', () => {
  const myProfile = ref<Profile | null>(null)
  const couple = ref<Couple | null>(null)
  const profiles = ref<Profile[]>([])
  const loading = ref(false)
  const error = ref('')
  const partnerProfile = computed(() => profiles.value.find((profile) => profile.id !== myProfile.value?.id) ?? null)

  async function load() {
    loading.value = true; error.value = ''
    try {
      myProfile.value = await coupleService.getMyProfile()
      if (myProfile.value?.couple_id) {
        couple.value = await coupleService.getCouple(myProfile.value.couple_id)
        profiles.value = await coupleService.getProfiles(myProfile.value.couple_id)
      }
    } catch {
      error.value = 'Không tải được hồ sơ. Kiểm tra kết nối hoặc cấu hình Supabase.'
    } finally { loading.value = false }
  }

  async function saveProfile(input: Partial<Profile> & { id: string }) {
    const updated = await coupleService.updateProfile(input)
    myProfile.value = updated
    const index = profiles.value.findIndex((item) => item.id === updated.id)
    if (index >= 0) profiles.value[index] = updated
  }

  return { myProfile, couple, profiles, partnerProfile, loading, error, load, saveProfile }
})
