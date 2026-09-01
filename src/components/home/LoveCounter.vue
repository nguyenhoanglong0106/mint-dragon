<script setup lang="ts">
import { Heart } from '@lucide/vue'
defineProps<{ days: number; names?: string }>()
</script>
<template>
  <section class="love-counter">
    <Heart :size="24" />
    <p>Chúng mình đã bên nhau</p>
    <strong>{{ days }} ngày</strong>
    <span v-if="names">{{ names }}</span>
  </section>
</template>
