<script setup lang="ts">
import { computed, ref, type Component } from 'vue'
import { useRoute } from 'vue-router'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  ExternalLink,
  Gauge,
  IdCard,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Tag,
  User,
  Wallet,
  Wrench,
} from 'lucide-vue-next'
import { usePermohonanLayananDetail } from '../composables/usePermohonanLayanan'
import { jenisPermohonanEnum, statusPermohonanEnum, tipePaketEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import FotoKtpPreview from '@/components/data/FotoKtpPreview.vue'
import FieldRow from '../components/FieldRow.vue'
import RiwayatStatusTimeline from '../components/RiwayatStatusTimeline.vue'
import WhatsappVerifikasiFlow from '../components/WhatsappVerifikasiFlow.vue'
import JadwalkanKerjaDialog from '../components/JadwalkanKerjaDialog.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

const route = useRoute()
const id = computed(() => Number(route.params.id))

const { data: permohonan, isLoading } = usePermohonanLayananDetail(id)

const dialogWaTerbuka = ref(false)
const dialogJadwalkanTerbuka = ref(false)

/** URL object foto KTP yang sedang dilihat pada popup preview (menggunakan
 *  dialog in-app, bukan membuka tab/browser baru). */
const urlKtpPreview = ref<string | null>(null)

const pelanggan = computed(() => permohonan.value?.pelanggan)
const isCustom = computed(() => permohonan.value?.tipe_paket === 'custom')

/**
 * Aksi utama halaman — langsung tampil di header, 1 klik, tanpa dropdown.
 * Hanya memakai handler yang SUDAH ada:
 * - MENUNGGU_VERIFIKASI → alur verifikasi via WhatsApp existing.
 * - DITUNDA            → alur tindak lanjut kendala via WhatsApp existing.
 * - DITERIMA           → penjadwalan pemasangan (JadwalkanKerjaDialog existing).
 */
type AksiUtama = { label: string; tipe: 'wa' | 'jadwalkan'; ikon: Component }

const aksiUtama = computed<AksiUtama | null>(() => {
  const p = permohonan.value
  if (!p) return null
  switch (p.status) {
    case 'MENUNGGU_VERIFIKASI':
      return { label: 'Verifikasi via WhatsApp', tipe: 'wa', ikon: CheckCircle2 }
    case 'DITUNDA':
      return { label: 'Tindak Lanjut via WhatsApp', tipe: 'wa', ikon: MessageCircle }
    case 'DITERIMA':
      return { label: 'Jadwalkan Pemasangan', tipe: 'jadwalkan', ikon: Calendar }
    default:
      return null
  }
})

function jalankanAksiUtama() {
  const aksi = aksiUtama.value
  if (!aksi) return
  if (aksi.tipe === 'wa') dialogWaTerbuka.value = true
  else if (aksi.tipe === 'jadwalkan') dialogJadwalkanTerbuka.value = true
}

const jadwalTerdekat = computed(() => {
  if (!permohonan.value?.jadwal_kerja?.length) return null
  return [...permohonan.value.jadwal_kerja].sort(
    (a, b) => new Date(a.tanggal_kerja).getTime() - new Date(b.tanggal_kerja).getTime(),
  )[0]
})

// ----- Ringkasan pemasangan -----
const namaPaketTampil = computed(() => {
  const p = permohonan.value
  if (!p) return '-'
  if (isCustom.value) return p.nama_paket_custom ?? '-'
  return p.paket_internet?.nama_paket ?? '-'
})

const kecepatanTampil = computed(() => {
  const p = permohonan.value
  if (!p) return '-'
  const nilai = isCustom.value ? p.kecepatan_custom_mbps : p.paket_internet?.kecepatan_mbps
  return nilai != null ? `${nilai} Mbps` : '-'
})

const hargaTampil = computed(() => {
  const p = permohonan.value
  if (!p) return '-'
  const nilai = isCustom.value
    ? p.harga_custom != null
      ? Number(p.harga_custom)
      : null
    : p.paket_internet?.harga != null
      ? Number(p.paket_internet.harga)
      : null
  return nilai != null && nilai > 0 ? `Rp${nilai.toLocaleString('id-ID')}/bln` : '-'
})

const paketBaruTampil = computed(() => {
  const p = permohonan.value
  if (!p || p.jenis_permohonan !== 'ganti_paket' || !p.paket_internet_baru) return null
  return `${p.paket_internet_baru.nama_paket} (${p.paket_internet_baru.kecepatan_mbps} Mbps)`
})

// ----- Alamat -----
const alamatLengkap = computed(() => {
  const p = permohonan.value
  if (!p) return ''
  const bagian = [p.alamat_pemasangan]
  if (p.rt || p.rw) bagian.push(`RT ${p.rt}/RW ${p.rw}`)
  if (p.kode_pos) bagian.push(String(p.kode_pos))
  return bagian.join(', ')
})

const bisaBukaMaps = computed(() => {
  const p = permohonan.value
  return !!p && !!p.latitude && !!p.longitude
})

const ktpTersedia = computed(() => !!pelanggan.value?.id && !!pelanggan.value?.foto_ktp)

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'long' })
}

function formatTanggalWaktu(iso: string) {
  return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

function bukaMaps(lat: string, lng: string) {
  window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div v-if="isLoading" class="space-y-4">
    <Skeleton class="h-20 w-full" />
    <Skeleton class="h-40 w-full" />
  </div>

  <div v-else-if="permohonan" class="space-y-4">
    <!-- ===== HEADER ===== -->
    <header class="space-y-3">
      <Button variant="ghost" size="sm" class="-ml-2 gap-1.5 text-muted-foreground" as-child>
        <RouterLink :to="{ name: 'admin.operasional.permohonan-layanan.index' }">
          <ArrowLeft class="size-4" />
          Permohonan
        </RouterLink>
      </Button>

      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <h1 class="text-xl font-semibold tracking-tight">{{ permohonan.nomor_permohonan }}</h1>
          <p class="mt-0.5 text-sm text-muted-foreground">
            {{ pelanggan?.nama_lengkap ?? '-' }} · {{ pelanggan?.nomor_hp ?? '-' }}
          </p>
        </div>

        <div class="shrink-0">
          <Button v-if="aksiUtama" size="sm" class="gap-1.5" @click="jalankanAksiUtama">
            <component :is="aksiUtama.ikon" class="size-4" />
            {{ aksiUtama.label }}
          </Button>
          <p v-else class="pt-1 text-xs text-muted-foreground">Tidak ada aksi tersedia</p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
        <div class="flex items-center gap-1.5">
          <StatusBadge :value="permohonan.status" :map="statusPermohonanEnum" />
          <StatusBadge :value="permohonan.jenis_permohonan" :map="jenisPermohonanEnum" />
        </div>
        <span class="flex items-center gap-1.5 text-muted-foreground">
          <User class="size-3.5" />
          <span>No. Pelanggan</span>
          <span class="font-medium text-foreground">{{ pelanggan?.nomor_pelanggan ?? '-' }}</span>
        </span>
        <span v-if="jadwalTerdekat" class="flex items-center gap-1.5 text-muted-foreground">
          <Calendar class="size-3.5" />
          <span>Jadwal</span>
          <span class="font-medium text-foreground">{{ formatTanggal(jadwalTerdekat.tanggal_kerja) }}</span>
        </span>
        <span class="flex items-center gap-1.5 text-muted-foreground">
          <Clock class="size-3.5" />
          <span>Diajukan</span>
          <span class="font-medium text-foreground">{{ formatTanggalWaktu(permohonan.created_at) }}</span>
        </span>
      </div>
    </header>

    <!-- ===== NOTIFIKASI (alasan ditolak/ditunda) ===== -->
    <div
      v-if="permohonan.alasan_ditolak"
      class="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
    >
      <p class="font-medium">Alasan Ditolak</p>
      <p>{{ permohonan.alasan_ditolak }}</p>
    </div>
    <div
      v-if="permohonan.alasan_ditunda"
      class="rounded-md border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm"
    >
      <p class="font-medium">Kendala dari Kunjungan Sebelumnya</p>
      <p>{{ permohonan.alasan_ditunda }}</p>
    </div>

    <!-- ===== KONTEN: FIXED CARD GRID 2×2 (desktop), 1 kolom (mobile) ===== -->
    <!--
      DESKTOP — 4 card adalah child langsung grid 2×2 dengan BARIS EKSPLISIT:
        Row 1 (300px): Informasi Pelanggan | Ringkasan Pemasangan → tinggi SAMA.
        Row 2 (220px): Alamat Pemasangan    | Riwayat Status      → tinggi SAMA.
      Tinggi card = DESIGN (grid-template-rows), TIDAK pernah ditentukan
      content. Konten selalu menyesuaikan area card: teks panjang di-clamp/
      truncate, area KTP fixed, Riwayat/Ringkasan scroll internal saat
      kebanyakan.
      MOBILE — 1 kolom, tinggi auto (diizinkan per spek).
    -->
    <main
      class="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)] lg:grid-rows-[300px_220px]"
    >
      <!-- INFORMASI PELANGGAN (Row 1 kiri) -->
      <Card class="flex min-h-0 flex-col">
        <CardHeader class="shrink-0 gap-1 border-b p-4 pb-3">
          <CardTitle class="flex h-5 items-center gap-2 text-sm font-semibold">
            <User class="size-4 text-primary" />
            Informasi Pelanggan
          </CardTitle>
        </CardHeader>
        <CardContent class="grid min-h-0 flex-1 grid-cols-2 gap-x-4 overflow-hidden p-4 pt-3 text-sm">
          <!-- KIRI: field pelanggan — Nama, WhatsApp, NIK, Email -->
          <div class="flex min-w-0 flex-col justify-between gap-y-2">
            <FieldRow :icon="User" label="Nama">
              <p class="truncate font-medium">{{ pelanggan?.nama_lengkap ?? '-' }}</p>
            </FieldRow>
            <FieldRow :icon="Phone" label="WhatsApp">
              <p class="truncate">{{ pelanggan?.nomor_hp ?? '-' }}</p>
            </FieldRow>
            <FieldRow :icon="IdCard" label="NIK">
              <p class="truncate">{{ pelanggan?.nik ? String(pelanggan.nik) : '-' }}</p>
            </FieldRow>
            <FieldRow :icon="Mail" label="Email">
              <p class="truncate" :title="pelanggan?.email ?? undefined">{{ pelanggan?.email ?? '-' }}</p>
            </FieldRow>
          </div>

          <!-- KANAN: foto KTP — klik membuka popup preview diperbesar (in-app) -->
          <div class="flex min-h-0 min-w-0 flex-col items-center justify-center gap-1.5">
            <template v-if="ktpTersedia">
              <FotoKtpPreview
                :pelanggan-id="pelanggan?.id ?? 0"
                kategori="admin"
                popup
                image-class="h-[150px] w-[220px] max-w-full min-w-0 rounded-md object-contain"
                hide-caption
                @buka="urlKtpPreview = $event"
              />
              <p class="text-xs text-muted-foreground">Klik untuk memperbesar</p>
            </template>
            <p v-else class="text-xs text-muted-foreground">Foto KTP tidak tersedia.</p>
          </div>
        </CardContent>
      </Card>

      <!-- RINGKASAN PEMASANGAN (Row 1 kanan) -->
      <Card class="flex min-h-0 flex-col">
        <CardHeader class="shrink-0 gap-1 border-b p-4 pb-3">
          <CardTitle class="flex h-5 items-center gap-2 text-sm font-semibold">
            <Package class="size-4 text-primary" />
            Ringkasan Pemasangan
          </CardTitle>
        </CardHeader>
        <CardContent class="scrollarea-thin flex min-h-0 flex-1 flex-col gap-y-1 overflow-y-auto p-4 pt-3">
          <FieldRow :icon="Package" label="Paket">
            <p class="truncate font-semibold">{{ namaPaketTampil }}</p>
          </FieldRow>
          <FieldRow v-if="paketBaruTampil" :icon="Package" label="Paket Baru">
            <p class="truncate font-medium">{{ paketBaruTampil }}</p>
          </FieldRow>
          <FieldRow :icon="Gauge" label="Kecepatan">
            <p class="font-medium">{{ kecepatanTampil }}</p>
          </FieldRow>
          <FieldRow :icon="Wallet" label="Harga">
            <p class="truncate font-semibold">{{ hargaTampil }}</p>
          </FieldRow>
          <FieldRow :icon="Tag" label="Tipe Paket">
            <StatusBadge :value="permohonan.tipe_paket" :map="tipePaketEnum" />
          </FieldRow>
          <FieldRow :icon="Wrench" label="Jenis">
            <StatusBadge :value="permohonan.jenis_permohonan" :map="jenisPermohonanEnum" />
          </FieldRow>
          <FieldRow v-if="jadwalTerdekat" :icon="Calendar" label="Jadwal">
            <p class="font-medium">{{ formatTanggal(jadwalTerdekat.tanggal_kerja) }}</p>
          </FieldRow>
          <FieldRow v-if="isCustom && permohonan.catatan_custom" :icon="ClipboardList" label="Catatan Custom">
            <p class="line-clamp-1 text-muted-foreground" :title="permohonan.catatan_custom">
              {{ permohonan.catatan_custom }}
            </p>
          </FieldRow>
        </CardContent>
      </Card>

      <!-- ALAMAT PEMASANGAN (Row 2 kiri) -->
      <Card class="flex min-h-0 flex-col">
        <CardHeader class="shrink-0 gap-1 border-b p-4 pb-3">
          <CardTitle class="flex h-5 items-center gap-2 text-sm font-semibold">
            <MapPin class="size-4 text-primary" />
            Alamat Pemasangan
          </CardTitle>
        </CardHeader>
        <CardContent class="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-4 pt-3 text-sm">
          <p class="line-clamp-2" :title="alamatLengkap">{{ alamatLengkap }}</p>
          <p
            v-if="permohonan.detail_alamat"
            class="line-clamp-2 text-muted-foreground"
            :title="permohonan.detail_alamat"
          >
            Detail: {{ permohonan.detail_alamat }}
          </p>
          <Button
            v-if="bisaBukaMaps"
            variant="outline"
            size="sm"
            class="mt-auto w-fit gap-1.5"
            @click="bukaMaps(permohonan.latitude, permohonan.longitude)"
          >
            <MapPin class="size-4" />
            Buka di Google Maps
            <ExternalLink class="size-3.5" />
          </Button>
        </CardContent>
      </Card>

      <!-- RIWAYAT STATUS (Row 2 kanan) -->
      <Card class="flex min-h-0 flex-col">
        <CardHeader class="shrink-0 gap-1 border-b p-4 pb-3">
          <CardTitle class="flex h-5 items-center gap-2 text-sm font-semibold">
            <Clock class="size-4 text-primary" />
            Riwayat Status
          </CardTitle>
        </CardHeader>
        <CardContent class="flex min-h-0 flex-1 flex-col overflow-hidden p-4 pt-3">
          <div class="scrollarea-thin min-h-0 flex-1 overflow-y-auto pr-1">
            <RiwayatStatusTimeline :riwayat="permohonan.riwayat_status ?? []" />
          </div>
        </CardContent>
      </Card>
    </main>

    <!-- ===== DIALOG AKSI UTAMA: WHATSAPP ===== -->
    <Dialog :open="dialogWaTerbuka" @update:open="dialogWaTerbuka = $event">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {{ permohonan.status === 'DITUNDA'
              ? 'Tindak Lanjut Kendala via WhatsApp'
              : 'Verifikasi via WhatsApp'
            }}
          </DialogTitle>
          <DialogDescription>
            {{ permohonan.status === 'DITUNDA'
              ? 'Hubungi pelanggan mengenai kendala kunjungan sebelumnya dan tentukan tindak lanjut.'
              : 'Hubungi pelanggan melalui WhatsApp untuk verifikasi data dan diskusi jadwal.'
            }}
          </DialogDescription>
        </DialogHeader>

        <WhatsappVerifikasiFlow :permohonan="permohonan" @close="dialogWaTerbuka = false" />
      </DialogContent>
    </Dialog>

    <!-- ===== DIALOG AKSI UTAMA: JADWALKAN ===== -->
    <JadwalkanKerjaDialog
      :open="dialogJadwalkanTerbuka"
      :permohonan-id="permohonan.id"
      @update:open="dialogJadwalkanTerbuka = $event"
    />

    <!-- ===== POPUP PREVIEW FOTO KTP DI PERBESAR (in-app, bukan tab baru) ===== -->
    <Dialog :open="Boolean(urlKtpPreview)" @update:open="urlKtpPreview = $event ? urlKtpPreview : null">
      <DialogContent class="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Foto KTP Pelanggan</DialogTitle>
          <DialogDescription>Klik tombol tutup atau tekan Esc untuk menutup.</DialogDescription>
        </DialogHeader>
        <div
          v-if="urlKtpPreview"
          class="flex items-center justify-center overflow-hidden rounded-lg border bg-muted/40 p-2"
        >
          <img
            :src="urlKtpPreview"
            alt="Foto KTP pelanggan"
            class="max-h-[70vh] w-auto rounded object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>