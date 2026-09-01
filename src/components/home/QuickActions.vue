<script setup lang="ts">
import { BookOpen, Camera, HeartPulse, Map } from '@lucide/vue'
import { googlePhotosAlbumUrl } from '../../services/supabase'

const openAlbum = () => window.open(googlePhotosAlbumUrl, '_blank', 'noopener,noreferrer')
</script>
<template>
  <section class="quick-grid">
    <RouterLink to="/diary" class="quick-action"><BookOpen :size="20" /> Gửi vài dòng thương</RouterLink>
    <RouterLink to="/memories?add=1" class="quick-action"><HeartPulse :size="20" /> Ghi kỷ niệm mới</RouterLink>
    <RouterLink to="/map" class="quick-action"><Map :size="20" /> Khoảng cách của mình</RouterLink>
    <button class="quick-action" type="button" @click="openAlbum"><Camera :size="20" /> Album hai đứa</button>
  </section>
</template>
