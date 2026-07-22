<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { usePermohonanLayananDetail } from '../composables/usePermohonanLayanan'
import { statusPermohonanEnum, jenisPermohonanEnum, tipePaketEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import RiwayatStatusTimeline from '../components/RiwayatStatusTimeline.vue'
import VerifikasiDialog from '../components/VerifikasiDialog.vue'
import JadwalkanKerjaDialog from '../components/JadwalkanKerjaDialog.vue'

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: permohonan, isLoading } = usePermohonanLayananDetail(id)

const dialogVerifikasiTerbuka = ref(false)
const dialogJadwalkanTerbuka = ref(false)

const bisaVerifikasi = computed(
  () =>
    !!permohonan.value &&
    ['MENUNGGU_VERIFIKASI', 'PERLU_REVISI'].includes(permohonan.value.status),
)

// Satu tombol jadwalkan buat 2 kasus: penjadwalan awal (DITERIMA) atau
// reschedule setelah ada kendala di kunjungan sebelumnya (DITUNDA).
const bisaJadwalkanKerja = computed(
  () =>
    !!permohonan.value && ['DITERIMA', 'DITUNDA'].includes(permohonan.value.status),
)

const labelTombolJadwalkan = computed(() =>
  permohonan.value?.status === 'DITUNDA' ? 'Jadwalkan Ulang' : 'Jadwalkan Kerja',
)
</script>

<template>
  <div v-if="isLoading" class="space-y-4">
    <Skeleton class="h-8 w-64" />
    <Skeleton class="h-40 w-full" />
  </div>

  <div v-else-if="permohonan" class="grid gap-6 lg:grid-cols-3">
    <div class="space-y-6 lg:col-span-2">
      <Card>
        <CardHeader class="flex-row items-center justify-between">
          <div>
            <CardTitle>{{ permohonan.nomor_permohonan }}</CardTitle>
            <p class="text-sm text-muted-foreground">{{ permohonan.pelanggan?.nama_lengkap }}</p>
          </div>
          <StatusBadge :value="permohonan.status" :map="statusPermohonanEnum" />
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-muted-foreground">Jenis Permohonan</p>
              <StatusBadge :value="permohonan.jenis_permohonan" :map="jenisPermohonanEnum" />
            </div>
            <div>
              <p class="text-muted-foreground">Tipe Paket</p>
              <StatusBadge :value="permohonan.tipe_paket" :map="tipePaketEnum" />
            </div>
            <div class="col-span-2">
              <p class="text-muted-foreground">Alamat Pemasangan</p>
              <p>{{ permohonan.alamat_pemasangan }}, RT {{ permohonan.rt }}/RW {{ permohonan.rw }}, {{ permohonan.kode_pos }}</p>
            </div>
            <div v-if="permohonan.paket_internet">
              <p class="text-muted-foreground">Paket</p>
              <p>{{ permohonan.paket_internet.nama_paket }} ({{ permohonan.paket_internet.kecepatan_mbps }} Mbps)</p>
            </div>
            <div v-else-if="permohonan.tipe_paket === 'custom'">
              <p class="text-muted-foreground">Paket Custom</p>
              <p>{{ permohonan.nama_paket_custom }} ({{ permohonan.kecepatan_custom_mbps }} Mbps)</p>
            </div>
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
          <CardTitle class="text-base">Riwayat Status</CardTitle>
        </CardHeader>
        <CardContent>
          <RiwayatStatusTimeline :riwayat="permohonan.riwayat_status ?? []" />
        </CardContent>
      </Card>
    </div>

    <div class="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle class="text-base">Aksi</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2">
          <Button v-if="bisaVerifikasi" class="w-full" @click="dialogVerifikasiTerbuka = true">
            Verifikasi
          </Button>
          <Button v-if="bisaJadwalkanKerja" class="w-full" variant="outline" @click="dialogJadwalkanTerbuka = true">
            {{ labelTombolJadwalkan }}
          </Button>
          <p v-if="!bisaVerifikasi && !bisaJadwalkanKerja" class="text-sm text-muted-foreground">
            Tidak ada aksi Operasional yang tersedia untuk status ini.
          </p>
        </CardContent>
      </Card>
    </div>

    <VerifikasiDialog v-model:open="dialogVerifikasiTerbuka" :permohonan-id="permohonan.id" />
    <JadwalkanKerjaDialog v-model:open="dialogJadwalkanTerbuka" :permohonan-id="permohonan.id" />
  </div>
</template>