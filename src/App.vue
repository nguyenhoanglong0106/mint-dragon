<script setup lang="ts">
import { useTheme } from './composables/useTheme'
import ToastStack from './components/common/ToastStack.vue'
import UpdateBanner from './components/common/UpdateBanner.vue'

useTheme()
</script>

<template>
  <UpdateBanner />
  <RouterView v-slot="{ Component }">
    <transition name="page-fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </RouterView>
  <ToastStack />
</template>
