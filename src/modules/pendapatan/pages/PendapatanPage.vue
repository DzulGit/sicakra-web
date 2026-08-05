<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Banknote, FileDown, FileSpreadsheet, Receipt, ClipboardList } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import DashboardStatCard from '@/modules/dashboard-admin/components/DashboardStatCard.vue'
import DashboardRevenueTrendChart from '@/modules/dashboard-admin/components/DashboardRevenueTrendChart.vue'
import DashboardStatusDistribution from '@/modules/dashboard-admin/components/DashboardStatusDistribution.vue'
import DashboardKeuanganTable from '@/modules/dashboard-admin/components/DashboardKeuanganTable.vue'
import { usePendapatan } from '../composables/usePendapatan'
import { getLaporanPendapatanPdf, getLaporanPendapatanExcel } from '../api/pendapatan.api'

const route = useRoute()
const router = useRouter()

const tahun = computed(() => (typeof route.query.tahun === 'string' ? route.query.tahun : String(new Date().getFullYear())))
const bulan = computed(() => (typeof route.query.bulan === 'string' ? route.query.bulan : String(new Date().getMonth() + 1)))
const mode = computed(() => (typeof route.query.bulan === 'string' ? 'bulan' : 'tahun'))

const tahunOptions = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - 2 + i))
const bulanOptions = Array.from({ length: 12 }, (_, i) => String(i + 1))

function setMode(m: 'bulan' | 'tahun') {
  const query: Record<string, string> = { tahun: tahun.value }
  if (m === 'bulan') query.bulan = bulan.value
  router.replace({ query })
}

function setTahun(nilai: string) {
  const query: Record<string, string> = { tahun: nilai }
  if (mode.value === 'bulan') query.bulan = bulan.value
  router.replace({ query })
}

function setBulan(nilai: string) {
  router.replace({ query: { tahun: tahun.value, bulan: nilai } })
}

const sedangMengunduh = ref(false)

async function unduhLaporan(fetch: () => Promise<{ data: Blob }>, namaFile: string) {
  if (sedangMengunduh.value) return
  sedangMengunduh.value = true
  try {
    const res = await fetch()
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = namaFile
    a.click()
    URL.revokeObjectURL(url)
  } finally {
    sedangMengunduh.value = false
  }
}

function cetakPdf() {
  void unduhLaporan(
    () => getLaporanPendapatanPdf({ tahun: tahun.value, bulan: bulan.value }),
    `laporan-pendapatan-${bulan.value}-${tahun.value}.pdf`,
  )
}

function cetakExcel() {
  void unduhLaporan(
    () => getLaporanPendapatanExcel({ tahun: tahun.value, bulan: bulan.value }),
    `laporan-pendapatan-${bulan.value}-${tahun.value}.xlsx`,
  )
}

const { data, isLoading } = usePendapatan()
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Pendapatan</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Ringkasan pendapatan periode {{ mode === 'bulan' ? `${bulan}/${tahun}` : `tahun ${tahun}` }}
        </p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" :disabled="sedangMengunduh" @click="cetakExcel">
          <FileSpreadsheet class="size-4" />
          Export Excel
        </Button>
        <Button :disabled="sedangMengunduh" @click="cetakPdf">
          <FileDown class="size-4" />
          Cetak PDF
        </Button>
      </div>
    </div>

    <Card>
      <CardContent class="flex flex-wrap items-center gap-3 p-4">
        <Button
          :variant="mode === 'bulan' ? 'default' : 'outline'"
          size="sm"
          @click="setMode('bulan')"
        >
          Bulan Ini
        </Button>
        <Button
          :variant="mode === 'tahun' ? 'default' : 'outline'"
          size="sm"
          @click="setMode('tahun')"
        >
          Tahun Ini
        </Button>

        <Select :model-value="tahun" @update:model-value="(nilai) => setTahun(String(nilai))">
          <SelectTrigger class="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="opt in tahunOptions" :key="opt" :value="opt">{{ opt }}</SelectItem>
          </SelectContent>
        </Select>

        <Select v-if="mode === 'bulan'" :model-value="bulan" @update:model-value="(nilai) => setBulan(String(nilai))">
          <SelectTrigger class="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="opt in bulanOptions" :key="opt" :value="opt">Bulan {{ opt }}</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <DashboardStatCard
        :icon="Banknote"
        label="Total Pendapatan"
        :value="data?.stats?.total_pendapatan ?? 'Rp0'"
        :loading="isLoading"
      />
      <DashboardStatCard
        :icon="Receipt"
        label="Jumlah Pembayaran"
        :value="data?.stats?.jumlah_pembayaran ?? 0"
        :loading="isLoading"
      />
      <DashboardStatCard
        :icon="ClipboardList"
        label="Tagihan Dibuat"
        :value="data?.stats?.tagihan_dibuat ?? 0"
        :loading="isLoading"
      />
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <DashboardRevenueTrendChart
        :data="data?.tren"
        :loading="isLoading"
        :title="mode === 'bulan' ? 'Pendapatan Harian' : 'Pendapatan Bulanan'"
      />
      <DashboardStatusDistribution
        :data="data?.distribusi_pembayaran"
        :loading="isLoading"
        title="Status Tagihan Periode"
      />
    </div>

    <DashboardKeuanganTable
      :data="data?.pembayaran_terbaru"
      :loading="isLoading"
      title="Pembayaran Terakhir"
      link-to="/admin/keuangan/tagihan"
    />
  </div>
</template>
