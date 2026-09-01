<script setup lang="ts">
import type { LiveLocation, Profile } from '../../types'
import { timeAgoLabel } from '../../utils/date'
import { formatDistance } from '../../utils/distance'

defineProps<{ locations: LiveLocation[]; profiles: Profile[]; distanceMeters: number | null }>()
const nameOf = (userId: string, profiles: Profile[]) => profiles.find((profile) => profile.id === userId)?.nickname || profiles.find((profile) => profile.id === userId)?.display_name || 'Người ấy'
</script>
<template>
  <section class="location-card">
    <div v-for="location in locations" :key="location.user_id" class="location-row">
      <strong>{{ nameOf(location.user_id, profiles) }}</strong>
      <span>Cập nhật: {{ timeAgoLabel(location.updated_at) }}</span>
    </div>
    <div class="location-row distance"><strong>{{ formatDistance(distanceMeters) }}</strong></div>
  </section>
</template>
