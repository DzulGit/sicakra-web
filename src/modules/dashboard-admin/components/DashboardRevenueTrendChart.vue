<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/data/EmptyState.vue'
import { TrendingUp } from 'lucide-vue-next'
import type { DashboardTrendPoint } from '@/types/models'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const WARNA_PRIMARY = '#0d6d68'

const props = withDefaults(
  defineProps<{ data?: DashboardTrendPoint[]; loading?: boolean; title?: string; label?: string; formatValue?: (v: number) => string }>(),
  { data: () => [], loading: false, title: 'Tren Pendapatan', label: 'Pendapatan', formatValue: (v: number) => `Rp${(v / 1_000_000).toFixed(1)}jt` },
)

const chartData = computed(() => ({
  labels: props.data.map((d) => d.bulan),
  datasets: [
    {
      label: props.label,
      data: props.data.map((d) => d.jumlah),
      backgroundColor: WARNA_PRIMARY,
      borderRadius: 4,
      maxBarThickness: 40,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
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
    x: { grid: { display: false }, ticks: { color: 'hsl(var(--muted-foreground))', font: { size: 11 } } },
    y: {
      beginAtZero: true,
      grid: { color: 'hsl(var(--border))', drawBorder: false },
      ticks: { color: 'hsl(var(--muted-foreground))', font: { size: 11 } },
    },
  },
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-sm font-medium">
        <TrendingUp class="size-4 text-muted-foreground" />
        {{ title }}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Skeleton v-if="loading" class="h-[280px] w-full" />
      <EmptyState
        v-else-if="data.length === 0"
        judul="Belum ada data"
        deskripsi="Data akan muncul setelah tersedia."
      />
      <div v-else class="h-[280px]">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </CardContent>
  </Card>
</template>
