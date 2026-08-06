<script setup lang="ts">
import { computed, h, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AxiosError } from 'axios'
import { toast } from 'vue-sonner'
import { ArrowLeft, CalendarClock, FilePlus2, Pencil, ReceiptText, UserRound, Loader2 } from 'lucide-vue-next'
import type { ColumnDef } from '@tanstack/vue-table'
import { usePelangganDetail, useAturTanggalTagihan } from '../composables/usePelanggan'
import EditSiklusDialog from '../components/EditSiklusDialog.vue'
import GenerateTagihanDialog from '../components/GenerateTagihanDialog.vue'
import { useAuthStore } from '@/stores/auth.store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import DataTable from '@/components/data/DataTable.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { statusLayananEnum, statusPembayaranEnum } from '@/lib/enums'
import type { LayananInternetDetail, Tagihan } from '@/types/models'
import type { ApiErrorResponse } from '@/types/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const pelangganId = Number(route.params.id)
const { data: pelanggan, isLoading, isError } = usePelangganDetail(pelangganId)

const { mutate: simpanTanggalTagihan, isPending: isSavingTanggal } = useAturTanggalTagihan()

// Hanya Admin Keuangan / Super Admin yang boleh kelola tagihan & siklus billing.
const bolehKelolaBilling = authStore.peranAdmin === 'keuangan' || authStore.peranAdmin === 'super_admin'

const generateDialogTerbuka = ref(false)
const tanggalTagihan = ref('20')
const editSiklusLayanan = ref<LayananInternetDetail | null>(null)

watch(
  () => pelanggan.value?.tanggal_tagihan,
  (v) => {
    if (v != null) tanggalTagihan.value = String(v)
  },
  { immediate: true },
)

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

function simpanTanggal() {
  simpanTanggalTagihan(
    { id: pelangganId, tanggalTagihan: Number(tanggalTagihan.value) },
    {
      onSuccess: () => {
        toast.success('Tanggal penagihan berhasil diubah.')
      },
      onError: (e: Error) => {
        const pesan = e instanceof AxiosError ? (e.response?.data as ApiErrorResponse | undefined)?.message : undefined
        toast.error(pesan ?? 'Gagal mengubah tanggal penagihan.')
      },
    },
  )
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

      <!-- ===== Baris 1: Profil + Billing ===== -->
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Card 1: Profil Pelanggan & Status Layanan -->
        <Card class="lg:col-span-2">
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

        <!-- Card 2: Informasi Billing & Siklus -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2"><CalendarClock class="size-4" /> Billing &amp; Siklus</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <p class="text-xs font-medium text-foreground">Tanggal Tagihan</p>
              <div v-if="bolehKelolaBilling" class="flex items-center gap-2">
                <Select v-model="tanggalTagihan" :disabled="isSavingTanggal">
                  <SelectTrigger class="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="hari in 31" :key="hari" :value="String(hari)">{{ hari }}</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  :disabled="isSavingTanggal || Number(tanggalTagihan) === pelanggan.tanggal_tagihan"
                  @click="simpanTanggal"
                >
                  <Loader2 v-if="isSavingTanggal" class="mr-2 size-3 animate-spin" />
                  {{ isSavingTanggal ? 'Menyimpan' : 'Simpan' }}
                </Button>
              </div>
              <p v-else class="font-medium">{{ pelanggan.tanggal_tagihan ?? 20 }}</p>
              <p class="text-xs text-muted-foreground">Hari jatuh tempo tagihan tiap bulan.</p>
            </div>

            <Separator />

            <div v-if="!layananList.length" class="text-sm text-muted-foreground">Belum ada layanan.</div>
            <div v-else class="space-y-4">
              <div v-for="l in layananList" :key="l.id" class="space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <p class="text-sm font-medium font-mono">{{ l.nomor_layanan }}</p>
                  <Button v-if="bolehKelolaBilling" size="sm" variant="outline" @click="editSiklusLayanan = l">
                    <Pencil class="mr-2 size-3" /> Edit Siklus
                  </Button>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <p class="text-xs text-muted-foreground">Bebas Tagihan</p>
                    <p class="font-medium">{{ l.bebas_tagihan_bulan ?? 0 }} bulan</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground">Mulai Penagihan</p>
                    <p class="font-medium">{{ formatTanggal(l.tanggal_mulai_penagihan) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- ===== Card 3: Daftar Tagihan ===== -->
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

    <!-- ===== Dialog Edit Siklus ===== -->
    <EditSiklusDialog
      :open="!!editSiklusLayanan"
      :layanan="editSiklusLayanan"
      @update:open="(v) => !v && (editSiklusLayanan = null)"
      @saved="editSiklusLayanan = null"
    />

    <!-- ===== Dialog Generate Tagihan ===== -->
    <GenerateTagihanDialog
      :open="generateDialogTerbuka"
      :pelanggan="pelanggan ?? null"
      @update:open="(v) => (generateDialogTerbuka = v)"
      @saved="generateDialogTerbuka = false"
    />
  </div>
</template>