<script setup lang="ts">
import { computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ReceiptText, UserRound, FileText } from 'lucide-vue-next'
import type { ColumnDef } from '@tanstack/vue-table'
import { useResellerPelangganDetail } from '../composables/useResellerPortal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import DataTable from '@/components/data/DataTable.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { statusLayananEnum, statusPermohonanEnum, statusTagihanFinanceEnum } from '@/lib/enums'
import { formatRupiah, formatRupiahBertanda } from '@/lib/currency'
import { RouterLink } from 'vue-router'
import type { LayananInternetDetail, Tagihan } from '@/types/models'

const route = useRoute()
const router = useRouter()
const id = computed(() => String(route.params.id))

const { data: pelanggan, isLoading, isError } = useResellerPelangganDetail(id)

const layananList = computed<LayananInternetDetail[]>(() => pelanggan.value?.layanan_internet ?? [])

const ringkasan = computed(() => pelanggan.value?.ringkasan_tagihan ?? { belum_bayar: 0, sedang_cicil: 0, tertunggak: 0, lunas: 0 })

type BarisTagihan = Tagihan & { layananNomor: string }

const tagihanList = computed<BarisTagihan[]>(() => {
  const list: BarisTagihan[] = []
  for (const l of layananList.value) {
    for (const t of l.tagihan ?? []) {
      if (t.status_pembayaran === 'belum_diterbitkan') continue
      list.push({ ...t, layananNomor: l.nomor_layanan })
    }
  }
  return list.sort((a, b) => b.periode_tahun - a.periode_tahun || b.periode_bulan - a.periode_bulan)
})

const bisaBuatTagihanPertama = computed(() => {
  return layananList.value.some((layanan) => layanan.status === 'aktif' && !layanan.tagihan?.length)
})

const columnsTagihan: ColumnDef<BarisTagihan, unknown>[] = [
  { accessorKey: 'nomor_tagihan', header: 'Nomor Tagihan' },
  { accessorKey: 'layananNomor', header: 'Layanan' },
  { header: 'Periode', cell: ({ row }) => formatPeriode(row.original) },
  { header: 'Total', cell: ({ row }) => formatRupiah(row.original.total_tagihan) },
  { header: 'Sisa', cell: ({ row }) => formatRupiahBertanda(row.original.sisa) },
  { header: 'Status', cell: ({ row }) => h(StatusBadge, { value: row.original.status ?? '', map: statusTagihanFinanceEnum }) },
  {
    id: 'aksi',
    header: '',
    cell: ({ row }) =>
      h(Button, { as: RouterLink, to: `/reseller/tagihan/${row.original.id}`, variant: 'outline', size: 'sm' }, () => 'Detail'),
  },
]

function formatPeriode(t: Tagihan) {
  if ((t.jumlah_bulan ?? 1) > 1 && t.periode_akhir_bulan && t.periode_akhir_tahun) {
    return `${t.periode_bulan}/${t.periode_tahun} – ${t.periode_akhir_bulan}/${t.periode_akhir_tahun}`
  }
  return `${t.periode_bulan}/${t.periode_tahun}`
}

function formatTanggal(iso?: string | null) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(d)
}
</script>

<template>
  <div class="space-y-6">
    <!-- ===== Header ===== -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <Button variant="ghost" size="sm" @click="router.back()">
        <ArrowLeft class="size-4" /> Kembali
      </Button>
      <Button v-if="bisaBuatTagihanPertama" variant="outline" as-child>
        <RouterLink :to="`/reseller/pelanggan/${id}/buat-tagihan-pertama`">
          <ReceiptText class="mr-2 size-4" />
          Buat Tagihan Pertama
        </RouterLink>
      </Button>
    </div>

    <!-- ===== Loading (skeleton) ===== -->
    <div v-if="isLoading" class="grid gap-6 lg:grid-cols-3">
      <Skeleton class="h-64 lg:col-span-2" />
      <Skeleton class="h-40" />
      <Skeleton class="h-48 lg:col-span-3" />
    </div>

    <!-- ===== Error ===== -->
    <Card v-else-if="isError || !pelanggan">
      <CardContent class="py-10 text-center text-sm text-destructive">
        Pelanggan tidak ditemukan atau bukan milik reseller Anda.
      </CardContent>
    </Card>

    <template v-else>
      <!-- ===== Page title ===== -->
      <div class="flex flex-wrap items-center gap-3">
        <h1 class="text-3xl font-semibold tracking-tight">{{ pelanggan.nama_lengkap }}</h1>
        <Badge variant="secondary" class="font-mono">{{ pelanggan.nomor_pelanggan ?? 'Tanpa Nomor' }}</Badge>
      </div>

      <!-- ===== Profil Pelanggan + Ringkasan Tagihan ===== -->
      <div class="grid gap-6 lg:grid-cols-3">
        <Card class="lg:col-span-2">
          <CardHeader>
            <CardTitle class="flex items-center gap-2"><UserRound class="size-4" /> Profil Pelanggan</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <div>
                <p class="text-xs text-muted-foreground">Nomor Pelanggan</p>
                <p class="font-medium">{{ pelanggan.nomor_pelanggan ?? '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">NIK</p>
                <p class="font-medium">{{ pelanggan.nik }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">No. HP</p>
                <p class="font-medium">{{ pelanggan.nomor_hp }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Email</p>
                <p class="font-medium break-all">{{ pelanggan.email ?? '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Username</p>
                <p class="font-medium">{{ pelanggan.username ?? '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Status Akun</p>
                <Badge :variant="pelanggan.password_sudah_dibuat ? 'success' : 'secondary'">
                  {{ pelanggan.password_sudah_dibuat ? 'Password dibuat' : 'Belum buat password' }}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- ===== Ringkasan Tagihan ===== -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2"><ReceiptText class="size-4" /> Ringkasan Tagihan</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex items-center justify-between rounded-lg border p-3">
              <span class="text-sm text-muted-foreground">Belum Bayar</span>
              <Badge variant="secondary">{{ ringkasan.belum_bayar }}</Badge>
            </div>
            <div class="flex items-center justify-between rounded-lg border p-3">
              <span class="text-sm text-muted-foreground">Sedang Cicil</span>
              <Badge variant="warning">{{ ringkasan.sedang_cicil }}</Badge>
            </div>
            <div class="flex items-center justify-between rounded-lg border p-3">
              <span class="text-sm text-muted-foreground">Tertunggak</span>
              <Badge variant="destructive">{{ ringkasan.tertunggak }}</Badge>
            </div>
            <div class="flex items-center justify-between rounded-lg border p-3">
              <span class="text-sm text-muted-foreground">Lunas</span>
              <Badge variant="success">{{ ringkasan.lunas }}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- ===== Layanan Internet ===== -->
      <Card>
        <CardHeader>
          <CardTitle>Layanan Internet</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="!layananList.length" class="text-sm text-muted-foreground">Belum ada layanan internet.</div>
          <div v-else class="space-y-3">
            <div
              v-for="l in layananList"
              :key="l.id"
              class="rounded-lg border p-4"
            >
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="font-medium">
                      {{ l.paket_internet?.nama_paket ?? l.nama_paket_custom ?? 'Paket Custom' }}
                    </p>
                    <StatusBadge :value="l.status" :map="statusLayananEnum" />
                  </div>
                  <p class="text-xs text-muted-foreground">
                    {{ l.nomor_layanan }}
                    <template v-if="l.paket_internet"> · {{ l.paket_internet.kecepatan_mbps }} Mbps</template>
                    <template v-else-if="l.kecepatan_custom_mbps"> · {{ l.kecepatan_custom_mbps }} Mbps</template>
                    <template v-if="l.tanggal_aktif"> · Aktif sejak {{ formatTanggal(l.tanggal_aktif) }}</template>
                  </p>
                  <div class="mt-2 flex flex-wrap gap-4 text-sm">
                    <div>
                      <span class="text-xs text-muted-foreground">Bebas Tagihan </span>
                      <span class="font-medium">{{ l.bebas_tagihan_bulan ?? 0 }} bulan</span>
                    </div>
                    <div>
                      <span class="text-xs text-muted-foreground">Mulai Penagihan </span>
                      <span class="font-medium">{{ formatTanggal(l.tanggal_mulai_penagihan) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- ===== Daftar Tagihan ===== -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2"><ReceiptText class="size-4" /> Daftar Tagihan</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            :columns="columnsTagihan"
            :data="tagihanList"
            empty-judul="Belum ada tagihan"
            empty-deskripsi="Tagihan muncul setelah periode penagihan dimulai dan diterbitkan."
          />
        </CardContent>
      </Card>

      <!-- ===== Riwayat Permohonan ===== -->
      <Card v-if="pelanggan.permohonan_layanan?.length">
        <CardHeader><CardTitle class="flex items-center gap-2"><FileText class="size-4" /> Riwayat Permohonan</CardTitle></CardHeader>
        <CardContent>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div v-for="p in pelanggan.permohonan_layanan" :key="p.id" class="rounded-lg border p-3 text-sm">
              <div class="flex items-center justify-between gap-2">
                <p class="font-medium font-mono">{{ p.nomor_permohonan }}</p>
                <StatusBadge :value="p.status" :map="statusPermohonanEnum" />
              </div>
              <p class="text-muted-foreground">{{ p.jenis_permohonan }}</p>
              <p class="text-xs text-muted-foreground">{{ formatTanggal(p.created_at) }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
