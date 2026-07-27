<script setup lang="ts">
import { FileText, UserCheck, CalendarCheck, Wrench, AlertTriangle } from 'lucide-vue-next'
import DashboardHeader from './DashboardHeader.vue'
import DashboardSection from './DashboardSection.vue'
import DashboardStatCard from './DashboardStatCard.vue'
import DashboardApplicationTrendChart from './DashboardApplicationTrendChart.vue'
import DashboardStatusDistribution from './DashboardStatusDistribution.vue'
import DashboardRecentApplications from './DashboardRecentApplications.vue'
import DashboardQuickActions from './DashboardQuickActions.vue'
import { useDashboardOperasional } from '../composables/useDashboardOperasional'

const { data, isLoading } = useDashboardOperasional()
</script>

<template>
  <DashboardHeader />

  <DashboardSection title="Ringkasan Operasional" description="Aktivitas operasional hari ini.">
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <DashboardStatCard
        :icon="FileText"
        label="Permohonan Hari Ini"
        :value="data?.stats?.permohonan_baru_hari_ini ?? 0"
        :loading="isLoading"
      />
      <DashboardStatCard
        :icon="UserCheck"
        label="Menunggu Verifikasi"
        :value="data?.stats?.menunggu_verifikasi ?? 0"
        :loading="isLoading"
      />
      <DashboardStatCard
        :icon="CalendarCheck"
        label="Pemasangan Hari Ini"
        :value="data?.stats?.pemasangan_hari_ini ?? 0"
        :loading="isLoading"
      />
      <DashboardStatCard
        :icon="Wrench"
        label="Teknisi Aktif"
        :value="data?.stats?.teknisi_aktif ?? 0"
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
    <DashboardApplicationTrendChart :data="data?.tren_permohonan" :loading="isLoading" />
    <DashboardStatusDistribution :data="data?.distribusi_status" :loading="isLoading" />
  </div>

  <DashboardRecentApplications :data="data?.permohonan_terbaru" :loading="isLoading" />

  <DashboardQuickActions />
</template>
