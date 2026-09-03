<script setup lang="ts">
import L, { type LatLngExpression, type Marker } from 'leaflet'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Memory } from '../../types'
import { formatDate } from '../../utils/date'

const props = defineProps<{ memories: Memory[] }>()
const mapElement = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
const markers = new Map<string, Marker>()

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] as string)
const pinnedMemories = () => props.memories.filter((item) => item.latitude != null && item.longitude != null)

const iconFor = () => L.divIcon({
  html: '<div class="memory-map-pin"><span><b>❤</b></span></div>',
  className: '',
  iconSize: [40, 48],
  iconAnchor: [20, 44],
  popupAnchor: [0, -38]
})

const popupHtml = (memory: Memory) => `
  <a class="memory-map-popup" href="/memories/${memory.id}">
    <strong>${escapeHtml(memory.title)}</strong>
    <span>${escapeHtml(formatDate(memory.memory_date))}</span>
    <p>${escapeHtml(memory.location_name || 'Ở đây mình từng thương nhau')}</p>
  </a>
`

const syncMarkers = () => {
  if (!map) return
  const activeIds = new Set(pinnedMemories().map((item) => item.id))
  markers.forEach((marker, id) => { if (!activeIds.has(id)) { marker.remove(); markers.delete(id) } })
  pinnedMemories().forEach((memory) => {
    const latlng: LatLngExpression = [memory.latitude!, memory.longitude!]
    const marker = markers.get(memory.id)
    if (marker) marker.setLatLng(latlng).setPopupContent(popupHtml(memory))
    else markers.set(memory.id, L.marker(latlng, { icon: iconFor() }).bindPopup(popupHtml(memory)).addTo(map!))
  })
}

const fitAll = () => {
  const items = pinnedMemories()
  if (!map || items.length === 0) return
  if (items.length === 1) {
    map.setView([items[0].latitude!, items[0].longitude!], 15, { animate: true })
    return
  }
  const bounds = L.latLngBounds(items.map((item) => [item.latitude!, item.longitude!] as LatLngExpression))
  map.fitBounds(bounds.pad(0.24), { maxZoom: 16, animate: true })
}

onMounted(() => {
  if (!mapElement.value) return
  map = L.map(mapElement.value, { zoomControl: false }).setView([10.7769, 106.7009], 12)
  L.control.zoom({ position: 'bottomright' }).addTo(map)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }).addTo(map)
  syncMarkers()
  fitAll()
})

watch(() => props.memories, () => { syncMarkers(); fitAll() }, { deep: true })
onBeforeUnmount(() => { map?.remove(); map = null })
defineExpose({ fitAll })
</script>

<template><div ref="mapElement" class="couple-map memory-map" /></template>
