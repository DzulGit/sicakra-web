<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { LocateFixed } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

// Fix bawaan Leaflet + bundler (Vite/Webpack) — path ikon default marker
// rusak kalau di-bundle, harus di-override manual ke asset yang di-import.
// @ts-expect-error -- properti internal Leaflet, tidak ada di type definition resmi
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const props = defineProps<{
  modelValue: { lat: number; lng: number } | null
}>()
const emit = defineEmits<{ (e: 'update:modelValue', value: { lat: number; lng: number }): void }>()

const DEFAULT_CENTER: [number, number] = [-7.8031634, 110.3336448]
const DEFAULT_ZOOM = 13
const ZOOM_SETELAH_DETEKSI = 16

const elPeta = ref<HTMLDivElement | null>(null)
const sedangDeteksi = ref(false)
const errorGeolocation = ref<string | null>(null)

let peta: L.Map | null = null
let marker: L.Marker | null = null

function pindahkanMarker(lat: number, lng: number, opts?: { pan?: boolean; zoom?: number }) {
  if (!peta) return
  if (!marker) {
    marker = L.marker([lat, lng], { draggable: true }).addTo(peta)
    marker.on('dragend', () => {
      const pos = marker!.getLatLng()
      emit('update:modelValue', { lat: pos.lat, lng: pos.lng })
    })
  } else {
    marker.setLatLng([lat, lng])
  }
  if (opts?.pan) peta.setView([lat, lng], opts.zoom ?? peta.getZoom())
  emit('update:modelValue', { lat, lng })
}

function deteksiLokasi() {
  if (!navigator.geolocation) {
    errorGeolocation.value = 'Browser kamu tidak mendukung deteksi lokasi.'
    return
  }
  sedangDeteksi.value = true
  errorGeolocation.value = null

  navigator.geolocation.getCurrentPosition(
    (posisi) => {
      pindahkanMarker(posisi.coords.latitude, posisi.coords.longitude, {
        pan: true,
        zoom: ZOOM_SETELAH_DETEKSI,
      })
      sedangDeteksi.value = false
    },
    (err) => {
      errorGeolocation.value =
        err.code === err.PERMISSION_DENIED
          ? 'Izin lokasi ditolak. Kamu masih bisa geser marker manual di peta.'
          : 'Gagal mendeteksi lokasi. Coba lagi atau geser marker manual.'
      sedangDeteksi.value = false
    },
    { enableHighAccuracy: true, timeout: 10000 },
  )
}

onMounted(() => {
  if (!elPeta.value) return

  const pusatAwal: [number, number] = props.modelValue
    ? [props.modelValue.lat, props.modelValue.lng]
    : DEFAULT_CENTER

  peta = L.map(elPeta.value).setView(pusatAwal, DEFAULT_ZOOM)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(peta)

  // Klik di mana saja di peta juga memindahkan marker — bukan cuma drag.
  peta.on('click', (e: L.LeafletMouseEvent) => {
    pindahkanMarker(e.latlng.lat, e.latlng.lng)
  })

  if (props.modelValue) {
    pindahkanMarker(props.modelValue.lat, props.modelValue.lng)
  }
})

onBeforeUnmount(() => {
  peta?.remove()
  peta = null
  marker = null
})

// Sinkron kalau modelValue diubah dari LUAR komponen (jarang, tapi jaga-jaga)
watch(
  () => props.modelValue,
  (nilai) => {
    if (nilai && marker) marker.setLatLng([nilai.lat, nilai.lng])
  },
)
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <p class="text-sm font-medium">Titik Lokasi Pemasangan</p>
      <Button type="button" variant="outline" size="sm" :disabled="sedangDeteksi" @click="deteksiLokasi">
        <LocateFixed class="size-4" />
        {{ sedangDeteksi ? 'Mendeteksi...' : 'Deteksi Lokasi Saya' }}
      </Button>
    </div>

    <div ref="elPeta" class="h-72 w-full rounded-md border" />

    <p class="text-xs text-muted-foreground">
      Klik di peta atau geser marker untuk menyesuaikan titik lokasi persis rumah/tempat usaha kamu.
    </p>
    <p v-if="errorGeolocation" class="text-xs text-warning">{{ errorGeolocation }}</p>
    <p v-if="!modelValue" class="text-xs text-destructive">Pilih lokasi di peta dulu ya.</p>
  </div>
</template>