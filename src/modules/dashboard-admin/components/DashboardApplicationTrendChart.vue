<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
} from 'chart.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/data/EmptyState.vue'
import { BarChart3 } from 'lucide-vue-next'
import type { DashboardTrendPoint } from '@/types/models'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler)

const WARNA_PRIMARY = '#0d6d68'
const WARNA_PRIMARY_MUTED = 'rgba(13,109,104,0.08)'

const props = withDefaults(
  defineProps<{ data?: DashboardTrendPoint[]; loading?: boolean; title?: string }>(),
  { data: () => [], loading: false, title: 'Tren Permohonan' },
)

const chartData = computed(() => ({
  labels: props.data.map((d) => d.bulan),
  datasets: [
    {
      label: 'Permohonan',
      data: props.data.map((d) => d.jumlah),
      borderColor: WARNA_PRIMARY,
      backgroundColor: WARNA_PRIMARY_MUTED,
      borderWidth: 2,
      pointBackgroundColor: WARNA_PRIMARY,
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.3,
      fill: true,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: 'index' as const },
  plugins: {
    legend: { display: false },
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
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: 'hsl(var(--muted-foreground))', font: { size: 11 } },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'hsl(var(--border))', drawBorder: false },
      ticks: {
        color: 'hsl(var(--muted-foreground))',
        font: { size: 11 },
        precision: 0,
      },
    },
  },
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-sm font-medium">
        <BarChart3 class="size-4 text-muted-foreground" />
        {{ title }}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Skeleton v-if="loading" class="h-[280px] w-full" />
      <EmptyState
        v-else-if="data.length === 0"
        judul="Belum ada data tren"
        deskripsi="Data tren permohonan akan muncul setelah ada permohonan yang diproses."
      />
      <div v-else class="h-[280px]">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </CardContent>
  </Card>
</template>
