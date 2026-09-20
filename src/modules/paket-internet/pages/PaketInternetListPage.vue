<script setup lang="ts">
import { h, ref, computed } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { toast } from 'vue-sonner'
import { useAdminPaketInternetList, useHapusPaketInternet } from '../composables/usePaketInternet'
import { statusAktifEnum } from '@/lib/enums'
import DataTable from '@/components/data/DataTable.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'
import ConfirmDialog from '@/components/feedback/ConfirmDialog.vue'
import PaketInternetDialog from '../components/PaketInternetDialog.vue'
import { Button } from '@/components/ui/button'
import type { PaketInternet } from '@/types/models'

const { data: daftarPaket, isLoading } = useAdminPaketInternetList()
const paketDihapus = ref<PaketInternet | null>(null)
const { mutate: hapus, isPending: isPendingHapus } = useHapusPaketInternet()

// Dialog tambah/ubah paket
const dialogTerbuka = ref(false)
const paketDiubah = ref<PaketInternet | null>(null)
const modeDialog = computed<'tambah' | 'ubah'>(() => (paketDiubah.value ? 'ubah' : 'tambah'))
const paketIdDialog = computed(() => paketDiubah.value?.id ?? null)

function bukaTambah() {
  paketDiubah.value = null
  dialogTerbuka.value = true
}

function bukaUbah(paket: PaketInternet) {
  paketDiubah.value = paket
  dialogTerbuka.value = true
}

function tutupDialog(terbuka: boolean) {
  if (!terbuka) {
    dialogTerbuka.value = false
    paketDiubah.value = null
  }
}

function handleHapus() {
  if (!paketDihapus.value) return
  hapus(paketDihapus.value.id, {
    onSuccess: () => {
      toast.success('Paket internet berhasil dihapus.')
      paketDihapus.value = null
    },
    onError: () => toast.error('Gagal menghapus paket.'),
  })
}

function formatHarga(harga: string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(harga))
}

const columns: ColumnDef<PaketInternet, unknown>[] = [
  { accessorKey: 'nama_paket', header: 'Nama Paket' },
  { accessorKey: 'kecepatan_mbps', header: 'Kecepatan', cell: ({ row }) => `${row.original.kecepatan_mbps} Mbps` },
  { accessorKey: 'harga', header: 'Harga', cell: ({ row }) => formatHarga(row.original.harga) },
  { accessorKey: 'promo_gratis_bulan', header: 'Promo', cell: ({ row }) => `${row.original.promo_gratis_bulan ?? 0} bulan` },
  {
    accessorKey: 'deskripsi',
    header: 'Deskripsi',
    cell: ({ row }) => row.original.deskripsi?.slice(0, 60) ?? '-',
  },
  {
    accessorKey: 'status_aktif',
    header: 'Status',
    cell: ({ row }) => h(StatusBadge, { value: String(row.original.status_aktif), map: statusAktifEnum }),
  },
  {
    id: 'aksi',
    header: '',
    cell: ({ row }) =>
      h('div', { class: 'flex justify-end gap-2' }, [
        h(Button, { variant: 'outline', size: 'sm', onClick: () => bukaUbah(row.original) }, () => 'Ubah'),
        h(Button, { variant: 'destructive', size: 'sm', onClick: () => (paketDihapus.value = row.original) }, () => 'Hapus'),
      ]),
  },
]
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Paket Internet</h1>
      <Button @click="bukaTambah">Tambah Paket</Button>
    </div>

    <DataTable :columns="columns" :data="daftarPaket ?? []" :loading="isLoading" empty-judul="Belum ada paket internet" />

    <PaketInternetDialog
      :open="dialogTerbuka"
      :mode="modeDialog"
      :paket-id="paketIdDialog"
      @update:open="tutupDialog"
    />

    <ConfirmDialog
      :open="!!paketDihapus"
      judul="Hapus paket ini?"
      :deskripsi="`${paketDihapus?.nama_paket} akan dihapus permanen.`"
      label-konfirmasi="Hapus"
      variant-konfirmasi="destructive"
      :loading="isPendingHapus"
      @update:open="(v) => !v && (paketDihapus = null)"
      @confirm="handleHapus"
    />
  </div>
</template>