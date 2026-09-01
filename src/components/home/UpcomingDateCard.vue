<script setup lang="ts">
import { CalendarDays } from '@lucide/vue'
defineProps<{ title: string; countdown: string }>()
</script>
<template>
  <RouterLink to="/special-dates" class="soft-card compact"><CalendarDays :size="18" /><div><span>Ngày thương sắp tới</span><strong>{{ title }}</strong><p>{{ countdown }}</p></div></RouterLink>
</template>
