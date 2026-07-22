<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLayananSayaDetail } from '../composables/usePelangganLayanan'
import { statusLayananEnum, tipePaketEnum, jenisPerubahanPaketEnum, statusPerangkatEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import EmptyState from '@/components/data/EmptyState.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: layanan, isLoading } = useLayananSayaDetail(id)

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'long' })
}
</script>

<template>
  <div v-if="isLoading" class="space-y-4"><Skeleton class="h-64 w-full max-w-2xl" /></div>

  <div v-else-if="layanan" class="max-w-2xl space-y-6">
    <Card>
      <CardHeader class="flex-row items-center justify-between">
        <CardTitle>{{ layanan.nomor_layanan }}</CardTitle>
        <StatusBadge :value="layanan.status" :map="statusLayananEnum" />
      </CardHeader>
      <CardContent class="grid grid-cols-2 gap-4 text-sm">
        <div class="col-span-2">
          <p class="text-muted-foreground">Alamat Pemasangan</p>
          <p>{{ layanan.alamat_pemasangan }}, RT {{ layanan.rt }}/RW {{ layanan.rw }}, {{ layanan.kode_pos }}</p>
        </div>
        <div>
          <p class="text-muted-foreground">Paket</p>
          <div class="flex items-center gap-2">
            <StatusBadge :value="layanan.tipe_paket" :map="tipePaketEnum" />
            <span>{{ layanan.paket_internet?.nama_paket ?? layanan.nama_paket_custom }}</span>
          </div>
        </div>
        <div>
          <p class="text-muted-foreground">Aktif Sejak</p>
          <p>{{ formatTanggal(layanan.tanggal_aktif) }}</p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Perangkat Terpasang</CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState v-if="!layanan.perangkat?.length" judul="Belum ada data perangkat" />
        <ul v-else class="space-y-2">
          <li
            v-for="p in layanan.perangkat"
            :key="p.id"
            class="flex items-center justify-between border-b pb-2 text-sm last:border-0"
          >
            <span>{{ p.merek }} {{ p.tipe }} — {{ p.serial_number }}</span>
            <StatusBadge :value="p.status" :map="statusPerangkatEnum" />
          </li>
        </ul>
      </CardContent>
    </Card>

    <Card v-if="layanan.riwayat_perubahan_paket?.length">
      <CardHeader>
        <CardTitle class="text-base">Riwayat Perubahan Paket</CardTitle>
      </CardHeader>
      <CardContent>
        <ul class="space-y-2">
          <li v-for="r in layanan.riwayat_perubahan_paket" :key="r.id" class="border-b pb-2 text-sm last:border-0">
            <div class="flex items-center gap-2">
              <StatusBadge :value="r.jenis_perubahan" :map="jenisPerubahanPaketEnum" />
              <span>{{ r.nama_paket_lama }} → {{ r.nama_paket_baru }}</span>
            </div>
            <p class="text-xs text-muted-foreground">{{ formatTanggal(r.tanggal_perubahan) }}</p>
          </li>
        </ul>
      </CardContent>
    </Card>
  </div>
</template>
