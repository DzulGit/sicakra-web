<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { User, Phone, Mail, BadgeCheck, Package, MapPin, CalendarDays, Clock, ExternalLink, Image as ImageIcon } from 'lucide-vue-next'
import { usePermohonanLayananDetail } from '../composables/usePermohonanLayanan'
import { statusPermohonanEnum, jenisPermohonanEnum, tipePaketEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import RiwayatStatusTimeline from '../components/RiwayatStatusTimeline.vue'
import JadwalkanKerjaDialog from '../components/JadwalkanKerjaDialog.vue'
import WhatsappVerifikasiFlow from '../components/WhatsappVerifikasiFlow.vue'

const route = useRoute()
const id = computed(() => Number(route.params.id))

const { data: permohonan, isLoading } = usePermohonanLayananDetail(id)

const dialogJadwalkanTerbuka = ref(false)
const dialogWaTerbuka = ref(false)

const bisaVerifikasi = computed(
  () =>
    !!permohonan.value &&
    ['MENUNGGU_VERIFIKASI', 'PERLU_REVISI'].includes(permohonan.value.status),
)

const bisaVerifikasiWa = computed(
  () =>
    !!permohonan.value &&
    permohonan.value.status === 'MENUNGGU_VERIFIKASI',
)

const bisaJadwalkanKerja = computed(
  () =>
    !!permohonan.value && ['DITERIMA', 'DITUNDA'].includes(permohonan.value.status),
)

const labelTombolJadwalkan = computed(() =>
  permohonan.value?.status === 'DITUNDA' ? 'Jadwalkan Ulang' : 'Jadwalkan Kerja',
)

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'long' })
}

function bukaMaps(lat: string, lng: string) {
  window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')
}

const jadwalTerdekat = computed(() => {
  if (!permohonan.value?.jadwal_kerja?.length) return null
  return [...permohonan.value.jadwal_kerja].sort(
    (a, b) => new Date(a.tanggal_kerja).getTime() - new Date(b.tanggal_kerja).getTime(),
  )[0]
})

const STORAGE_BASE = 'https://hrwyxwwtbpmtrxhdlvud.supabase.co/storage/v1/object/public/wifi-storage/'

function urlFoto(path?: string | null): string | null {
  if (!path) return null
  return path.startsWith('http') ? path : `${STORAGE_BASE}${path}`
}

function bukaGambar(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div v-if="isLoading" class="space-y-4">
    <Skeleton class="h-8 w-64" />
    <Skeleton class="h-40 w-full" />
  </div>

  <div v-else-if="permohonan" class="grid gap-4 lg:grid-cols-3">
    <div class="space-y-4 lg:col-span-2">
      <Card>
        <CardHeader class="flex-row items-center justify-between">
          <div>
            <CardTitle class="flex items-center gap-2">
              <Package class="size-5 text-primary" />
              {{ permohonan.nomor_permohonan }}
            </CardTitle>
            <p class="text-sm text-muted-foreground">
              {{ permohonan.pelanggan?.nama_lengkap }} &middot; {{ permohonan.pelanggan?.nomor_hp }}
            </p>
          </div>
          <div class="flex flex-col items-end gap-1">
            <StatusBadge :value="permohonan.status" :map="statusPermohonanEnum" />
            <StatusBadge :value="permohonan.jenis_permohonan" :map="jenisPermohonanEnum" />
          </div>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="grid grid-cols-3 gap-x-6 gap-y-1.5 text-sm">
            <div>
              <p class="text-xs text-muted-foreground">Tipe Paket</p>
              <StatusBadge :value="permohonan.tipe_paket" :map="tipePaketEnum" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Tanggal Pengajuan</p>
              <p>{{ formatTanggal(permohonan.created_at) }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">No. Pelanggan</p>
              <p>{{ permohonan.pelanggan?.nomor_pelanggan ?? '-' }}</p>
            </div>
            <div v-if="jadwalTerdekat">
              <p class="text-xs text-muted-foreground">Jadwal Eksekusi</p>
              <p>{{ formatTanggal(jadwalTerdekat.tanggal_kerja) }}</p>
            </div>
            <div v-if="permohonan.updated_at !== permohonan.created_at">
              <p class="text-xs text-muted-foreground">Terakhir Diupdate</p>
              <p>{{ formatTanggal(permohonan.updated_at) }}</p>
            </div>
          </div>

          <div v-if="permohonan.paket_internet" class="text-sm">
            <p class="text-xs text-muted-foreground">Paket Internet</p>
            <p>{{ permohonan.paket_internet.nama_paket }} ({{ permohonan.paket_internet.kecepatan_mbps }} Mbps) — Rp{{ Number(permohonan.paket_internet.harga).toLocaleString('id-ID') }}/bln</p>
          </div>
          <div v-else-if="permohonan.tipe_paket === 'custom'" class="space-y-0.5 text-sm">
            <p class="text-xs text-muted-foreground">Paket Custom</p>
            <p>{{ permohonan.nama_paket_custom }} ({{ permohonan.kecepatan_custom_mbps }} Mbps)</p>
            <p v-if="permohonan.harga_custom">Rp{{ Number(permohonan.harga_custom).toLocaleString('id-ID') }}/bln</p>
            <p v-if="permohonan.catatan_custom" class="text-muted-foreground">{{ permohonan.catatan_custom }}</p>
          </div>

          <div v-if="permohonan.alasan_ditolak" class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <p class="font-medium">Alasan Ditolak</p>
            <p>{{ permohonan.alasan_ditolak }}</p>
          </div>
          <div v-if="permohonan.alasan_ditunda" class="rounded-md bg-warning/10 p-3 text-sm">
            <p class="font-medium">Kendala dari Kunjungan Sebelumnya</p>
            <p>{{ permohonan.alasan_ditunda }}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <User class="size-4 text-primary" /> Info Pelanggan
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            <div>
              <p class="text-xs text-muted-foreground">Nama Lengkap</p>
              <p>{{ permohonan.pelanggan?.nama_lengkap ?? '-' }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">NIK</p>
              <p>{{ permohonan.pelanggan?.nik ?? '-' }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">No. HP / WhatsApp</p>
              <p class="flex items-center gap-1.5">
                <Phone class="size-3.5 text-muted-foreground" />
                {{ permohonan.pelanggan?.nomor_hp ?? '-' }}
              </p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Email</p>
              <p class="flex items-center gap-1.5">
                <Mail class="size-3.5 text-muted-foreground" />
                {{ permohonan.pelanggan?.email ?? '-' }}
              </p>
            </div>
          </div>

          <div v-if="permohonan.pelanggan?.foto_ktp || permohonan.pelanggan?.foto_selfie_ktp" class="space-y-1.5">
            <p class="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ImageIcon class="size-3.5" /> Dokumen Identitas
            </p>
            <div class="flex flex-wrap gap-3">
              <button v-if="permohonan.pelanggan.foto_ktp" class="group text-left" @click="bukaGambar(urlFoto(permohonan.pelanggan.foto_ktp)!)">
                <img
                  :src="urlFoto(permohonan.pelanggan.foto_ktp) ?? ''"
                  alt="Foto KTP"
                  class="h-36 w-60 rounded-md border object-cover transition-opacity group-hover:opacity-80"
                />
                <p class="mt-1 text-xs text-muted-foreground underline-offset-2 group-hover:underline">Foto KTP</p>
              </button>
              <button v-if="permohonan.pelanggan.foto_selfie_ktp" class="group text-left" @click="bukaGambar(urlFoto(permohonan.pelanggan.foto_selfie_ktp)!)">
                <img
                  :src="urlFoto(permohonan.pelanggan.foto_selfie_ktp) ?? ''"
                  alt="Foto Selfie KTP"
                  class="h-36 w-60 rounded-md border object-cover transition-opacity group-hover:opacity-80"
                />
                <p class="mt-1 text-xs text-muted-foreground underline-offset-2 group-hover:underline">Selfie KTP</p>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <MapPin class="size-4 text-primary" /> Alamat Pemasangan
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-1 text-sm">
          <div class="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <p>{{ permohonan.alamat_pemasangan }}, RT {{ permohonan.rt }}/RW {{ permohonan.rw }}, {{ permohonan.kode_pos }}</p>
              <p v-if="permohonan.detail_alamat" class="text-muted-foreground">Detail: {{ permohonan.detail_alamat }}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" class="gap-1.5" @click="bukaMaps(permohonan.latitude, permohonan.longitude)">
            <MapPin class="size-4" /> Buka di Google Maps
            <ExternalLink class="size-3.5" />
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <Clock class="size-4 text-primary" /> Riwayat Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RiwayatStatusTimeline :riwayat="permohonan.riwayat_status ?? []" />
        </CardContent>
      </Card>
    </div>

    <div class="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <BadgeCheck class="size-4 text-primary" /> Aksi
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-2">
          <Button v-if="bisaVerifikasiWa" class="w-full" @click="dialogWaTerbuka = true">
            Verifikasi via WhatsApp
          </Button>
          <Button v-if="bisaJadwalkanKerja" class="w-full" variant="outline" @click="dialogJadwalkanTerbuka = true">
            <CalendarDays class="size-4" /> {{ labelTombolJadwalkan }}
          </Button>
          <p v-if="!bisaVerifikasi && !bisaVerifikasiWa && !bisaJadwalkanKerja" class="text-sm text-muted-foreground">
            Tidak ada aksi yang tersedia.
          </p>
        </CardContent>
      </Card>
    </div>

    <JadwalkanKerjaDialog v-model:open="dialogJadwalkanTerbuka" :permohonan-id="permohonan.id" />

    <Dialog :open="dialogWaTerbuka" @update:open="dialogWaTerbuka = $event">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Verifikasi via WhatsApp</DialogTitle>
          <DialogDescription>
            Hubungi pelanggan melalui WhatsApp untuk verifikasi data dan diskusi jadwal.
          </DialogDescription>
        </DialogHeader>
        <WhatsappVerifikasiFlow :permohonan="permohonan" @close="dialogWaTerbuka = false" />
      </DialogContent>
    </Dialog>
  </div>
</template>