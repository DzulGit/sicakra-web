<script setup lang="ts">
import { h } from 'vue'
import { useRouter } from 'vue-router'
import { createColumnHelper, type ColumnDef } from '@tanstack/vue-table'
import { usePendaftarBaru } from '../../composables/useKeuanganTagihan'
import DataTable from '@/components/data/DataTable.vue'
import Pagination from '@/components/data/Pagination.vue'
import { Button } from '@/components/ui/button'

const router = useRouter()
const { data: hasil, isLoading } = usePendaftarBaru()

type PendaftarRow = NonNullable<typeof hasil.value>['data'][number]

const col = createColumnHelper<PendaftarRow>()

const columns = [
  col.accessor('nama_lengkap', {
    header: 'Nama Pelanggan',
  }),

  col.accessor('nomor_hp', {
    header: 'Nomor HP',
  }),

  col.accessor('layanan_internet', {
    header: 'Layanan Aktif',
    cell: ({ getValue }) => {
      const layanan = getValue() ?? []
      return `${layanan.length} layanan`
    },
  }),

  col.accessor('id', {
    header: '',
    cell: ({ getValue }) =>
      h(
        Button,
        {
          variant: 'outline',
          size: 'sm',
          onClick: () =>
            router.push(`/admin/operasional/pelanggan/${getValue()}`),
        },
        () => 'Detail',
      ),
  }),
]
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-xl font-semibold">Pendaftar Baru</h1>

      <p v-if="hasil" class="text-sm text-muted-foreground">
        {{ hasil.total }} pelanggan menunggu pembuatan tagihan pertama
      </p>
    </div>

    <DataTable
      :columns="columns as ColumnDef<PendaftarRow, unknown>[]"
      :data="hasil?.data ?? []"
      :loading="isLoading"
      empty-judul="Tidak ada pendaftar baru"
    />

    <Pagination
      v-if="hasil"
      :meta="hasil"
    />
  </div>
</template>