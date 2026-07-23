<script setup lang="ts">
import { h, ref } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { toast } from 'vue-sonner'
import { useAdminList, useNonaktifkanAdmin } from '../composables/useSuperAdminAdmin'
import { peranAdminEnum } from '@/lib/enums'
import DataTable from '@/components/data/DataTable.vue'
import FilterBar from '@/components/data/FilterBar.vue'
import Pagination from '@/components/data/Pagination.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'
import ConfirmDialog from '@/components/feedback/ConfirmDialog.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { FilterFieldConfig } from '@/types/filter'
import type { AdminLengkap } from '@/types/models'

const { data: hasil, isLoading } = useAdminList()
const filterFields: FilterFieldConfig[] = [
  { key: 'peran', label: 'Peran', options: Object.entries(peranAdminEnum).map(([value, meta]) => ({ value, label: meta.label })) },
  { key: 'status_aktif', label: 'Status', options: [{ value: '1', label: 'Aktif' }, { value: '0', label: 'Nonaktif' }] },
]
const adminDikonfirmasi = ref<AdminLengkap | null>(null)
const { mutate: nonaktifkan, isPending: isPendingNonaktifkan } = useNonaktifkanAdmin()
function handleNonaktifkan() {
  if (!adminDikonfirmasi.value) return
  nonaktifkan(adminDikonfirmasi.value.id, {
    onSuccess: () => { toast.success('Admin berhasil dinonaktifkan.'); adminDikonfirmasi.value = null },
    onError: () => toast.error('Gagal menonaktifkan admin.'),
  })
}
const columns: ColumnDef<AdminLengkap, unknown>[] = [
  { accessorKey: 'nama_lengkap', header: 'Nama Lengkap' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'peran', header: 'Peran', cell: ({ row }) => h(StatusBadge, { value: row.original.peran, map: peranAdminEnum }) },
  { accessorKey: 'status_aktif', header: 'Status', cell: ({ row }) => h(Badge, { variant: row.original.status_aktif ? 'success' : 'secondary' }, () => row.original.status_aktif ? 'Aktif' : 'Nonaktif') },
  { id: 'aksi', header: '', cell: ({ row }) => h('div', { class: 'flex justify-end gap-2' }, [
    h(Button, { as: 'RouterLink', to: `/admin/super-admin/admin/${row.original.id}/ubah`, variant: 'outline', size: 'sm' }, () => 'Ubah'),
    row.original.status_aktif ? h(Button, { variant: 'destructive', size: 'sm', onClick: () => (adminDikonfirmasi.value = row.original) }, () => 'Nonaktifkan') : null,
  ]) },
]
</script>
<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Kelola Admin</h1>
      <Button as="RouterLink" to="/admin/super-admin/admin/baru">Tambah Admin</Button>
    </div>
    <FilterBar :fields="filterFields" />
    <DataTable :columns="columns" :data="hasil?.data ?? []" :loading="isLoading" empty-judul="Belum ada admin" />
    <Pagination v-if="hasil" :meta="hasil" />
    <ConfirmDialog :open="!!adminDikonfirmasi" judul="Nonaktifkan admin ini?" :deskripsi="`${adminDikonfirmasi?.nama_lengkap} tidak akan bisa login lagi.`" label-konfirmasi="Nonaktifkan" variant-konfirmasi="destructive" :loading="isPendingNonaktifkan" @update:open="(v) => !v && (adminDikonfirmasi = null)" @confirm="handleNonaktifkan" />
  </div>
</template>