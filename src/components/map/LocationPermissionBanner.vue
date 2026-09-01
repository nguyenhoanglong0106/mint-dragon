<script setup lang="ts">
defineProps<{ status: string; error?: string }>()
</script>
<template>
  <div v-if="status !== 'watching' && status !== 'idle'" class="permission-banner">
    <strong>Cần quyền vị trí</strong>
    <p v-if="status === 'denied'">Bạn đã từ chối GPS. Hãy bật lại quyền Location trong trình duyệt để chia sẻ vị trí.</p>
    <p v-else-if="status === 'unsupported'">Thiết bị hoặc trình duyệt này không hỗ trợ geolocation.</p>
    <p v-else>Không lấy được vị trí. {{ error }}</p>
  </div>
</template>
