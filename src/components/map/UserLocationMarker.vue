<script setup lang="ts">
defineProps<{ src?: string | null; name: string; online?: boolean }>()
</script>
<template>
  <div class="avatar-marker" :class="{ online }">
    <img v-if="src" :src="src" :alt="name" />
    <span v-else>{{ name.slice(0, 2).toUpperCase() }}</span>
    <small>{{ name }}</small>
  </div>
</template>
