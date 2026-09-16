<script setup lang="ts">
import { computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createColumnHelper, type ColumnDef } from '@tanstack/vue-table'
import { ArrowLeft, Wallet } from 'lucide-vue-next'
import { useSaldoKreditAdmin } from '../composables/useSaldoKredit'
import { formatRupiah } from '@/lib/currency'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import DataTable from '@/components/data/DataTable.vue'

const route = useRoute()
const router = useRouter()

const scope = computed(() => (route.path.startsWith('/reseller') ? 'reseller' : 'admin'))
const pelangganId = computed(() => route.params.pelanggan as string)

const { data: data, isLoading } = useSaldoKreditAdmin(scope.value, pelangganId)

type BarisMutasi = NonNullable<typeof data.value>['mutasi'][number]

const col = createColumnHelper<BarisMutasi>()

const columns = [
  col.accessor('waktu_wib', { header: 'Waktu (WIB)', cell: ({ getValue }) => getValue() || '—' }),
  col.accessor('jenis', {
    header: 'Jenis',
    cell: ({ getValue }) =>
      h(
        'span',
        {
          class:
            getValue() === 'kredit'
              ? 'inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800'
              : 'inline-flex rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800',
        },
        getValue() === 'kredit' ? 'Kredit (masuk)' : 'Pemakaian (keluar)',
      ),
  }),
  col.accessor('jumlah', {
    header: 'Jumlah',
    cell: ({ getValue }) => formatRupiah(getValue() as number),
  }),
  col.accessor('nomor_pembayaran', { header: 'Pembayaran', cell: ({ getValue }) => getValue() || '—' }),
  col.accessor('nomor_tagihan', { header: 'Tagihan', cell: ({ getValue }) => getValue() || '—' }),
  col.accessor('saldo_setelah', {
    header: 'Saldo Setelah',
    cell: ({ getValue }) => formatRupiah(getValue() as number),
  }),
  col.accessor('keterangan', { header: 'Keterangan', cell: ({ getValue }) => getValue() || '—' }),
]
</script>

<template>
  <div class="space-y-4">
    <Button variant="ghost" size="sm" class="gap-1" @click="router.back()">
      <ArrowLeft class="size-4" /> Kembali
    </Button>

    <div v-if="isLoading"><Skeleton class="h-64 w-full max-w-3xl" /></div>

    <template v-else-if="data">
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <Wallet class="size-4 text-muted-foreground" />
            Saldo Kredit — {{ data.pelanggan.nama_lengkap }}
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-2 text-sm">
          <p class="text-xs text-muted-foreground">No. Pelanggan: {{ data.pelanggan.nomor_pelanggan ?? '—' }}</p>
          <p class="text-2xl font-semibold tabular-nums {{ data.saldo_deposit < 0 ? 'text-rose-700' : '' }}">
            {{ formatRupiah(data.saldo_deposit) }}
          </p>
          <p class="text-xs text-muted-foreground">
            Saldo dihitung dari ledger ({{ data.mutasi.length }} mutasi). Kelebihan pembayaran tersimpan sebagai kredit dan dipakai otomatis untuk tagihan.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-base">Ledger Mutasi (Saldo Kredit)</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable :columns="columns as ColumnDef<BarisMutasi, unknown>[]" :data="data.mutasi" :loading="false" empty-judul="Belum ada mutasi saldo kredit" />
        </CardContent>
      </Card>
    </template>

    <p v-else class="text-sm text-muted-foreground">Data tidak ditemukan.</p>
  </div>
</template>