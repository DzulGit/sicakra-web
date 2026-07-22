<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import {
  useLaporanKendalaDetail,
  useTerimaLaporan,
  useTutupLaporan,
} from '../../composables/useOperasionalLaporanKendala'
import { statusLaporanEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import ConfirmDialog from '@/components/feedback/ConfirmDialog.vue'
import TeruskanKeTeknisiDialog from '../../components/TeruskanKeTeknisiDialog.vue'

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: laporan, isLoading } = useLaporanKendalaDetail(id)

const dialogTeruskanTerbuka = ref(false)
const dialogTutupTerbuka = ref(false)

const { mutate: terima, isPending: isPendingTerima } = useTerimaLaporan()
const { mutate: tutup, isPending: isPendingTutup } = useTutupLaporan()

function handleTerima() {
  terima(id.value, {
    onSuccess: () => toast.success('Laporan diterima, status jadi Diproses.'),
    onError: () => toast.error('Gagal menerima laporan.'),
  })
}

function handleTutup() {
  tutup(id.value, {
    onSuccess: () => {
      toast.success('Laporan ditutup.')
      dialogTutupTerbuka.value = false
    },
    onError: () => toast.error('Gagal menutup laporan.'),
  })
}

/** Nama admin yang ditugaskan — handle 2 kemungkinan bentuk data (lihat catatan di types/models.ts). */
function namaAdmin(nilai: number | { nama_lengkap: string } | null): string | null {
  if (!nilai) return null
  return typeof nilai === 'object' ? nilai.nama_lengkap : `Admin #${nilai}`
}

const bisaTerima = computed(() => laporan.value?.status === 'menunggu')
const bisaTeruskan = computed(() => laporan.value?.status === 'diproses')
const bisaTutup = computed(() =>
  ['menunggu', 'diproses', 'selesai'].includes(laporan.value?.status ?? ''),
)
</script>

<template>
  <div v-if="isLoading" class="space-y-4">
    <Skeleton class="h-8 w-64" />
    <Skeleton class="h-40 w-full" />
  </div>

  <div v-else-if="laporan" class="grid gap-6 lg:grid-cols-3">
    <div class="space-y-6 lg:col-span-2">
      <Card>
        <CardHeader class="flex-row items-center justify-between">
          <div>
            <CardTitle>{{ laporan.nomor_laporan }}</CardTitle>
            <p class="text-sm text-muted-foreground">
              {{ laporan.layanan_internet?.pelanggan?.nama_lengkap }} &middot;
              {{ laporan.layanan_internet?.nomor_layanan }}
            </p>
          </div>
          <StatusBadge :value="laporan.status" :map="statusLaporanEnum" />
        </CardHeader>
        <CardContent class="space-y-3 text-sm">
          <div>
            <p class="text-muted-foreground">Kategori Kendala</p>
            <p>{{ laporan.kategori_kendala }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Deskripsi</p>
            <p>{{ laporan.deskripsi }}</p>
          </div>
          <div v-if="namaAdmin(laporan.ditugaskan_ke)">
            <p class="text-muted-foreground">Ditugaskan ke</p>
            <p>{{ namaAdmin(laporan.ditugaskan_ke) }}</p>
          </div>
          <div v-if="laporan.hasil_penanganan">
            <p class="text-muted-foreground">Hasil Penanganan (dari Teknisi)</p>
            <p>{{ laporan.hasil_penanganan }}</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle class="text-base">Aksi</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2">
          <Button v-if="bisaTerima" class="w-full" :disabled="isPendingTerima" @click="handleTerima">
            Terima Laporan
          </Button>
          <Button v-if="bisaTeruskan" class="w-full" variant="outline" @click="dialogTeruskanTerbuka = true">
            Teruskan ke Teknisi
          </Button>
          <Button
            v-if="bisaTutup"
            class="w-full"
            variant="destructive"
            @click="dialogTutupTerbuka = true"
          >
            Tutup Laporan
          </Button>
          <p v-if="!bisaTerima && !bisaTeruskan && !bisaTutup" class="text-sm text-muted-foreground">
            Tidak ada aksi Operasional yang tersedia untuk status ini.
          </p>
        </CardContent>
      </Card>
    </div>

    <TeruskanKeTeknisiDialog v-model:open="dialogTeruskanTerbuka" :laporan-id="laporan.id" />
    <ConfirmDialog
      v-model:open="dialogTutupTerbuka"
      judul="Tutup laporan ini?"
      deskripsi="Pastikan pelanggan sudah puas dengan penanganannya sebelum menutup laporan."
      label-konfirmasi="Tutup Laporan"
      variant-konfirmasi="destructive"
      :loading="isPendingTutup"
      @confirm="handleTutup"
    />
  </div>
</template>
