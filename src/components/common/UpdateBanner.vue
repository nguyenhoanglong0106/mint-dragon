<script setup lang="ts">
import { RefreshCw } from '@lucide/vue'
import { useAppUpdate } from '../../composables/useAppUpdate'

const { needRefresh, updateNow } = useAppUpdate()
</script>
<template>
  <div v-if="needRefresh" class="update-banner">
    <span><RefreshCw :size="16" /> Có bản cập nhật mới</span>
    <button type="button" @click="updateNow">Cập nhật ngay</button>
  </div>
</template>
