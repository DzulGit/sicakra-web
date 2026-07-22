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
import type { RingkasanOmzet } from '@/types/models'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps<{ data: RingkasanOmzet[] }>()

const namaBulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

// Warna disamakan manual dengan --primary (teal) di color-system.md — Chart.js
// render ke <canvas>, jadi tidak otomatis ikut CSS variable seperti komponen lain.
// Kalau token --primary berubah, warna ini perlu di-update manual juga.
const WARNA_PRIMARY = '#0d6d68'

const chartData = computed(() => ({
  labels: props.data.map((d) => namaBulan[d.periode_bulan - 1]),
  datasets: [
    {
      label: 'Omzet',
      data: props.data.map((d) => Number(d.total_omzet)),
      backgroundColor: WARNA_PRIMARY,
      borderRadius: 4,
      maxBarThickness: 40,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: {
      ticks: {
        callback: (value: number | string) => `Rp${(Number(value) / 1_000_000).toFixed(1)}jt`,
      },
    },
  },
}
</script>

<template>
  <div class="h-64">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
