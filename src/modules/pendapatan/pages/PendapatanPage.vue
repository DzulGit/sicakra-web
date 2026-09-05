<script setup lang="ts">
import { ref } from 'vue'
import { Banknote, FileDown, Receipt, ClipboardList } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import DashboardStatCard from '@/modules/dashboard-admin/components/DashboardStatCard.vue'
import DashboardRevenueTrendChart from '@/modules/dashboard-admin/components/DashboardRevenueTrendChart.vue'
import DashboardStatusDistribution from '@/modules/dashboard-admin/components/DashboardStatusDistribution.vue'
import DashboardKeuanganTable from '@/modules/dashboard-admin/components/DashboardKeuanganTable.vue'
import ExportDialog from '../components/ExportDialog.vue'
import { usePendapatan } from '../composables/usePendapatan'

const exportDialogOpen = ref(false)

const { data, isLoading } = usePendapatan()
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Pendapatan</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Ringkasan pendapatan
        </p>
      </div>
      <Button @click="exportDialogOpen = true">
        <FileDown class="size-4" />
        Export Laporan
      </Button>
    </div>

    <!-- Stats -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <DashboardStatCard
        :icon="Banknote"
        label="Total Pendapatan"
        :value="data?.stats?.total_pendapatan ?? 'Rp0'"
        :loading="isLoading"
      />
      <DashboardStatCard
        :icon="Receipt"
        label="Jumlah Pembayaran"
        :value="data?.stats?.jumlah_pembayaran ?? 0"
        :loading="isLoading"
      />
      <DashboardStatCard
        :icon="ClipboardList"
        label="Tagihan Dibuat"
        :value="data?.stats?.tagihan_dibuat ?? 0"
        :loading="isLoading"
      />
    </div>

    <!-- Charts -->
    <div class="grid gap-6 lg:grid-cols-2">
      <DashboardRevenueTrendChart
        :data="data?.tren"
        :loading="isLoading"
        title="Pendapatan"
      />
      <DashboardStatusDistribution
        :data="data?.distribusi_pembayaran"
        :loading="isLoading"
        title="Status Tagihan"
      />
    </div>

    <!-- Table -->
    <DashboardKeuanganTable
      :data="data?.pembayaran_terbaru"
      :loading="isLoading"
      title="Pembayaran Terakhir"
      link-to="/admin/keuangan/tagihan"
    />

    <!-- Export Dialog -->
    <ExportDialog v-model:open="exportDialogOpen" />
  </div>
</template>
