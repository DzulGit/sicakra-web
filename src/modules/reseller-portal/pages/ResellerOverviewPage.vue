<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Contact, Wifi, AlertTriangle, Receipt, Wallet } from 'lucide-vue-next'
import DashboardSection from '@/modules/dashboard-admin/components/DashboardSection.vue'
import DashboardStatCard from '@/modules/dashboard-admin/components/DashboardStatCard.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useResellerDashboard } from '../composables/useResellerPortal'

const { data, isLoading } = useResellerDashboard()

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

</script>

<template>
  <div class="space-y-6 px-2">
    <DashboardSection title="Ringkasan Pelanggan" description="Data pelanggan milik reseller Anda.">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard :icon="Contact" label="Total Pelanggan" :value="data?.stats?.total_pelanggan ?? 0"
          :loading="isLoading" />

        <DashboardStatCard :icon="Wifi" label="Layanan Aktif" :value="data?.stats?.pelanggan_aktif ?? 0"
          :loading="isLoading" />

        <DashboardStatCard :icon="Receipt" label="Tagihan Belum Bayar" :value="data?.stats?.tagihan_belum_bayar ?? 0"
          :loading="isLoading" />

        <DashboardStatCard :icon="Wallet" label="Pendapatan" :value="formatRupiah(data?.stats?.pendapatan ?? 0)"
          :loading="isLoading" />

        <DashboardStatCard :icon="AlertTriangle" label="Kendala Aktif" :value="data?.stats?.kendala_aktif ?? 0"
          :loading="isLoading" />
      </div>
    </DashboardSection>

    <Card>
      <CardHeader class="flex flex-row items-center justify-between py-3">
        <CardTitle class="flex items-center gap-2 text-sm font-medium">
          <Contact class="size-4 text-muted-foreground" />
          Pelanggan Terbaru
        </CardTitle>
        <RouterLink to="/reseller/pelanggan" class="text-xs text-primary hover:underline">Lihat Semua</RouterLink>
      </CardHeader>
      <CardContent class="pb-3">
        <Skeleton v-if="isLoading" class="h-24 w-full" />
        <div v-else-if="data?.pelanggan_terbaru?.length" class="divide-y">
          <RouterLink v-for="pelanggan in data.pelanggan_terbaru" :key="pelanggan.id"
            :to="`/reseller/pelanggan/${pelanggan.id}`"
            class="flex items-center justify-between px-2 py-2 text-sm hover:bg-muted/50">
            <span class="font-medium">{{ pelanggan.nama_lengkap }}</span>
            <span class="shrink-0 text-xs text-muted-foreground">
              {{ pelanggan.layanan_internet?.[0]?.paket_internet?.nama_paket ??
                pelanggan.layanan_internet?.[0]?.nama_paket_custom ?? 'Belum ada layanan' }}
            </span>
          </RouterLink>
        </div>
        <p v-else class="text-xs text-muted-foreground">Belum ada pelanggan. Daftarkan lewat menu Pelanggan.</p>
      </CardContent>
    </Card>
  </div>
</template>