<script setup lang="ts">
import { h, ref, computed } from 'vue'
import { createColumnHelper, type ColumnDef } from '@tanstack/vue-table'
import { useResellerDraftTagihanList, useTerbitkanResellerTagihan } from '../composables/useResellerTagihan'
import type { DraftTagihan } from '../api/resellerTagihan.api'
import DataTable from '@/components/data/DataTable.vue'
import Pagination from '@/components/data/Pagination.vue'
import FilterBar from '@/components/data/FilterBar.vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'vue-sonner'

const { data: hasil, isLoading } = useResellerDraftTagihanList()
const terbitkanMut = useTerbitkanResellerTagihan()

const selectedIds = ref<Set<number>>(new Set())
const nominalOverrides = ref<Record<number, number>>({})
const showConfirm = ref(false)

const semuaDipilih = computed(() => {
  const data = hasil.value?.data ?? []
  return data.length > 0 && data.every((t) => selectedIds.value.has(t.id))
})

function toggleSemua() {
  const data = hasil.value?.data ?? []
  if (semuaDipilih.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(data.map((t) => t.id))
  }
}

function toggleOne(id: number) {
  const s = new Set(selectedIds.value)
  if (s.has(id)) {
    s.delete(id)
  } else {
    s.add(id)
  }
  selectedIds.value = s
}

function formatRupiah(v: string | number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v))
}

function getNominalDefault(t: DraftTagihan) {
  const over = nominalOverrides.value[t.id]
  return over !== undefined ? over : Number(t.total_tagihan)
}

async function handleTerbitkan() {
  if (selectedIds.value.size === 0) return

  const tagihanIds = Array.from(selectedIds.value)
  const nominal: Record<number, number> = {}
  for (const id of tagihanIds) {
    const over = nominalOverrides.value[id]
    if (over !== undefined) {
      nominal[id] = over
    }
  }

  try {
    const res = await terbitkanMut.mutateAsync({
      tagihan_ids: tagihanIds,
      nominal: Object.keys(nominal).length > 0 ? nominal : undefined,
    })
    toast.success(res.message)
    selectedIds.value = new Set()
    nominalOverrides.value = {}
    showConfirm.value = false
  } catch (e: any) {
    toast.error(e?.response?.data?.message || 'Gagal menerbitkan tagihan.')
  }
}

const col = createColumnHelper<DraftTagihan>()

const columns: ColumnDef<DraftTagihan, any>[] = [
  {
    id: 'select',
    header: () =>
      h(Checkbox, {
        modelValue: semuaDipilih.value,
        'onUpdate:modelValue': toggleSemua,
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        modelValue: selectedIds.value.has(row.original.id),
        'onUpdate:modelValue': () => toggleOne(row.original.id),
      }),
    size: 40,
  },
  col.accessor('nomor_tagihan', { header: 'Nomor' }),
  col.accessor((row) => row.layanan_internet?.pelanggan?.nama_lengkap, {
    id: 'nama_pelanggan',
    header: 'Pelanggan',
    cell: ({ getValue }) => getValue() || '—',
  }),
  col.accessor((row) => row.layanan_internet?.paket_internet?.nama_paket ?? row.nama_paket_snapshot, {
    id: 'paket',
    header: 'Paket',
    cell: ({ getValue }) => getValue() || '—',
  }),
  col.accessor('periode_bulan', {
    header: 'Periode',
    cell: ({ row }) => `${row.original.periode_bulan}/${row.original.periode_tahun}`,
  }),
  col.accessor('total_tagihan', {
    header: 'Harga Default',
    cell: ({ getValue }) => formatRupiah(getValue()),
  }),
  {
    id: 'nominal',
    header: 'Nominal',
    cell: ({ row }) =>
      h(Input, {
        type: 'number',
        class: 'w-32 h-8 text-xs',
        modelValue: String(getNominalDefault(row.original)),
        'onUpdate:modelValue': (v: string) => {
          nominalOverrides.value[row.original.id] = Number(v)
        },
      }),
    size: 140,
  },
]
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">Terbitkan Tagihan</h1>
        <p v-if="hasil" class="text-sm text-muted-foreground">
          {{ hasil.total }} tagihan draft menunggu diterbitkan
        </p>
      </div>
      <Button
        :disabled="selectedIds.size === 0 || terbitkanMut.isPending.value"
        @click="showConfirm = true"
      >
        Terbitkan Tagihan ({{ selectedIds.size }})
      </Button>
    </div>

    <FilterBar :fields="[
      { key: 'periode_bulan', label: 'Bulan', placeholder: 'Semua Bulan', options: [
        { label: 'Januari', value: '1' }, { label: 'Februari', value: '2' },
        { label: 'Maret', value: '3' }, { label: 'April', value: '4' },
        { label: 'Mei', value: '5' }, { label: 'Juni', value: '6' },
        { label: 'Juli', value: '7' }, { label: 'Agustus', value: '8' },
        { label: 'September', value: '9' }, { label: 'Oktober', value: '10' },
        { label: 'November', value: '11' }, { label: 'Desember', value: '12' },
      ]},
      { key: 'periode_tahun', label: 'Tahun', placeholder: 'Semua Tahun', options: [
        { label: '2026', value: '2026' }, { label: '2025', value: '2025' },
      ]},
    ]" />

    <DataTable
      :columns="columns"
      :data="hasil?.data ?? []"
      :loading="isLoading"
      empty-judul="Tidak ada tagihan draft"
    />

    <Pagination v-if="hasil" :meta="hasil" />

    <Dialog v-model:open="showConfirm">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Konfirmasi Terbitkan Tagihan</DialogTitle>
          <DialogDescription>
            Anda akan menerbitkan {{ selectedIds.size }} tagihan. Tagihan akan langsung aktif
            dan link pembayaran akan dikirim ke pelanggan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showConfirm = false">Batal</Button>
          <Button :disabled="terbitkanMut.isPending.value" @click="handleTerbitkan">
            {{ terbitkanMut.isPending.value ? 'Menerbitkan...' : 'Terbitkan' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
