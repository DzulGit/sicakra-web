<script setup lang="ts">
import { ClipboardList, Wrench, CheckCircle, AlertTriangle } from 'lucide-vue-next'
import DashboardHeader from './DashboardHeader.vue'
import DashboardSection from './DashboardSection.vue'
import DashboardStatCard from './DashboardStatCard.vue'
import DashboardScheduleList from './DashboardScheduleList.vue'
import DashboardTechnicianActivity from './DashboardTechnicianActivity.vue'
import DashboardActiveTickets from './DashboardActiveTickets.vue'
import DashboardQuickActions from './DashboardQuickActions.vue'
import DashboardAntreanPengecekan from './DashboardAntreanPengecekan.vue'
import { useDashboardTeknisi } from '../composables/useDashboardTeknisi'
import { computed } from 'vue'

const { data, isLoading } = useDashboardTeknisi()

const activityItems = computed(() => {
  // Tambahkan (j: any) untuk menghindari error implicit 'any'
  return data.value?.riwayat_pekerjaan?.map((j: any) => ({
    id: j.id,
    teknisi: j.pelanggan,
    aktivitas: j.jenis_pekerjaan,
    waktu: j.waktu,
    status: j.status,
  })) ?? []
})
</script>

<template>
  <DashboardHeader />

  <DashboardSection title="Ringkasan Teknisi" description="Aktivitas teknisi hari ini.">
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <DashboardStatCard
        :icon="ClipboardList"
        label="Pekerjaan Hari Ini"
        :value="data?.stats?.pekerjaan_hari_ini ?? 0"
        :loading="isLoading"
      />
      <DashboardStatCard
        :icon="Wrench"
        label="Sedang Dikerjakan"
        :value="data?.stats?.sedang_dikerjakan ?? 0"
        :loading="isLoading"
      />
      <DashboardStatCard
        :icon="CheckCircle"
        label="Selesai Hari Ini"
        :value="data?.stats?.selesai_hari_ini ?? 0"
        :loading="isLoading"
      />
      <DashboardStatCard
        :icon="AlertTriangle"
        label="Tiket Kendala Aktif"
        :value="data?.stats?.tiket_kendala_aktif ?? 0"
        :loading="isLoading"
      />
    </div>
  </DashboardSection>

  <DashboardAntreanPengecekan />

  <div class="grid gap-6 lg:grid-cols-2">
    <DashboardScheduleList :data="data?.jadwal_hari_ini" :loading="isLoading" />
    <DashboardTechnicianActivity :data="activityItems" :loading="isLoading" />
  </div>

  <DashboardActiveTickets :data="data?.tiket_kendala_aktif" :loading="isLoading" />

  <DashboardQuickActions />
</template>
