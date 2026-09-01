<script setup lang="ts">
import { useToast } from '../../composables/useToast'
const { messages, dismiss } = useToast()
</script>
<template>
  <div class="toast-stack">
    <button v-for="message in messages" :key="message.id" :class="['toast', message.type]" type="button" @click="dismiss(message.id)">
      {{ message.text }}
    </button>
  </div>
</template>
