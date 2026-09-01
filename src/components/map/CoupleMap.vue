<script setup lang="ts">
import L, { type LatLngExpression, type Marker } from 'leaflet'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { LiveLocation, Profile } from '../../types'
import { timeAgoLabel } from '../../utils/date'

const props = defineProps<{ locations: LiveLocation[]; profiles: Profile[] }>()
const emit = defineEmits<{ ready: [] }>()
const mapElement = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
const markers = new Map<string, Marker>()

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] as string)
const profileFor = (id: string) => props.profiles.find((profile) => profile.id === id)
const markerHtml = (location: LiveLocation) => {
  const profile = profileFor(location.user_id)
  const name = escapeHtml(profile?.nickname || profile?.display_name || 'Người ấy')
  const isOnline = Date.now() - new Date(location.updated_at).getTime() < 60_000
  const image = profile?.avatar_url ? `<img src="${escapeHtml(profile.avatar_url)}" alt="${name}" />` : `<span>${name.slice(0, 2).toUpperCase()}</span>`
  return `<div class="leaflet-love-marker${isOnline ? ' online' : ''}"><span class="marker-avatar">${image}</span><small>${name}</small><em>${timeAgoLabel(location.updated_at)}</em></div>`
}
const iconFor = (location: LiveLocation) => L.divIcon({ html: markerHtml(location), className: '', iconSize: [68, 92], iconAnchor: [34, 32] })

const syncMarkers = () => {
  if (!map) return
  const activeIds = new Set(props.locations.map((item) => item.user_id))
  markers.forEach((marker, id) => { if (!activeIds.has(id)) { marker.remove(); markers.delete(id) } })
  props.locations.forEach((location) => {
    const latlng: LatLngExpression = [location.latitude, location.longitude]
    const marker = markers.get(location.user_id)
    if (marker) marker.setLatLng(latlng).setIcon(iconFor(location))
    else markers.set(location.user_id, L.marker(latlng, { icon: iconFor(location) }).addTo(map!))
  })
}

const fitBoth = () => {
  if (!map || props.locations.length === 0) return
  const bounds = L.latLngBounds(props.locations.map((item) => [item.latitude, item.longitude] as LatLngExpression))
  map.fitBounds(bounds.pad(0.24), { maxZoom: 16, animate: true })
}

onMounted(() => {
  if (!mapElement.value) return
  map = L.map(mapElement.value, { zoomControl: false }).setView([10.7769, 106.7009], 12)
  L.control.zoom({ position: 'bottomright' }).addTo(map)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }).addTo(map)
  syncMarkers(); fitBoth(); emit('ready')
})
watch(() => props.locations, () => { syncMarkers(); fitBoth() }, { deep: true })
onBeforeUnmount(() => { map?.remove(); map = null })
defineExpose({ fitBoth })
</script>
<template><div ref="mapElement" class="couple-map" /></template>
