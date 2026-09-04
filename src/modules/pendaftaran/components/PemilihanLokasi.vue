<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { LocateFixed, LoaderCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

// @ts-expect-error
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow })

const props = defineProps<{
  modelValue: { lat: number; lng: number; address?: string; provinsi?: string; kota?: string } | null
}>()
const emit = defineEmits<{   (e: 'update:modelValue', value: { lat: number; lng: number; address?: string; provinsi?: string; kota?: string }): void }>()

const DEFAULT_CENTER: [number, number] = [-7.8031634, 110.3336448]
const DEFAULT_ZOOM = 13
const ZOOM_SETELAH_DETEKSI = 16

const elPeta = ref<HTMLDivElement | null>(null)
const sedangDeteksi = ref(false)
const sedangReverse = ref(false)
const errorGeolocation = ref<string | null>(null)

let peta: L.Map | null = null
let marker: L.Marker | null = null

async function cariAlamat(lat: number, lng: number) {
  sedangReverse.value = true
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=id`,
      { headers: { 'User-Agent': 'SicakraApp/1.0' } },
    )
    const data = await res.json()
    const a = data.address || {}
    const jalan = [a.road, a.house_number].filter(Boolean).join(' No.')
    const rt = a.suburb?.match(/RT\.?\s*\d+/i)?.[0] || ''
    const rw = a.suburb?.match(/RW\.?\s*\d+/i)?.[0] || ''
    const desa = a.village || a.neighbourhood || a.suburb || ''
    const kec = a.county || a.city_district || a.municipality || ''
    const kota = a.city || a.town || a.county || ''
    const prov = a.state || ''
    const kodepos = a.postcode || ''
    const address = [jalan, [rt, rw].filter(Boolean).join('/'), desa, kec, kota, prov, kodepos, 'Indonesia']
      .filter(Boolean)
      .join(', ') || data.display_name || ''
    emit('update:modelValue', { lat, lng, address, provinsi: prov || undefined, kota: kota || undefined })
  } catch {
    emit('update:modelValue', { lat, lng })
  } finally {
    sedangReverse.value = false
  }
}

function pindahkanMarker(lat: number, lng: number, opts?: { pan?: boolean; zoom?: number }) {
  if (!peta) return
  if (!marker) {
    marker = L.marker([lat, lng], { draggable: true }).addTo(peta)
    marker.on('dragend', () => {
      const pos = marker!.getLatLng()
      cariAlamat(pos.lat, pos.lng)
    })
  } else {
    marker.setLatLng([lat, lng])
  }
  if (opts?.pan) peta.setView([lat, lng], opts.zoom ?? peta.getZoom())
  cariAlamat(lat, lng)
}

function deteksiLokasi() {
  if (!navigator.geolocation) { errorGeolocation.value = 'Browser kamu tidak mendukung deteksi lokasi.'; return }
  sedangDeteksi.value = true; errorGeolocation.value = null
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      pindahkanMarker(pos.coords.latitude, pos.coords.longitude, { pan: true, zoom: ZOOM_SETELAH_DETEKSI })
      sedangDeteksi.value = false
    },
    (err) => {
      errorGeolocation.value = err.code === err.PERMISSION_DENIED
        ? 'Izin lokasi ditolak. Geser marker manual.'
        : 'Gagal mendeteksi lokasi. Geser marker manual.'
      sedangDeteksi.value = false
    },
    { enableHighAccuracy: true, timeout: 10000 },
  )
}

onMounted(() => {
  if (!elPeta.value) return
  const pusat = props.modelValue ? [props.modelValue.lat, props.modelValue.lng] as [number, number] : DEFAULT_CENTER
  peta = L.map(elPeta.value).setView(pusat, DEFAULT_ZOOM)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap', maxZoom: 19 }).addTo(peta)
  peta.on('click', (e: L.LeafletMouseEvent) => pindahkanMarker(e.latlng.lat, e.latlng.lng))
  if (props.modelValue) pindahkanMarker(props.modelValue.lat, props.modelValue.lng)
})

onBeforeUnmount(() => { peta?.remove(); peta = null; marker = null })

watch(() => props.modelValue, (n) => { if (n && marker) marker.setLatLng([n.lat, n.lng]) })
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <p class="text-sm font-medium">Titik Lokasi Pemasangan</p>
      <div class="flex items-center gap-2">
        <span v-if="sedangReverse" class="flex items-center gap-1 text-xs text-blue-600"><LoaderCircle class="size-3 animate-spin" /> Cari alamat...</span>
        <Button type="button" variant="outline" size="sm" :disabled="sedangDeteksi" @click="deteksiLokasi">
          <LocateFixed class="size-4" />
          {{ sedangDeteksi ? 'Mendeteksi...' : 'Deteksi Lokasi' }}
        </Button>
      </div>
    </div>
    <div ref="elPeta" class="h-72 w-full rounded-md border" />
    <p class="text-xs text-muted-foreground">Klik peta atau geser marker untuk menentukan lokasi. Alamat akan terisi otomatis.</p>
    <p v-if="errorGeolocation" class="text-xs text-warning">{{ errorGeolocation }}</p>
    <p v-if="!modelValue" class="text-xs text-destructive">Pilih lokasi di peta dulu ya.</p>
  </div>
</template>