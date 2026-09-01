<script setup lang="ts">
import { useTheme } from './composables/useTheme'
import ToastStack from './components/common/ToastStack.vue'

useTheme()
</script>

<template>
  <RouterView v-slot="{ Component }">
    <transition name="page-fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </RouterView>
  <ToastStack />
</template>
