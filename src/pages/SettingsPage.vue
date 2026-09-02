<script setup lang="ts">
import { BookOpen, Camera, ExternalLink, HeartPulse, Home, LogOut, Map, Moon, SunMedium, UserRound } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTheme } from '../composables/useTheme'
import { googlePhotosAlbumUrl } from '../services/supabase'
const auth = useAuthStore(); const router = useRouter(); const { mode, setTheme } = useTheme()
async function logout() { await auth.logout(); await router.replace('/login') }
const openAlbum = () => window.open(googlePhotosAlbumUrl, '_blank', 'noopener,noreferrer')

const guideItems = [
  { icon: Home, title: 'Tổ ấm hôm nay', text: 'Xem tổng quan: số ngày bên nhau, trạng thái/tâm trạng của hai đứa, khoảng cách hiện tại và kỷ niệm gần nhất.' },
  { icon: HeartPulse, title: 'Góc thương nhớ', text: 'Xem lịch sử kỷ niệm theo năm, lọc yêu thích và thêm dấu mốc mới cho hai người.' },
  { icon: BookOpen, title: 'Lời thương mỗi ngày', text: 'Viết vài dòng mỗi ngày kèm tâm trạng, thời tiết, xem lại theo danh sách.' },
  { icon: Map, title: 'Khoảng cách yêu thương', text: 'Xem vị trí realtime của cả hai và khoảng cách hiện tại - bật "Chia sẻ vị trí" ở trang này để bắt đầu.' },
  { icon: UserRound, title: 'Chuyện của chúng mình', text: 'Xem thời gian yêu nhau theo năm/tháng/tuần/ngày, cập nhật tên hiển thị, nickname, ảnh đại diện và sinh nhật của bạn.' },
  { icon: Camera, title: 'Album hai đứa', text: 'Ảnh và video kỷ niệm được lưu trong album Google Photos dùng chung, mở nhanh ở mục bên dưới.' }
]
</script>
<template>
  <section class="page-stack settings-page pane-page">
    <header class="page-header"><div><span>Góc riêng của mình</span><h1>Những điều nhỏ để giữ thương</h1></div></header>
    <div class="pane-scroll settings-scroll">
      <section class="soft-card"><strong>Cách mình giữ yêu thương</strong><ul class="guide-list"><li v-for="item in guideItems" :key="item.title"><component :is="item.icon" :size="18" /><div><strong>{{ item.title }}</strong><p>{{ item.text }}</p></div></li></ul></section>
      <section class="soft-card"><strong>Google Photos</strong><p>Ảnh kỷ niệm chính được quản lý trong shared album, app chỉ lưu link gắn với kỷ niệm/nhật ký.</p><button class="primary-btn" @click="openAlbum"><ExternalLink :size="18" /> Album của hai đứa mình</button><button class="ghost-btn" @click="openAlbum">Thêm ảnh thương nhớ</button></section>
      <section class="soft-card"><strong>Giao diện</strong><div class="segmented"><button :class="{ selected: mode === 'light' }" @click="setTheme('light')"><SunMedium :size="16" /> Sáng</button><button :class="{ selected: mode === 'dark' }" @click="setTheme('dark')"><Moon :size="16" /> Tối</button><button :class="{ selected: mode === 'system' }" @click="setTheme('system')">System</button></div></section>
      <section class="soft-card"><strong>Vị trí realtime</strong><p>Vị trí realtime hoạt động tốt nhất khi ứng dụng đang mở. PWA trên iOS/Android không đảm bảo GPS nên khi trình duyệt bị đóng hoặc app bị suspend.</p></section>
      <button class="danger-btn" @click="logout"><LogOut :size="18" /> Đăng xuất</button>
    </div>
  </section>
</template>
