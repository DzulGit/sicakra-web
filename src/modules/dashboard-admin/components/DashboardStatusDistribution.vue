<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/data/EmptyState.vue'
import { PieChart } from 'lucide-vue-next'
import type { DashboardStatusDist } from '@/types/models'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const WARNA = ['#0d6d68', '#eab308', '#ef4444', '#3b82f6', '#8b5cf6', '#22c55e']

const props = withDefaults(
  defineProps<{ data?: DashboardStatusDist[]; loading?: boolean; title?: string }>(),
  { data: () => [], loading: false, title: 'Distribusi Status' },
)

const chartData = computed(() => ({
  labels: props.data.map((d) => d.label),
  datasets: [
    {
      data: props.data.map((d) => d.jumlah),
      backgroundColor: props.data.map((_, i) => WARNA[i % WARNA.length]),
      borderWidth: 0,
      hoverOffset: 8,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%' as const,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 16,
        usePointStyle: true,
        pointStyle: 'circle' as const,
        color: 'hsl(var(--muted-foreground))',
        font: { size: 11 },
      },
    },
    tooltip: {
      backgroundColor: 'hsl(var(--card))',
      titleColor: 'hsl(var(--foreground))',
      bodyColor: 'hsl(var(--muted-foreground))',
      borderColor: 'hsl(var(--border))',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
    },
  },
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-sm font-medium">
        <PieChart class="size-4 text-muted-foreground" />
        {{ title }}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Skeleton v-if="loading" class="h-[280px] w-full rounded-full" />
      <EmptyState
        v-else-if="data.length === 0"
        judul="Belum ada data distribusi"
        deskripsi="Distribusi status akan muncul setelah ada permohonan yang diproses."
      />
      <div v-else class="mx-auto h-[280px] max-w-[280px]">
        <Doughnut :data="chartData" :options="chartOptions" />
      </div>
    </CardContent>
  </Card>
</template>
