<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Pencil, Trash2 } from '@lucide/vue'
import type { SpecialDate } from '../types'
import { useAuthStore } from '../stores/auth'
import { useCoupleStore } from '../stores/couple'
import { useSpecialDatesStore } from '../stores/specialDates'
import { useToast } from '../composables/useToast'
import { countdownLabel, todayIso, formatDate } from '../utils/date'
const auth = useAuthStore(); const couple = useCoupleStore(); const store = useSpecialDatesStore(); const toast = useToast(); const editingId = ref<string | null>(null)
const form = reactive({ title: '', event_date: todayIso(), repeat_yearly: true, note: '' })
function reset() { editingId.value = null; Object.assign(form, { title: '', event_date: todayIso(), repeat_yearly: true, note: '' }) }
function edit(item: SpecialDate) { editingId.value = item.id; Object.assign(form, { title: item.title, event_date: item.event_date, repeat_yearly: item.repeat_yearly, note: item.note || '' }) }
async function submit() { if (!couple.couple?.id || !auth.user) return; const input = { couple_id: couple.couple.id, created_by: auth.user.id, title: form.title, event_date: form.event_date, repeat_yearly: form.repeat_yearly, note: form.note || null }; if (editingId.value) await store.update(editingId.value, input); else await store.create(input); toast.push('Đã lưu một ngày thương', 'success'); reset() }
async function remove(id: string) { await store.remove(id); toast.push('Đã xóa ngày đặc biệt', 'success') }
onMounted(async () => { if (!couple.couple) await couple.load(); if (couple.couple?.id) await store.load(couple.couple.id) })
</script>
<template><section class="page-stack"><header class="page-header"><div><span>Ngày thương</span><h1>Những ngày mình không quên</h1></div></header><form class="editor-card" @submit.prevent="submit"><div class="form-row"><label>Tên ngày thương<input v-model="form.title" required /></label><label>Ngày<input v-model="form.event_date" type="date" required /></label></div><label>Lời nhắn nhỏ<textarea v-model="form.note" rows="3" /></label><label class="check"><input v-model="form.repeat_yearly" type="checkbox" /> Lặp lại hàng năm</label><div class="actions"><button class="primary-btn" type="submit">{{ editingId ? 'Cập nhật' : 'Thêm ngày thương' }}</button><button class="ghost-btn" type="button" @click="reset">Làm mới</button></div></form><p v-if="store.loading" class="soft-card">Đang tải...</p><article v-for="item in store.items" :key="item.id" class="soft-card special-item"><span>{{ formatDate(item.event_date) }}</span><strong>{{ item.title }}</strong><p>{{ countdownLabel(item.event_date, item.repeat_yearly) }}</p><small>{{ item.note }}</small><div class="actions"><button aria-label="Sửa ngày" @click="edit(item)"><Pencil :size="17" /></button><button aria-label="Xóa ngày" @click="remove(item.id)"><Trash2 :size="17" /></button></div></article></section></template>
