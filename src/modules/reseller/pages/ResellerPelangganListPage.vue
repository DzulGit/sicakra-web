<script setup lang="ts">
import { computed, h } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { ColumnDef } from '@tanstack/vue-table'
import { Users, UserCheck, Wallet, AlertTriangle } from 'lucide-vue-next'

import { useResellerPelangganList, useResellerStatistikDetail } from '../composables/useReseller.ts'
import ResellerMonitoringTabs from '../components/ResellerMonitoringTabs.vue'
import ResellerPieChart from '../components/ResellerPieChart.vue'
import ResellerTransaksiTable from '../components/ResellerTransaksiTable.vue'
import DashboardStatCard from '@/modules/dashboard-admin/components/DashboardStatCard.vue'
import DashboardRevenueTrendChart from '@/modules/dashboard-admin/components/DashboardRevenueTrendChart.vue'
import DashboardStatusDistribution from '@/modules/dashboard-admin/components/DashboardStatusDistribution.vue'
import DataTable from '@/components/data/DataTable.vue'
import Pagination from '@/components/data/Pagination.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Badge } from '@/components/ui/badge'
import type { Pelanggan, Tagihan } from '@/types/models'

const route = useRoute()
const resellerId = computed(() => String(route.params.id))
const { data: hasil, isLoading } = useResellerPelangganList(resellerId)
const { data: statistik, isLoading: statistikLoading } = useResellerStatistikDetail(resellerId)

function formatRupiah(value: string | number | null | undefined) {
  if (value === null || value === undefined) return '-'

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function getLatestTagihan(pelanggan: Pelanggan): Tagihan | null {
  const tagihan = pelanggan.layanan_internet?.[0]?.tagihan ?? []
  if (!tagihan.length) return null

  return [...tagihan].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0]
}

function getStatusTagihan(tagihan: Tagihan) {
  if (tagihan.status_pembayaran === 'sudah_bayar') {
    return { label: 'Sudah Dibayar', variant: 'success' as const }
  }

  if (
    tagihan.status_pembayaran === 'belum_bayar' &&
    tagihan.tanggal_jatuh_tempo &&
    new Date(tagihan.tanggal_jatuh_tempo) < new Date()
  ) {
    return { label: 'Terlambat', variant: 'destructive' as const }
  }

  return { label: 'Belum Dibayar', variant: 'secondary' as const }
}

const columns: ColumnDef<Pelanggan, unknown>[] = [
  { accessorKey: 'nomor_pelanggan', header: 'Nomor Pelanggan' },
  { accessorKey: 'nama_lengkap', header: 'Pelanggan' },
  {
    id: 'paket',
    header: 'Paket Internet',
    cell: ({ row }) => {
      const layanan = row.original.layanan_internet?.[0]
      if (!layanan) return '-'

      if (layanan.tipe_paket === 'custom') {
        return layanan.nama_paket_custom ?? 'Custom'
      }

      return layanan.paket_internet?.nama_paket ?? '-'
    },
  },
  {
    id: 'tagihan',
    header: 'Tagihan',
    cell: ({ row }) => {
      const tagihan = getLatestTagihan(row.original)
      if (!tagihan) return h('span', { class: 'text-muted-foreground' }, 'Belum ada tagihan')

      const status = getStatusTagihan(tagihan)

      return h('div', { class: 'space-y-1' }, [
        h('div', { class: 'font-medium' }, formatRupiah(tagihan.total_tagihan)),
        h(Badge, { variant: status.variant }, () => status.label),
      ])
    },
  },
  {
    id: 'status_layanan',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.layanan_internet?.[0]?.status
      if (!status) return h('span', { class: 'text-muted-foreground' }, '-')

      return h(StatusBadge, {
        value: status,
        map: {
          aktif: { label: 'Aktif', badgeVariant: 'success' },
          nonaktif: { label: 'Nonaktif', badgeVariant: 'secondary' },
        },
      })
    },
  },
  {
    id: 'aksi',
    header: 'Detail',
    cell: ({ row }) =>
      h(
        RouterLink,
        {
          to: {
            name: 'admin.operasional.reseller.pelanggan.detail',
            params: {
              id: resellerId.value,
              pelangganId: row.original.id,
            },
          },
          class: 'text-sm font-medium text-primary hover:underline',
        },
        () => 'Lihat Detail',
      ),
  },
]
</script>

<template>
  <div class="space-y-5">
    <div>
      <h1 class="text-xl font-semibold">Monitoring Reseller</h1>
      <p class="text-sm text-muted-foreground">
        Pantau pelanggan, paket internet, dan tagihan reseller secara read-only.
      </p>
    </div>

    <ResellerMonitoringTabs :reseller-id="resellerId" />

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <DashboardStatCard
        :icon="Users"
        label="Total Pelanggan"
        :value="statistik?.stats.total_pelanggan ?? 0"
        :loading="statistikLoading"
      />
      <DashboardStatCard
        :icon="UserCheck"
        label="Pelanggan Aktif"
        :value="statistik?.stats.pelanggan_aktif ?? 0"
        :loading="statistikLoading"
      />
      <DashboardStatCard
        :icon="Wallet"
        label="Total Pendapatan"
        :value="statistik ? formatRupiah(statistik.stats.total_pendapatan) : 0"
        subtitle="pembayaran berhasil"
        :loading="statistikLoading"
      />
      <DashboardStatCard
        :icon="AlertTriangle"
        label="Tagihan Belum Bayar"
        :value="statistik?.stats.tagihan_belum_bayar ?? 0"
        subtitle="dari {{ statistik?.stats.tagihan_dibuat ?? 0 }} tagihan dibuat"
        :loading="statistikLoading"
      />
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <DashboardRevenueTrendChart
        :data="statistik?.trend_pendapatan ?? []"
        :loading="statistikLoading"
        title="Tren Pendapatan 12 Bulan"
        :format-value="(v) => formatRupiah(v)"
      />
      <DashboardStatusDistribution
        :data="statistik?.distribusi_status_tagihan ?? []"
        :loading="statistikLoading"
        title="Distribusi Status Tagihan"
      />
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ResellerPieChart
        :data="statistik?.distribusi_paket ?? []"
        :loading="statistikLoading"
        title="Distribusi Paket Pelanggan Aktif"
      />
      <ResellerTransaksiTable
        :data="statistik?.transaksi_terbaru ?? []"
        :loading="statistikLoading"
      />
    </div>

    <DataTable
      :columns="columns"
      :data="hasil?.data ?? []"
      :loading="isLoading"
      empty-judul="Reseller ini belum memiliki pelanggan"
      empty-deskripsi="Pelanggan yang didaftarkan reseller akan muncul di sini."
    />

    <Pagination v-if="hasil" :meta="hasil" />
  </div>
</template>
