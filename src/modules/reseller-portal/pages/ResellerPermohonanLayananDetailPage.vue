<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import {
  User, Phone, Mail, Package, MapPin, Clock, ExternalLink, Image as ImageIcon, BadgeCheck, ArrowLeft,
} from 'lucide-vue-next'
import {
  useResellerPermohonanLayananDetail,
  useVerifikasiResellerPermohonan,
  useJadwalkanResellerKerja,
} from '../composables/useResellerPermohonanLayanan'
import { verifikasiResellerSchema, jadwalkanResellerSchema } from '@/schemas/reseller-portal.schema'
import { statusPermohonanEnum, jenisPermohonanEnum, tipePaketEnum } from '@/lib/enums'
import { mapValidationErrors } from '@/lib/errors'
import StatusBadge from '@/components/data/StatusBadge.vue'
import RiwayatStatusTimeline from '@/modules/permohonan-layanan/components/RiwayatStatusTimeline.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'

const route = useRoute()
const router = useRouter()
const id = computed(() => Number(route.params.id))
const { data: permohonan, isLoading } = useResellerPermohonanLayananDetail(id)

const jadwalTerdekat = computed(() => {
  if (!permohonan.value?.jadwal_kerja?.length) return null
  return [...permohonan.value.jadwal_kerja].sort(
    (a, b) => new Date(a.tanggal_kerja).getTime() - new Date(b.tanggal_kerja).getTime(),
  )[0]
})

const isCustom = computed(() => permohonan.value?.tipe_paket === 'custom')
const bisaVerifikasi = computed(
  () => !!permohonan.value && ['MENUNGGU_VERIFIKASI', 'PERLU_REVISI'].includes(permohonan.value.status),
)
const bisaJadwalkan = computed(
  () => !!permohonan.value && ['DITERIMA', 'DITUNDA'].includes(permohonan.value.status),
)

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'long' })
}
function bukaMaps(lat: string, lng: string) {
  window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')
}

// ===== Dialog Verifikasi =====
const dialogVerifikasi = ref(false)
const verifikasiMutation = useVerifikasiResellerPermohonan()
const { handleSubmit: verifikasiSubmit, errors: verifikasiErrors, values: verifikasiValues, setFieldValue: setVerifikasiField, resetForm: verifikasiReset } = useForm({
  validationSchema: toTypedSchema(verifikasiResellerSchema),
  initialValues: { status: 'DITERIMA', catatan: '', harga_custom: undefined },
})
const prosesVerifikasi = verifikasiSubmit(async (form) => {
  try {
    await verifikasiMutation.mutateAsync({ id: id.value, payload: form })
    toast.success('Verifikasi berhasil')
    dialogVerifikasi.value = false
    verifikasiReset()
  } catch (err: unknown) {
    const data = (err as { response?: { data?: { errors?: Record<string, string[]> } } })?.response?.data
    if (data?.errors) mapValidationErrors(data.errors)
    else toast.error('Gagal memproses verifikasi')
  }
})

// ===== Dialog Jadwalkan =====
const dialogJadwal = ref(false)
const jadwalkanMutation = useJadwalkanResellerKerja()
const { handleSubmit: jadwalkanSubmit, errors: jadwalkanErrors, values: jadwalkanValues, setFieldValue: setJadwalkanField, resetForm: jadwalkanReset } = useForm({
  validationSchema: toTypedSchema(jadwalkanResellerSchema),
  initialValues: { tanggal_kerja: '' },
})
const prosesJadwalkan = jadwalkanSubmit(async (form) => {
  try {
    await jadwalkanMutation.mutateAsync({ id: id.value, payload: { tanggal_kerja: form.tanggal_kerja } })
    toast.success('Penjadwalan berhasil')
    dialogJadwal.value = false
    jadwalkanReset()
  } catch {
    toast.error('Gagal menjadwalkan')
  }
})
</script>

<template>
  <div v-if="isLoading" class="space-y-4">
    <Skeleton class="h-8 w-64" />
    <Skeleton class="h-40 w-full" />
  </div>

  <div v-else-if="permohonan" class="grid gap-4 lg:grid-cols-3">
    <div class="space-y-4 lg:col-span-2">
      <!-- Ringkasan Permohonan -->
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
          <div v-if="permohonan.paket_internet_baru && permohonan.jenis_permohonan === 'ganti_paket'" class="text-sm">
            <p class="text-xs text-muted-foreground">Paket Baru</p>
            <p>{{ permohonan.paket_internet_baru.nama_paket }} ({{ permohonan.paket_internet_baru.kecepatan_mbps }} Mbps)</p>
          </div>
          <div v-else-if="isCustom" class="space-y-0.5 text-sm">
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

      <!-- Info Pelanggan -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <User class="size-4 text-primary" /> Info Pelanggan
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            <div><p class="text-xs text-muted-foreground">Nama</p><p>{{ permohonan.pelanggan?.nama_lengkap ?? '-' }}</p></div>
            <div><p class="text-xs text-muted-foreground">NIK</p><p>{{ permohonan.pelanggan?.nik ?? '-' }}</p></div>
            <div><p class="text-xs text-muted-foreground">No. HP</p><p class="flex items-center gap-1.5"><Phone class="size-3.5 text-muted-foreground" /> {{ permohonan.pelanggan?.nomor_hp ?? '-' }}</p></div>
            <div><p class="text-xs text-muted-foreground">Email</p><p class="flex items-center gap-1.5"><Mail class="size-3.5 text-muted-foreground" /> {{ permohonan.pelanggan?.email ?? '-' }}</p></div>
          </div>
          <div v-if="permohonan.pelanggan?.foto_ktp || permohonan.pelanggan?.foto_selfie_ktp" class="space-y-1.5">
            <p class="flex items-center gap-1.5 text-xs text-muted-foreground"><ImageIcon class="size-3.5" /> Dokumen Identitas</p>
            <div class="flex flex-wrap gap-3">
              <a v-if="permohonan.pelanggan.foto_ktp" :href="permohonan.pelanggan.foto_ktp" target="_blank" rel="noopener" class="group text-left">
                <img :src="permohonan.pelanggan.foto_ktp" alt="Foto KTP" class="h-36 w-60 rounded-md border object-cover transition-opacity group-hover:opacity-80" />
                <p class="mt-1 text-xs text-muted-foreground underline-offset-2 group-hover:underline">Foto KTP</p>
              </a>
              <a v-if="permohonan.pelanggan.foto_selfie_ktp" :href="permohonan.pelanggan.foto_selfie_ktp" target="_blank" rel="noopener" class="group text-left">
                <img :src="permohonan.pelanggan.foto_selfie_ktp" alt="Selfie KTP" class="h-36 w-60 rounded-md border object-cover transition-opacity group-hover:opacity-80" />
                <p class="mt-1 text-xs text-muted-foreground underline-offset-2 group-hover:underline">Selfie KTP</p>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Alamat -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <MapPin class="size-4 text-primary" /> Alamat Pemasangan
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-1 text-sm">
          <p>{{ permohonan.alamat_pemasangan }}, RT {{ permohonan.rt }}/RW {{ permohonan.rw }}, {{ permohonan.kode_pos }}</p>
          <p v-if="permohonan.detail_alamat" class="text-muted-foreground">Detail: {{ permohonan.detail_alamat }}</p>
          <Button v-if="permohonan.latitude && permohonan.longitude" variant="outline" size="sm" class="mt-2 gap-1.5"
            @click="bukaMaps(permohonan.latitude, permohonan.longitude)">
            <MapPin class="size-4" /> Buka di Google Maps <ExternalLink class="size-3.5" />
          </Button>
        </CardContent>
      </Card>

      <!-- Riwayat -->
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

    <!-- Sidebar Aksi -->
    <div class="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <BadgeCheck class="size-4 text-primary" /> Aksi
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-2">
          <Button v-if="bisaVerifikasi" class="w-full" @click="dialogVerifikasi = true">Verifikasi</Button>
          <Button v-if="bisaJadwalkan" class="w-full" variant="outline" @click="dialogJadwal = true">
            {{ permohonan.status === 'DITUNDA' ? 'Jadwalkan Ulang' : 'Jadwalkan Kerja' }}
          </Button>

          <div v-if="jadwalTerdekat && permohonan.status === 'DIJADWAKAN'" class="rounded-md bg-muted/50 p-3 text-sm space-y-1">
            <p class="font-medium">Jadwal Terdekat</p>
            <p>{{ formatTanggal(jadwalTerdekat.tanggal_kerja) }}</p>
          </div>

          <p v-if="!bisaVerifikasi && !bisaJadwalkan" class="text-sm text-muted-foreground">Tidak ada aksi yang tersedia.</p>
        </CardContent>
      </Card>

      <Button variant="ghost" class="w-full gap-1.5" @click="router.back()">
        <ArrowLeft class="size-4" /> Kembali
      </Button>
    </div>

    <!-- Dialog Verifikasi -->
    <Dialog :open="dialogVerifikasi" @update:open="(v) => { dialogVerifikasi = v; if (!v) verifikasiReset() }">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verifikasi Permohonan</DialogTitle>
          <DialogDescription>Terima, tolak, atau minta revisi permohonan ini.</DialogDescription>
        </DialogHeader>
        <form @submit.prevent="prosesVerifikasi" class="space-y-4">
          <div class="space-y-2">
            <Label>Keputusan</Label>
            <Select :model-value="verifikasiValues.status" @update:model-value="(v: any) => setVerifikasiField('status', v)">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DITERIMA">Terima</SelectItem>
                <SelectItem value="DITOLAK">Tolak</SelectItem>
                <SelectItem value="PERLU_REVISI">Perlu Revisi</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="verifikasiErrors.status" class="text-sm text-destructive">{{ verifikasiErrors.status }}</p>
          </div>

          <div v-if="isCustom && verifikasiValues.status === 'DITERIMA'" class="space-y-1.5">
            <Label>Harga Kesepakatan (Rp/bln)</Label>
            <Input type="number" :model-value="verifikasiValues.harga_custom" @update:model-value="(v: any) => setVerifikasiField('harga_custom', Number(v) || undefined)" />
            <p v-if="verifikasiErrors.harga_custom" class="text-xs text-destructive">{{ verifikasiErrors.harga_custom }}</p>
          </div>

          <div class="space-y-1.5">
            <Label>Catatan {{ verifikasiValues.status === 'DITERIMA' ? '(opsional)' : '(wajib)' }}</Label>
            <Textarea :model-value="verifikasiValues.catatan" @update:model-value="(v: any) => setVerifikasiField('catatan', v)" />
            <p v-if="verifikasiErrors.catatan" class="text-xs text-destructive">{{ verifikasiErrors.catatan }}</p>
          </div>

          <DialogFooter>
            <Button type="submit">Kirim Verifikasi</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Dialog Jadwalkan -->
    <Dialog :open="dialogJadwal" @update:open="(v) => { dialogJadwal = v; if (!v) jadwalkanReset() }">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ permohonan.status === 'DITUNDA' ? 'Jadwalkan Ulang Kerja' : 'Jadwalkan Kerja' }}</DialogTitle>
          <DialogDescription>Tentukan tanggal pengerjaan untuk permohonan ini.</DialogDescription>
        </DialogHeader>
        <form @submit.prevent="prosesJadwalkan" class="space-y-4">
          <div class="space-y-1.5">
            <Label>Tanggal Kerja</Label>
            <Input type="date" :model-value="jadwalkanValues.tanggal_kerja" @update:model-value="(v: any) => setJadwalkanField('tanggal_kerja', v)" />
            <p v-if="jadwalkanErrors.tanggal_kerja" class="text-xs text-destructive">{{ jadwalkanErrors.tanggal_kerja }}</p>
          </div>
          <DialogFooter>
            <Button type="submit">Simpan Jadwal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>