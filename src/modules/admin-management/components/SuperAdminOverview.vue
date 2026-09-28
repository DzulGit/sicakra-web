<script setup lang="ts">
import { Users, UserCheck, TrendingUp, Wrench, DollarSign, AlertTriangle } from 'lucide-vue-next'
import { useDashboardSuperAdmin } from '@/modules/dashboard-admin/composables/useDashboardSuperAdmin'
import DashboardStatCard from '@/modules/dashboard-admin/components/DashboardStatCard.vue'
import DashboardApplicationTrendChart from '@/modules/dashboard-admin/components/DashboardApplicationTrendChart.vue'
import DashboardRevenueTrendChart from '@/modules/dashboard-admin/components/DashboardRevenueTrendChart.vue'

const { data, isLoading } = useDashboardSuperAdmin()
</script>

<template>
  <section class="space-y-4">
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
        label="Pelanggan Baru Bulan Ini"
        :value="data?.stats?.pertumbuhan_pelanggan ?? 0"
        :loading="isLoading"
      />
      <DashboardStatCard
        :icon="Wrench"
        label="Teknisi Aktif"
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

    <div class="grid gap-6 lg:grid-cols-2">
      <DashboardApplicationTrendChart
        :data="data?.tren_pelanggan"
        :loading="isLoading"
        title="Pertumbuhan Pelanggan"
        label="Pelanggan"
      />
      <DashboardRevenueTrendChart :data="data?.tren_pendapatan" :loading="isLoading" />
    </div>
  </section>
</template>