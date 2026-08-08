<script setup lang="ts">
import { h, ref, computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { AxiosError } from 'axios'
import { toast } from 'vue-sonner'
import { Search, X, UserCheck, Users, CalendarClock } from 'lucide-vue-next'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Component } from 'vue'
import { getPelangganList } from '../api/pelanggan.api'
import { useBulkAturTanggalTagihan } from '../composables/usePelanggan'
import { getPermohonanLayananList } from '@/modules/permohonan-layanan/api/permohonanLayanan.api'
import { statusPermohonanEnum } from '@/lib/enums'
import { useAuthStore } from '@/stores/auth.store'
import DataTable from '@/components/data/DataTable.vue'
import Pagination from '@/components/data/Pagination.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import type { ApiErrorResponse } from '@/types/api'
import type { Pelanggan, PermohonanLayanan } from '@/types/models'

type TabId = 'aktif' | 'terverifikasi'

const tabAktif = ref<TabId>('aktif')
const cariPelanggan = ref('')

const authStore = useAuthStore()
const queryClient = useQueryClient()
const bolehBulkTanggal = authStore.peranAdmin === 'keuangan' || authStore.peranAdmin === 'super_admin'

const showBulkDialog = ref(false)
const tanggalTagihanBulk = ref('20')
const { mutate: bulkTanggal, isPending: isBulkPending } = useBulkAturTanggalTagihan()

function terapkanSemua() {
  bulkTanggal(
    { tanggalTagihan: Number(tanggalTagihanBulk.value) },
    {
      onSuccess: (res) => {
        showBulkDialog.value = false
        toast.success(`Tanggal penagihan diterapkan ke ${res?.ter_update ?? 0} pelanggan.`)
        queryClient.invalidateQueries({ queryKey: ['pelanggan'] })
      },
      onError: (e: Error) => {
        const pesan = e instanceof AxiosError ? (e.response?.data as ApiErrorResponse | undefined)?.message : undefined
        toast.error(pesan ?? 'Gagal menerapkan tanggal penagihan.')
      },
    },
  )
}

const tabs: { id: TabId; label: string; icon: Component }[] = [
  { id: 'aktif', label: 'Pelanggan Aktif', icon: Users },
  { id: 'terverifikasi', label: 'Terverifikasi', icon: UserCheck },
]

const paramsPelanggan = computed(() => {
  const p: Record<string, string> = { jenis: 'aktif' }
  if (cariPelanggan.value) p.cari = cariPelanggan.value
  return p
})

const { data: dataPelanggan, isLoading: loadingPelanggan } = useQuery({
  queryKey: ['pelanggan', 'list', 'aktif', cariPelanggan],
  queryFn: () => getPelangganList(paramsPelanggan.value).then((r) => r.data.data),
  enabled: () => tabAktif.value === 'aktif',
})

const { data: dataTerverifikasi, isLoading: loadingTerverifikasi } = useQuery({
  queryKey: ['permohonan-layanan', 'list', 'terverifikasi'],
  queryFn: () =>
    getPermohonanLayananList({
      jenis_permohonan: 'pemasangan_baru',
      status: 'DITERIMA,DIJADWALKAN',
    }).then((r) => r.data.data),
  enabled: () => tabAktif.value === 'terverifikasi',
})

const columnsPelanggan: ColumnDef<Pelanggan, unknown>[] = [
  { accessorKey: 'nomor_pelanggan', header: 'Nomor Pelanggan' },
  { accessorKey: 'nama_lengkap', header: 'Nama' },
  { accessorKey: 'nik', header: 'NIK' },
  { accessorKey: 'nomor_hp', header: 'No. HP' },
  {
    id: 'tanggal_tagihan',
    header: 'Tagihan Tgl',
    cell: ({ row }) => row.original.tanggal_tagihan ?? '-',
  },
  {
    id: 'paket',
    header: 'Paket',
    cell: ({ row }) => {
      const layanan = row.original.layanan_internet?.[0]
      if (!layanan) return '-'
      if (layanan.tipe_paket === 'custom') return layanan.nama_paket_custom ?? 'Custom'
      return layanan.paket_internet?.nama_paket ?? '-'
    },
  },
  {
    id: 'status_layanan',
    header: 'Status',
    cell: ({ row }) => {
      const s = row.original.layanan_internet?.[0]?.status
      if (!s) return h('span', { class: 'text-muted-foreground' }, '-')
      return h(StatusBadge, {
        value: s,
        map: {
          aktif: { label: 'Aktif', badgeVariant: 'success' },
          nonaktif: { label: 'Nonaktif', badgeVariant: 'secondary' },
        },
      })
    },
  },
  {
    id: 'aksi',
    header: '',
    cell: ({ row }) =>
      h(Button, { as: 'RouterLink', to: `/admin/operasional/pelanggan/${row.original.id}`, variant: 'outline', size: 'sm' }, () => 'Detail'),
  },
]

const columnsDaftar: ColumnDef<PermohonanLayanan, unknown>[] = [
  { accessorKey: 'nomor_permohonan', header: 'Nomor Daftar' },
  {
    id: 'nama',
    header: 'Nama',
    cell: ({ row }) => row.original.pelanggan?.nama_lengkap ?? '-',
  },
  {
    id: 'nik',
    header: 'NIK',
    cell: ({ row }) => row.original.pelanggan?.nik ?? '-',
  },
  {
    id: 'hp',
    header: 'No. HP',
    cell: ({ row }) => row.original.pelanggan?.nomor_hp ?? '-',
  },
  {
    id: 'paket',
    header: 'Paket',
    cell: ({ row }) => {
      const p = row.original
      if (p.tipe_paket === 'custom') return p.nama_paket_custom ?? 'Custom'
      return p.paket_internet?.nama_paket ?? '-'
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => h(StatusBadge, { value: row.original.status, map: statusPermohonanEnum }),
  },
  {
    id: 'aksi',
    header: '',
    cell: ({ row }) =>
      h(Button, { as: 'RouterLink', to: `/admin/operasional/permohonan-layanan/${row.original.id}`, variant: 'outline', size: 'sm' }, () => 'Detail'),
  },
]
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Pelanggan</h1>
      <Button v-if="bolehBulkTanggal" variant="outline" size="sm" class="gap-1.5" @click="showBulkDialog = true">
        <CalendarClock class="size-4" /> Terapkan Tanggal Tagihan (Semua)
      </Button>
    </div>

    <Dialog :open="showBulkDialog" @update:open="(v) => (showBulkDialog = v)">
      <DialogContent class="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Terapkan untuk Semua</DialogTitle>
          <DialogDescription>
            Set tanggal penagihan yang sama untuk semua pelanggan aktif. Bisa tetap diedit manual
            satu per satu dari halaman detail pelanggan.
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-2">
          <p class="text-sm text-muted-foreground">Tanggal penagihan</p>
          <Select v-model="tanggalTagihanBulk" :disabled="isBulkPending">
            <SelectTrigger>
              <SelectValue placeholder="Pilih tanggal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="hari in 31" :key="hari" :value="String(hari)">Tanggal {{ hari }}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter class="gap-2 sm:gap-0">
          <Button variant="outline" @click="showBulkDialog = false" :disabled="isBulkPending">Batal</Button>
          <Button :disabled="isBulkPending" @click="terapkanSemua">
            {{ isBulkPending ? 'Menerapkan...' : 'Terapkan' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <div class="flex gap-1 rounded-lg border bg-muted/30 p-1 w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="tabAktif = tab.id"
        class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
        :class="tabAktif === tab.id ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
      >
        <component :is="tab.icon" class="size-4" />
        {{ tab.label }}
      </button>
    </div>

    <div v-if="tabAktif === 'aktif'" class="relative w-full max-w-sm">
      <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="cariPelanggan" placeholder="Cari nama / nomor / NIK / HP..." class="pl-9" />
      <button
        v-if="cariPelanggan"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        @click="cariPelanggan = ''"
      >
        <X class="size-4" />
      </button>
    </div>

    <DataTable
      v-if="tabAktif === 'aktif'"
      :columns="columnsPelanggan"
      :data="(dataPelanggan as any)?.data ?? []"
      :loading="loadingPelanggan"
      empty-judul="Belum ada pelanggan aktif"
      empty-deskripsi="Pelanggan aktif akan muncul setelah teknisi menyelesaikan pemasangan."
    />
    <DataTable
      v-if="tabAktif === 'terverifikasi'"
      :columns="columnsDaftar"
      :data="(dataTerverifikasi as any)?.data ?? []"
      :loading="loadingTerverifikasi"
      empty-judul="Tidak ada yang terverifikasi"
      empty-deskripsi="Permohonan yang sudah diverifikasi akan muncul di sini."
    />

    <Pagination v-if="tabAktif === 'aktif' && dataPelanggan" :meta="dataPelanggan" />
    <Pagination v-if="tabAktif === 'terverifikasi' && dataTerverifikasi" :meta="dataTerverifikasi" />
  </div>
</template>
