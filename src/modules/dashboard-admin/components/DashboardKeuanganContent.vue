<script setup lang="ts">
import { DollarSign, Receipt, CalendarClock, TrendingUp, Banknote, AlertCircle } from 'lucide-vue-next'
import DashboardSection from './DashboardSection.vue'
import DashboardHeader from './DashboardHeader.vue'
import DashboardStatCard from './DashboardStatCard.vue'
import DashboardRevenueTrendChart from './DashboardRevenueTrendChart.vue'
import DashboardStatusDistribution from './DashboardStatusDistribution.vue'
import DashboardKeuanganTable from './DashboardKeuanganTable.vue'
import DashboardQuickActions from './DashboardQuickActions.vue'
import { useDashboardKeuangan } from '../composables/useDashboardKeuangan'

const { data, isLoading } = useDashboardKeuangan()
</script>

<template>
  <DashboardHeader />

  <DashboardSection title="Ringkasan Keuangan" description="Overview keuangan hari ini.">
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <DashboardStatCard
        :icon="Banknote"
        label="Pembayaran Hari Ini"
        :value="data?.stats?.pembayaran_hari_ini ?? 0"
        :loading="isLoading"
      />
      <DashboardStatCard
        :icon="DollarSign"
        label="Total Pembayaran"
        :value="data?.stats?.total_pembayaran_hari_ini ?? 'Rp0'"
        :loading="isLoading"
      />
      <DashboardStatCard
        :icon="AlertCircle"
        label="Tagihan Tertunggak"
        :value="data?.stats?.tagihan_tertunggak ?? 0"
        :loading="isLoading"
      />
      <DashboardStatCard
        :icon="TrendingUp"
        label="Pendapatan Bulan Ini"
        :value="data?.stats?.pendapatan_bulan_ini ?? 'Rp0'"
        :loading="isLoading"
      />
    </div>
  </DashboardSection>

  <div class="grid gap-6 lg:grid-cols-2">
    <DashboardRevenueTrendChart :data="data?.tren_pendapatan" :loading="isLoading" />
    <DashboardStatusDistribution :data="data?.distribusi_pembayaran" title="Status Pembayaran" :loading="isLoading" />
  </div>

  <DashboardKeuanganTable
    :data="data?.pembayaran_terbaru"
    :loading="isLoading"
    link-to="/admin/keuangan/tagihan"
  />

  <DashboardQuickActions />
</template>
