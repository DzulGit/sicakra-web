<script setup lang="ts">
import { Users, UserCheck, TrendingUp, Wrench, DollarSign, AlertTriangle } from 'lucide-vue-next'
import DashboardHeader from './DashboardHeader.vue'
import DashboardSection from './DashboardSection.vue'
import DashboardStatCard from './DashboardStatCard.vue'
import DashboardApplicationTrendChart from './DashboardApplicationTrendChart.vue'
import DashboardRevenueTrendChart from './DashboardRevenueTrendChart.vue'
import DashboardSystemHealth from './DashboardSystemHealth.vue'
import DashboardActivityFeed from './DashboardActivityFeed.vue'
import DashboardQuickActions from './DashboardQuickActions.vue'
import { useDashboardSuperAdmin } from '../composables/useDashboardSuperAdmin'

const { data, isLoading } = useDashboardSuperAdmin()
</script>

<template>
  <DashboardHeader />

  <DashboardSection title="Executive Summary" description="Overview kinerja organisasi.">
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <DashboardStatCard
        :icon="Users"
        label="Total Pelanggan"
        :value="data?.stats?.total_pelanggan ?? 0"
        :loading="isLoading"
      />
      <DashboardStatCard
        :icon="UserCheck"
        label="Pelanggan Aktif"
        :value="data?.stats?.pelanggan_aktif ?? 0"
        :loading="isLoading"
      />
      <DashboardStatCard
        :icon="TrendingUp"
        label="Pertumbuhan"
        :value="data?.stats?.pertumbuhan_pelanggan ?? 0"
        :loading="isLoading"
        subtitle="Bulan ini"
      />
      <DashboardStatCard
        :icon="Wrench"
        label="Total Teknisi"
        :value="data?.stats?.total_teknisi ?? 0"
        :loading="isLoading"
      />
      <DashboardStatCard
        :icon="DollarSign"
        label="Pendapatan Bulan Ini"
        :value="data?.stats?.pendapatan_bulan_ini ?? 'Rp0'"
        :loading="isLoading"
      />
      <DashboardStatCard
        :icon="AlertTriangle"
        label="Kendala Aktif"
        :value="data?.stats?.kendala_aktif ?? 0"
        :loading="isLoading"
      />
    </div>
  </DashboardSection>

  <div class="grid gap-6 lg:grid-cols-2">
    <DashboardApplicationTrendChart
      :data="data?.tren_pelanggan"
      :loading="isLoading"
      title="Pertumbuhan Pelanggan"
    />
    <DashboardRevenueTrendChart :data="data?.tren_pendapatan" :loading="isLoading" />
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <DashboardActivityFeed :data="data?.aktivitas_terbaru" :loading="isLoading" />
    <DashboardSystemHealth :data="data?.kesehatan_sistem" :loading="isLoading" />
  </div>

  <DashboardQuickActions />
</template>
