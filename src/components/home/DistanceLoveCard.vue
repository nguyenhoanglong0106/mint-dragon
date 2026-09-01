<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Heart } from '@lucide/vue'

const props = withDefaults(defineProps<{
  distanceKm: number | null
  girlImage?: string
  boyImage?: string
}>(), {
  girlImage: '/images/couple/be_mint_chibi_running.jpg',
  boyImage: '/images/couple/rong_chibi_running.jpg'
})

// Ảnh chibi mặc định ở trên nằm tại public/images/couple/ - muốn đổi ảnh
// khác thì đè lên đúng 2 file đó, hoặc đổi 2 đường dẫn mặc định phía
// trên / truyền props girl-image, boy-image khác từ nơi gọi component.
// Ảnh định dạng nào cũng được (jpg/png/webp/svg), miễn đúng đường dẫn -
// không cần sửa gì khác trong component này. Nếu ảnh lỗi hoặc chưa tồn
// tại, component tự hiện emoji thay thế.
const girlLoadError = ref(false)
const boyLoadError = ref(false)
watch(() => props.girlImage, () => { girlLoadError.value = false })
watch(() => props.boyImage, () => { boyLoadError.value = false })

const distanceLabel = computed(() => {
  if (props.distanceKm == null) return 'Chưa có dữ liệu'
  if (props.distanceKm < 1) return '< 1 km'
  return `${props.distanceKm} km`
})
</script>

<template>
  <RouterLink to="/map" class="soft-card distance-love-card">
    <h2 class="connect-title"><strong>Khoảng cách</strong> giữa chúng mình</h2>

    <div class="distance-stage">
      <div class="chibi chibi-left">
        <img v-if="!boyLoadError" :src="boyImage" alt="" aria-hidden="true" @error="boyLoadError = true" />
        <span v-else class="chibi-placeholder" aria-hidden="true">👦</span>
      </div>

      <div class="distance-heart-wrap">
        <Heart class="distance-heart" :size="24" fill="currentColor" />
        <span class="distance-particle p1" aria-hidden="true">♡</span>
        <span class="distance-particle p2" aria-hidden="true">♡</span>
        <span class="distance-particle p3" aria-hidden="true">♡</span>
      </div>

      <div class="chibi chibi-right">
        <img v-if="!girlLoadError" :src="girlImage" alt="" aria-hidden="true" @error="girlLoadError = true" />
        <span v-else class="chibi-placeholder" aria-hidden="true">👧</span>
      </div>
    </div>

    <p class="connect-value">{{ distanceLabel }}</p>
    <p class="connect-caption-center">{{ distanceKm != null ? 'Dù xa nhưng trái tim luôn gần nhau 💚' : 'Bấm vào đây để bật chia sẻ vị trí nhé' }}</p>
  </RouterLink>
</template>
