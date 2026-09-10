<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, type TooltipItem } from 'chart.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/data/EmptyState.vue'
import { BarChart3 } from 'lucide-vue-next'
import type { ResellerDistribusiItem } from '@/types/models'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const WARNA = '#0d6d68'

const props = withDefaults(
  defineProps<{ data?: ResellerDistribusiItem[]; loading?: boolean; title?: string; formatValue?: (v: number) => string }>(),
  {
    data: () => [],
    loading: false,
    title: 'Grafik',
    formatValue: (v: number) => `Rp${new Intl.NumberFormat('id-ID').format(v)}`,
  },
)

const chartData = computed(() => ({
  labels: props.data.map((d) => d.label),
  datasets: [
    {
      label: props.title,
      data: props.data.map((d) => d.jumlah),
      backgroundColor: WARNA,
      borderRadius: 4,
      maxBarThickness: 32,
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
      callbacks: { label: (ctx: TooltipItem<'bar'>) => props.formatValue(ctx.parsed.y ?? 0) },
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
        <BarChart3 class="size-4 text-muted-foreground" />
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