<script setup lang="ts">
import { MapPinned } from '@lucide/vue'
import { formatDistance } from '../../utils/distance'
defineProps<{ meters: number | null }>()
</script>
<template>
  <RouterLink to="/map" class="soft-card compact">
    <MapPinned :size="18" />
    <div>
      <span>Khoảng cách yêu thương</span>
      <strong v-if="meters != null">{{ formatDistance(meters) }}</strong>
      <p v-else class="empty-note">{{ formatDistance(meters) }}</p>
    </div>
  </RouterLink>
</template>
