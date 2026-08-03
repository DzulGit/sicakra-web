<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronLeft, ChevronRight, FileText, UserPlus, Contact, Globe, MessageSquareWarning, UsersRound, UserCheck, CalendarCheck, Wrench, AlertTriangle } from 'lucide-vue-next'
import DashboardHeader from './DashboardHeader.vue'
import DashboardSection from './DashboardSection.vue'
import DashboardStatCard from './DashboardStatCard.vue'
import DashboardApplicationTrendChart from './DashboardApplicationTrendChart.vue'
import DashboardStatusDistribution from './DashboardStatusDistribution.vue'
import DashboardRecentApplications from './DashboardRecentApplications.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardOperasional } from '../composables/useDashboardOperasional'
import { statusPermohonanEnum, statusLaporanEnum } from '@/lib/enums'

const { data, isLoading } = useDashboardOperasional()

const PER_PAGE = 5
const sectionPages = ref<Record<string, number>>({})

function pageItems<T>(items: T[], key: string): T[] {
  const page = sectionPages.value[key] ?? 1
  return items.slice((page - 1) * PER_PAGE, page * PER_PAGE)
}

function totalPages(items: number): number {
  return Math.ceil(items / PER_PAGE) || 1
}

function prevPage(key: string) {
  const page = sectionPages.value[key] ?? 1
  if (page > 1) sectionPages.value[key] = page - 1
}

function nextPage(key: string, total: number) {
  const page = sectionPages.value[key] ?? 1
  if (page < totalPages(total)) sectionPages.value[key] = page + 1
}

const menuSections = computed(() => [
  {
    key: 'permohonan-layanan',
    title: 'Permohonan Layanan',
    icon: FileText,
    link: '/admin/operasional/permohonan-layanan',
    total: data.value?.permohonan_layanan.total ?? 0,
    stats: Object.entries(data.value?.permohonan_layanan.by_status ?? {}).map(([k, v]) => ({
      label: statusPermohonanEnum[k]?.label ?? k,
      value: v,
    })),
    items: (data.value?.permohonan_layanan.terbaru ?? []).map((p) => ({
      to: `/admin/operasional/permohonan-layanan/${p.id}`,
      label: `${p.nomor_permohonan} — ${p.pelanggan?.nama_lengkap ?? '-'}`,
      sub: statusPermohonanEnum[p.status]?.label ?? p.status,
    })),
  },
  {
    key: 'pendaftar-baru',
    title: 'Pendaftar Baru',
    icon: UserPlus,
    link: '/admin/operasional/pelanggan',
    total: data.value?.pendaftar_baru.total ?? 0,
    stats: Object.entries(data.value?.pendaftar_baru.by_status ?? {}).map(([k, v]) => ({
      label: statusPermohonanEnum[k]?.label ?? k,
      value: v,
    })),
    items: (data.value?.pendaftar_baru.terbaru ?? []).map((p) => ({
      to: `/admin/operasional/permohonan-layanan/${p.id}`,
      label: `${p.nomor_permohonan} — ${p.pelanggan?.nama_lengkap ?? '-'}`,
      sub: statusPermohonanEnum[p.status]?.label ?? p.status,
    })),
  },
  {
    key: 'pelanggan',
    title: 'Pelanggan',
    icon: Contact,
    link: '/admin/operasional/pelanggan',
    total: data.value?.pelanggan.total ?? 0,
    stats: [
      { label: 'Total', value: data.value?.pelanggan.total ?? 0 },
      { label: 'Aktif', value: data.value?.pelanggan.total_aktif ?? 0 },
    ],
    items: (data.value?.pelanggan.terbaru ?? []).map((p) => ({
      to: `/admin/operasional/pelanggan/${p.id}`,
      label: p.nama_lengkap,
      sub: p.nomor_pelanggan ?? '-',
    })),
  },
  {
    key: 'paket-internet',
    title: 'Paket Internet',
    icon: Globe,
    link: '/admin/operasional/paket-internet',
    total: data.value?.paket_internet.total ?? 0,
    stats: [
      { label: 'Total', value: data.value?.paket_internet.total ?? 0 },
      { label: 'Aktif', value: data.value?.paket_internet.total_aktif ?? 0 },
    ],
    items: (data.value?.paket_internet.terbaru ?? []).map((p) => ({
      to: '/admin/operasional/paket-internet',
      label: p.nama_paket,
      sub: `${p.kecepatan_mbps} Mbps`,
    })),
  },
  {
    key: 'laporan-kendala',
    title: 'Laporan Kendala',
    icon: MessageSquareWarning,
    link: '/admin/operasional/laporan-kendala',
    total: data.value?.laporan_kendala.total_aktif ?? 0,
    stats: Object.entries(data.value?.laporan_kendala.by_status ?? {}).map(([k, v]) => ({
      label: statusLaporanEnum[k]?.label ?? k,
      value: v,
    })),
    items: (data.value?.laporan_kendala.terbaru ?? []).map((l) => ({
      to: `/admin/operasional/laporan-kendala/${l.id}`,
      label: `${l.nomor_laporan} — ${l.kategori_kendala}`,
      sub: statusLaporanEnum[l.status]?.label ?? l.status,
    })),
  },
  {
    key: 'tim-teknisi',
    title: 'Tim Teknisi',
    icon: UsersRound,
    link: '/admin/operasional/tim-teknisi',
    total: data.value?.tim_teknisi.total ?? 0,
    stats: [
      { label: 'Tim', value: data.value?.tim_teknisi.total ?? 0 },
      { label: 'Tim Aktif', value: data.value?.tim_teknisi.total_aktif ?? 0 },
      { label: 'Anggota Aktif', value: data.value?.tim_teknisi.anggota_aktif ?? 0 },
    ],
    items: (data.value?.tim_teknisi.terbaru ?? []).map((t) => ({
      to: '/admin/operasional/tim-teknisi',
      label: t.nama_tim,
      sub: `${t.anggota_count ?? 0} anggota`,
    })),
  },
])
</script>

<template>
  <DashboardHeader />

  <DashboardSection title="Ringkasan Operasional" description="Aktivitas operasional hari ini.">
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <DashboardStatCard :icon="FileText" label="Permohonan Hari Ini" :value="data?.stats?.permohonan_baru_hari_ini ?? 0" :loading="isLoading" />
      <DashboardStatCard :icon="UserCheck" label="Menunggu Verifikasi" :value="data?.stats?.menunggu_verifikasi ?? 0" :loading="isLoading" />
      <DashboardStatCard :icon="CalendarCheck" label="Pemasangan Hari Ini" :value="data?.stats?.pemasangan_hari_ini ?? 0" :loading="isLoading" />
      <DashboardStatCard :icon="Wrench" label="Teknisi Aktif" :value="data?.stats?.teknisi_aktif ?? 0" :loading="isLoading" />
      <DashboardStatCard :icon="AlertTriangle" label="Kendala Aktif" :value="data?.stats?.kendala_aktif ?? 0" :loading="isLoading" />
    </div>
  </DashboardSection>

  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <Card v-for="section in menuSections" :key="section.key">
      <CardHeader class="flex flex-row items-center justify-between py-3">
        <CardTitle class="flex items-center gap-2 text-sm font-medium">
          <component :is="section.icon" class="size-4 text-muted-foreground" />
          {{ section.title }}
        </CardTitle>
        <Button as="RouterLink" :to="section.link" variant="ghost" size="sm" class="text-xs">
          Lihat Semua
        </Button>
      </CardHeader>
      <CardContent class="pb-3">
        <Skeleton v-if="isLoading" class="h-16 w-full" />
        <template v-else>
          <div class="mb-3 flex flex-wrap gap-1.5">
            <span
              v-for="stat in section.stats"
              class="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs"
            >
              <span class="font-semibold">{{ stat.value }}</span>
              <span class="text-muted-foreground">{{ stat.label }}</span>
            </span>
          </div>
          <div v-if="section.items.length" class="space-y-0.5">
            <div
              v-for="item in pageItems(section.items, section.key)"
              class="flex items-center justify-between rounded-md px-2 py-1 text-xs hover:bg-muted/50"
            >
              <RouterLink :to="item.to" class="font-medium text-primary hover:underline">
                {{ item.label }}
              </RouterLink>
              <span class="shrink-0 text-muted-foreground">{{ item.sub }}</span>
            </div>
            <div
              v-if="section.items.length > PER_PAGE"
              class="flex items-center justify-between border-t pt-1.5"
            >
              <button
                class="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                :disabled="(sectionPages[section.key] ?? 1) <= 1"
                @click="prevPage(section.key)"
              >
                <ChevronLeft class="size-3" /> Prev
              </button>
              <span class="text-xs text-muted-foreground">
                {{ sectionPages[section.key] ?? 1 }}/{{ totalPages(section.items.length) }}
              </span>
              <button
                class="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                :disabled="(sectionPages[section.key] ?? 1) >= totalPages(section.items.length)"
                @click="nextPage(section.key, section.items.length)"
              >
                Next <ChevronRight class="size-3" />
              </button>
            </div>
          </div>
          <p v-else class="text-xs text-muted-foreground">Belum ada data.</p>
        </template>
      </CardContent>
    </Card>
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <DashboardApplicationTrendChart :data="data?.tren_permohonan ?? []" :loading="isLoading" />
    <DashboardStatusDistribution :data="data?.distribusi_status ?? []" :loading="isLoading" />
  </div>

  <DashboardRecentApplications :data="data?.permohonan_terbaru" :loading="isLoading" />
</template>
