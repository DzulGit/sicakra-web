<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft, FilePlus2, KeyRound, ReceiptText, UserRound,
} from 'lucide-vue-next'
import type { ColumnDef } from '@tanstack/vue-table'
import { usePelangganDetail } from '../composables/usePelanggan'
import GenerateTagihanDialog from '../components/GenerateTagihanDialog.vue'
import ResetPasswordDialog from '../components/ResetPasswordDialog.vue'
import { useAuthStore } from '@/stores/auth.store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import DataTable from '@/components/data/DataTable.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { statusLayananEnum, statusPembayaranEnum } from '@/lib/enums'
import type { LayananInternetDetail, Tagihan } from '@/types/models'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const pelangganId = Number(route.params.id)
const { data: pelanggan, isLoading, isError } = usePelangganDetail(pelangganId)

// Hanya Admin Keuangan / Super Admin yang boleh kelola tagihan & siklus billing.
const bolehKelolaBilling = authStore.peranAdmin === 'keuangan' || authStore.peranAdmin === 'super_admin'

// Reset password pelanggan untuk Admin Operasional / Super Admin.
const bolehResetPassword = authStore.peranAdmin === 'operasional' || authStore.peranAdmin === 'super_admin'

const generateDialogTerbuka = ref(false)
const resetPasswordTerbuka = ref(false)

const layananList = computed<LayananInternetDetail[]>(() => pelanggan.value?.layanan_internet ?? [])

type BarisTagihan = Tagihan & { layananNomor: string }

const tagihanList = computed<BarisTagihan[]>(() => {
  const list: BarisTagihan[] = []
  for (const l of layananList.value) {
    for (const t of l.tagihan ?? []) list.push({ ...t, layananNomor: l.nomor_layanan })
  }
  return list.sort((a, b) => b.periode_tahun - a.periode_tahun || b.periode_bulan - a.periode_bulan)
})

const columnsTagihan: ColumnDef<BarisTagihan, unknown>[] = [
  { accessorKey: 'nomor_tagihan', header: 'Nomor Tagihan' },
  { accessorKey: 'layananNomor', header: 'Layanan' },
  { header: 'Periode', cell: ({ row }) => formatPeriode(row.original) },
  { header: 'Jumlah', cell: ({ row }) => `${row.original.jumlah_bulan} bulan` },
  { header: 'Total', cell: ({ row }) => formatRupiah(row.original.total_tagihan) },
  { header: 'Jatuh Tempo', cell: ({ row }) => formatTanggal(row.original.tanggal_jatuh_tempo) },
  {
    header: 'Status',
    cell: ({ row }) => h(StatusBadge, { value: row.original.status_pembayaran, map: statusPembayaranEnum }),
  },
]

function formatPeriode(t: Tagihan) {
  if ((t.jumlah_bulan ?? 1) > 1 && t.periode_akhir_bulan && t.periode_akhir_tahun) {
    return `${t.periode_bulan}/${t.periode_tahun} – ${t.periode_akhir_bulan}/${t.periode_akhir_tahun}`
  }
  return `${t.periode_bulan}/${t.periode_tahun}`
}

function formatRupiah(nilai: string | number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(nilai))
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
      <Button v-if="bolehKelolaBilling" @click="generateDialogTerbuka = true">
        <FilePlus2 class="mr-2 size-4" />
        Generate Tagihan
      </Button>
      <Button v-if="bolehResetPassword" variant="outline" @click="resetPasswordTerbuka = true">
        <KeyRound class="mr-2 size-4" />
        Reset Username &amp; Password
      </Button>
    </div>

    <!-- ===== Loading (skeleton) ===== -->
    <div v-if="isLoading" class="grid gap-6 lg:grid-cols-3">
      <Skeleton class="h-64 lg:col-span-2" />
      <Skeleton class="h-64" />
      <Skeleton class="h-64 lg:col-span-3" />
    </div>

    <!-- ===== Error ===== -->
    <Card v-else-if="isError">
      <CardContent class="py-10 text-center text-sm text-destructive">
        Gagal memuat data pelanggan.
      </CardContent>
    </Card>

    <template v-else-if="pelanggan">
      <!-- ===== Page title ===== -->
      <div class="flex flex-wrap items-center gap-3">
        <h1 class="text-3xl font-semibold tracking-tight">{{ pelanggan.nama_lengkap }}</h1>
        <Badge variant="secondary" class="font-mono">{{ pelanggan.nomor_pelanggan ?? 'Tanpa Nomor' }}</Badge>
      </div>

      <!-- ===== Profil & Layanan ===== -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2"><UserRound class="size-4" /> Profil &amp; Layanan</CardTitle>
        </CardHeader>
        <CardContent class="space-y-5">
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

          <Separator />

          <div v-if="!layananList.length" class="text-sm text-muted-foreground">Belum ada layanan internet.</div>
          <div v-else class="space-y-3">
            <div
              v-for="l in layananList"
              :key="l.id"
              class="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="min-w-0">
                <div class="flex items-center gap-2">
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
            empty-deskripsi="Tagihan muncul setelah periode penagihan dimulai."
          />
        </CardContent>
      </Card>

      <!-- ===== Riwayat Permohonan ===== -->
      <Card v-if="pelanggan.permohonan_layanan?.length">
        <CardHeader><CardTitle>Riwayat Permohonan</CardTitle></CardHeader>
        <CardContent>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div v-for="p in pelanggan.permohonan_layanan" :key="p.id" class="rounded-lg border p-3 text-sm">
              <p class="font-medium font-mono">{{ p.nomor_permohonan }}</p>
              <p class="text-muted-foreground">{{ p.jenis_permohonan }}</p>
              <p class="text-muted-foreground">{{ p.status }}</p>
              <p class="text-xs text-muted-foreground">{{ formatTanggal(p.created_at) }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </template>

    <!-- ===== Dialog Generate Tagihan ===== -->
    <GenerateTagihanDialog
      :open="generateDialogTerbuka"
      :pelanggan="pelanggan ?? null"
      @update:open="(v) => (generateDialogTerbuka = v)"
      @saved="generateDialogTerbuka = false"
    />

    <!-- ===== Dialog Reset Password ===== -->
    <ResetPasswordDialog
      :open="resetPasswordTerbuka"
      :pelanggan="pelanggan ?? null"
      @update:open="(v) => (resetPasswordTerbuka = v)"
    />
  </div>
</template>