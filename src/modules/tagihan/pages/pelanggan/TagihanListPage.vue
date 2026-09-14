<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/types/api'
import type { Tagihan } from '@/types/models'
import {
  useTagihanSayaList,
  useDeposit,
  useBayarTagihan,
  useRiwayatPembayaran,
  useRegenerateInvoice,
} from '../../composables/useKeuanganTagihan'
import EmptyState from '@/components/data/EmptyState.vue'
import Pagination from '@/components/data/Pagination.vue'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import ConfirmDialog from '@/components/feedback/ConfirmDialog.vue'
import { toast } from 'vue-sonner'
import { ExternalLink, Wifi, AlertTriangle, Layers } from 'lucide-vue-next'

const { data: hasil, isLoading } = useTagihanSayaList()
const { data: deposit } = useDeposit()
const { bayarGabungan } = useBayarTagihan()
const { data: riwayat } = useRiwayatPembayaran()
const { mutateAsync: gantiInvoice, isPending: isMenggantiInvoice } = useRegenerateInvoice()

const tagihanLista = computed(() => hasil.value?.data ?? [])
const riwayatLista = computed(() => riwayat.value?.data ?? [])

// ----- Mode tampilan: default daftar sederhana, mode "Bayar Beberapa" opsional -----
const modeBeberapa = ref(false)

function mulaiBayarBeberapa() {
  modeBeberapa.value = true
}

function batalkanPilihan() {
  terpilih.value = []
  modeBeberapa.value = false
}

// ----- Seleksi beberapa tagihan -----
const terpilih = ref<number[]>([])
const jumlahDibayar = ref('')
const pakaiDeposit = ref(false)
const tagihanUntukGanti = ref<Tagihan | null>(null)

function sisaTagihan(t: Tagihan) {
  return Number(t.sisa_tagihan ?? t.total_tagihan)
}

function isPayable(t: Tagihan) {
  return t.status_pembayaran === 'belum_bayar' && sisaTagihan(t) > 0
}

function alasanTidakPayable(t: Tagihan) {
  if (t.status_pembayaran === 'sudah_bayar') return 'Sudah dibayar'
  if (t.status_pembayaran === 'belum_diterbitkan') return 'Belum diterbitkan'
  if (t.status_pembayaran === 'kedaluwarsa') return 'Kedaluwarsa'
  return ''
}

// ----- Pembayaran yang belum selesai (dicari lewat riwayat pembayaran) -----
const pendingAktif = computed(() =>
  riwayatLista.value.filter(
    (p) =>
      p.status === 'pending' &&
      !!p.payment_url &&
      Array.isArray(p.tagihan_terpilih) &&
      p.tagihan_terpilih.length > 0,
  ),
)

function pendingUntuk(t: Tagihan) {
  return pendingAktif.value.find((p) => (p.tagihan_terpilih ?? []).includes(t.id))
}

const idPending = computed(() => new Set(pendingAktif.value.flatMap((p) => p.tagihan_terpilih ?? [])))

// ----- Ringkasan -----
const totalBelumDibayar = computed(() =>
  tagihanLista.value.reduce((total, t) => total + (isPayable(t) ? sisaTagihan(t) : 0), 0),
)

const saldoKredit = computed(() => Number(deposit.value?.saldo_deposit ?? 0))

// ----- Yang boleh dipilih untuk pembayaran gabungan -----
function bisaDipilihMulti(t: Tagihan) {
  return isPayable(t) && !idPending.value.has(t.id)
}

const tagihanBisaDipilihMulti = computed(() => tagihanLista.value.filter(bisaDipilihMulti))
const jumlahBisaDipilihMulti = computed(() => tagihanBisaDipilihMulti.value.length)
const tagihanTidakBisaDipilih = computed(() => tagihanLista.value.length - jumlahBisaDipilihMulti.value)

const totalSisaTerpilih = computed(() =>
  tagihanLista.value
    .filter((t) => terpilih.value.includes(t.id))
    .reduce((total, t) => total + sisaTagihan(t), 0),
)

watch(
  tagihanLista,
  (list) => {
    const ids = new Set(list.map((t) => t.id))
    const saring = terpilih.value.filter((id) => ids.has(id))
    if (saring.length !== terpilih.value.length) terpilih.value = saring
  },
)

watch(
  terpilih,
  () => {
    jumlahDibayar.value = totalSisaTerpilih.value > 0 ? String(totalSisaTerpilih.value) : ''
  },
  { immediate: true },
)

function toggleSatu(t: Tagihan, checked: boolean) {
  if (!bisaDipilihMulti(t)) return
  if (checked) {
    if (!terpilih.value.includes(t.id)) terpilih.value = [...terpilih.value, t.id]
  } else {
    terpilih.value = terpilih.value.filter((id) => id !== t.id)
  }
}

// ----- Pilih semua (hanya tagihan yang memang bisa dibayar) -----
const semuaTerpilih = computed(() =>
  jumlahBisaDipilihMulti.value > 0 && tagihanBisaDipilihMulti.value.every((t) => terpilih.value.includes(t.id)),
)

const sebagianTerpilih = computed(() => {
  const ada = tagihanBisaDipilihMulti.value.some((t) => terpilih.value.includes(t.id))
  return ada && !semuaTerpilih.value
})

const checkedSemua = computed<boolean | 'indeterminate'>(() => {
  if (semuaTerpilih.value) return true
  if (sebagianTerpilih.value) return 'indeterminate'
  return false
})

function toggleSemua(checked: boolean) {
  terpilih.value = checked ? tagihanBisaDipilihMulti.value.map((t) => t.id) : []
}

// ----- Pengelompokan per layanan internet -----
interface KelompokLayanan {
  layananId: number
  namaLayanan: string
  kecepatanMbps?: number
  nomorLayanan?: string
  alamat?: string
  tagihan: Tagihan[]
}

const kelompoks = computed<KelompokLayanan[]>(() => {
  const peta = new Map<number, KelompokLayanan>()

  for (const t of tagihanLista.value) {
    const l = t.layanan_internet
    let k = peta.get(t.layanan_internet_id)

    if (!k) {
      const nama =
        l?.nama_paket_custom ||
        l?.paket_internet?.nama_paket ||
        t.nama_paket_snapshot
      const kecepatan =
        l?.kecepatan_custom_mbps ??
        l?.paket_internet?.kecepatan_mbps ??
        t.kecepatan_snapshot_mbps

      k = {
        layananId: t.layanan_internet_id,
        namaLayanan: nama,
        kecepatanMbps: kecepatan != null ? kecepatan : undefined,
        nomorLayanan: l?.nomor_layanan,
        alamat: l?.alamat_pemasangan,
        tagihan: [],
      }
      peta.set(t.layanan_internet_id, k)
    }

    k.tagihan.push(t)
  }

  return [...peta.values()]
})

function tagihanBisaDipilihKelompok(k: KelompokLayanan) {
  return k.tagihan.filter(bisaDipilihMulti)
}

function semuaKelompok(k: KelompokLayanan) {
  const bisa = tagihanBisaDipilihKelompok(k)
  return bisa.length > 0 && bisa.every((t) => terpilih.value.includes(t.id))
}

function sebagianKelompok(k: KelompokLayanan) {
  const bisa = tagihanBisaDipilihKelompok(k)
  const ada = bisa.some((t) => terpilih.value.includes(t.id))
  return ada && !semuaKelompok(k)
}

function checkedKelompok(k: KelompokLayanan): boolean | 'indeterminate' {
  if (semuaKelompok(k)) return true
  if (sebagianKelompok(k)) return 'indeterminate'
  return false
}

function toggleKelompok(k: KelompokLayanan) {
  const ids = tagihanBisaDipilihKelompok(k).map((t) => t.id)

  if (ids.every((id) => terpilih.value.includes(id))) {
    terpilih.value = terpilih.value.filter((id) => !ids.includes(id))
  } else {
    terpilih.value = [...new Set([...terpilih.value, ...ids])]
  }
}

// ----- Bayar gabungan -----
const jumlahDibayarValid = computed(() => {
  if (jumlahDibayar.value.trim() === '') return true
  const n = Number(jumlahDibayar.value)
  return Number.isFinite(n) && n > 0
})

const isPendingBayar = computed(() => bayarGabungan.isPending.value)

async function bayarGabunganSegera() {
  if (terpilih.value.length === 0) {
    toast.warning('Pilih minimal satu tagihan yang mau dibayar')
    return
  }

  const jumlah = jumlahDibayar.value.trim() === '' ? totalSisaTerpilih.value : Number(jumlahDibayar.value)

  try {
    const hasilBayar = await bayarGabungan.mutateAsync({
      jumlahDibayar: jumlah > 0 ? jumlah : totalSisaTerpilih.value,
      tagihanIds: terpilih.value,
      gunakanDeposit: pakaiDeposit.value,
    })
    const url = hasilBayar.payment_url
    batalkanPilihan()
    toast.success('Invoice dibuat. Selesaikan pembayaran di jendela yang baru terbuka')
    if (url) bukaHalamanBayar(url)
  } catch (e: unknown) {
    toast.error(pesanError(e) ?? 'Gagal membuat pembayaran')
  }
}

// ----- Buat pembayaran baru (menggantikan pembayaran yang belum selesai) -----
async function konfirmasiGantiInvoice() {
  if (!tagihanUntukGanti.value) return
  const t = tagihanUntukGanti.value

  try {
    await gantiInvoice(t.id)
    tagihanUntukGanti.value = null
    toast.success('Pembayaran baru berhasil dibuat')
  } catch (e: unknown) {
    toast.error(pesanError(e) ?? 'Gagal membuat pembayaran baru')
  }
}

// ----- Format helpers -----
const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function teksPeriode(t: Tagihan) {
  const awal = `${NAMA_BULAN[t.periode_bulan - 1]} ${t.periode_tahun}`
  const aB = t.periode_akhir_bulan
  const aT = t.periode_akhir_tahun
  if (aB !== undefined && aT !== undefined && (aB !== t.periode_bulan || aT !== t.periode_tahun)) {
    return `${awal} – ${NAMA_BULAN[aB - 1]} ${aT}`
  }
  return awal
}

function teksStatus(t: Tagihan) {
  if (pendingUntuk(t)) return 'Pembayaran belum selesai'
  if (isPayable(t)) return 'Belum dibayar'
  return alasanTidakPayable(t)
}

function formatRupiah(nilai: string | number | null | undefined) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number(nilai ?? 0),
  )
}

function bukaHalamanBayar(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

function pesanError(e: unknown) {
  const data = e instanceof AxiosError ? (e.response?.data as ApiErrorResponse | undefined) : undefined
  return data?.message
}
</script>

<template>
  <div class="space-y-5">
    <h1 class="text-xl font-semibold">Tagihan Saya</h1>

    <!-- Ringkasan -->
    <Card v-if="tagihanLista.length" class="rounded-xl border shadow-none">
      <CardContent class="p-5 text-primary-foreground" :class="totalBelumDibayar > 0 ? 'bg-primary' : 'bg-background'">
        <template v-if="totalBelumDibayar > 0">
          <p class="text-sm" :class="totalBelumDibayar > 0 ? 'text-primary-foreground/80' : 'text-muted-foreground'">
            Total belum dibayar
          </p>
          <p class="mt-1 text-3xl font-semibold tabular-nums">{{ formatRupiah(totalBelumDibayar) }}</p>
          <p v-if="saldoKredit > 0" class="mt-2 text-sm text-primary-foreground/80">
            Saldo kredit: {{ formatRupiah(saldoKredit) }}
          </p>
        </template>
        <template v-else>
          <p class="text-sm text-muted-foreground">Semua tagihan sudah dibayar.</p>
          <p v-if="saldoKredit > 0" class="mt-1 text-sm text-muted-foreground">
            Saldo kredit: {{ formatRupiah(saldoKredit) }}
          </p>
        </template>
      </CardContent>
    </Card>

    <div v-if="isLoading" class="space-y-3">
      <Skeleton class="h-20 w-full" />
      <Skeleton class="h-20 w-full" />
    </div>

    <EmptyState
      v-else-if="!tagihanLista.length"
      judul="Belum ada tagihan"
      deskripsi="Tagihan akan muncul di sini setelah diterbitkan."
    />

    <template v-else>
      <!-- ================= Mode biasa: satu tagihan satu tombol bayar ================= -->
      <template v-if="!modeBeberapa">
        <Card v-for="k in kelompoks" :key="k.layananId" class="rounded-xl border shadow-none">
          <CardContent class="p-5">
            <div class="mb-2 flex items-start gap-2.5">
              <Wifi class="mt-0.5 size-4 shrink-0 text-primary" />
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold">
                  {{ k.namaLayanan }}<template v-if="k.kecepatanMbps"> · {{ k.kecepatanMbps }} Mbps</template>
                </p>
                <p class="truncate text-xs text-muted-foreground">
                  {{ [k.alamat, k.nomorLayanan ? `Layanan ${k.nomorLayanan}` : ''].filter(Boolean).join(' · ') }}
                </p>
              </div>
            </div>

            <div class="divide-y">
              <div v-for="t in k.tagihan" :key="t.id" class="py-3">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-sm font-medium">{{ teksPeriode(t) }}</p>
                    <p class="mt-0.5 text-lg font-semibold tabular-nums">{{ formatRupiah(sisaTagihan(t)) }}</p>
                  </div>
                  <RouterLink
                    :to="`/pelanggan/tagihan/${t.id}`"
                    class="mt-0.5 shrink-0 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  >
                    Detail
                  </RouterLink>
                </div>

                <p
                  v-if="pendingUntuk(t)"
                  class="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-700"
                >
                  <AlertTriangle class="size-3.5" />
                  Pembayaran belum selesai
                </p>
                <p v-else-if="isPayable(t)" class="mt-1.5 text-xs text-muted-foreground">Belum dibayar</p>
                <p v-else class="mt-1.5 text-xs text-muted-foreground">{{ alasanTidakPayable(t) }}</p>

                <div v-if="pendingUntuk(t)" class="mt-3 grid gap-1.5">
                  <Button
                    variant="outline"
                    class="w-full"
                    @click="pendingUntuk(t)!.payment_url ? bukaHalamanBayar(pendingUntuk(t)!.payment_url!) : undefined"
                  >
                    <ExternalLink class="mr-2 size-4" />
                    Lanjutkan Pembayaran
                  </Button>
                  <button
                    type="button"
                    class="text-xs font-medium text-primary underline underline-offset-2"
                    @click="tagihanUntukGanti = t"
                  >
                    Buat pembayaran baru
                  </button>
                </div>
                <Button
                  v-else-if="isPayable(t)"
                  class="mt-3 w-full"
                  :as="RouterLink"
                  :to="`/pelanggan/tagihan/${t.id}`"
                >
                  Bayar {{ formatRupiah(sisaTagihan(t)) }}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          v-if="jumlahBisaDipilihMulti >= 2"
          size="lg"
          variant="outline"
          class="w-full"
          @click="mulaiBayarBeberapa"
        >
          <Layers class="mr-2 size-4" />
          Bayar Beberapa Tagihan
        </Button>
      </template>

      <!-- ================= Mode "Bayar Beberapa Tagihan" ================= -->
      <template v-else>
        <Card class="rounded-xl border shadow-none">
          <CardContent class="p-5">
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm font-medium">Pilih tagihan yang ingin dibayar</p>
              <button
                type="button"
                class="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
                @click="batalkanPilihan"
              >
                Batalkan
              </button>
            </div>

            <p v-if="!jumlahBisaDipilihMulti" class="mt-4 text-sm text-muted-foreground">
              Tidak ada tagihan yang bisa dipilih saat ini.
            </p>

            <div v-for="k in kelompoks" v-else :key="k.layananId" class="mt-4">
              <div class="mb-1 flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2">
                <div class="flex min-w-0 items-center gap-2">
                  <Wifi class="size-4 shrink-0 text-primary" />
                  <p class="truncate text-sm font-medium">
                    {{ k.namaLayanan }}<template v-if="k.kecepatanMbps"> · {{ k.kecepatanMbps }} Mbps</template>
                  </p>
                </div>
                <Checkbox
                  v-if="tagihanBisaDipilihKelompok(k).length"
                  :checked="checkedKelompok(k)"
                  :aria-label="`Pilih semua tagihan yang bisa dibayar pada layanan ${k.namaLayanan}`"
                  @update:checked="() => toggleKelompok(k)"
                />
              </div>

              <div class="divide-y">
                <label
                  v-for="t in k.tagihan"
                  :key="t.id"
                  class="flex cursor-pointer items-center gap-3 py-3"
                  :class="bisaDipilihMulti(t) ? '' : 'cursor-not-allowed opacity-50'"
                >
                  <Checkbox
                    :checked="terpilih.includes(t.id)"
                    :disabled="!bisaDipilihMulti(t)"
                    :aria-label="`Pilih tagihan periode ${teksPeriode(t)}`"
                    @update:checked="(c: boolean) => toggleSatu(t, c)"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium">{{ teksPeriode(t) }}</p>
                    <p class="truncate text-xs text-muted-foreground">{{ teksStatus(t) }}</p>
                  </div>
                  <span class="shrink-0 text-sm font-semibold tabular-nums">{{ formatRupiah(sisaTagihan(t)) }}</span>
                </label>
              </div>
            </div>

            <label class="mt-4 flex cursor-pointer items-center gap-2 text-sm" :class="jumlahBisaDipilihMulti ? '' : 'cursor-not-allowed opacity-50'">
              <Checkbox
                :checked="checkedSemua"
                :disabled="!jumlahBisaDipilihMulti"
                aria-label="Pilih semua tagihan yang bisa dibayar"
                @update:checked="toggleSemua"
              />
              <span>Pilih Semua</span>
            </label>
            <p v-if="tagihanTidakBisaDipilih > 0" class="mt-2 text-xs text-muted-foreground">
              {{ tagihanTidakBisaDipilih }} tagihan tidak bisa dipilih — sudah dibayar, belum diterbitkan, atau
              pembayarannya belum selesai.
            </p>
          </CardContent>
        </Card>

        <!-- Ringkasan pembayaran tetap terlihat -->
        <div
          class="sticky bottom-4 z-20 rounded-xl border border-primary/30 bg-background p-4 shadow-lg"
        >
          <div v-if="terpilih.length" class="space-y-3">
            <div class="flex items-center justify-between gap-2">
              <p class="font-medium">
                {{ terpilih.length }} tagihan dipilih
              </p>
              <button
                type="button"
                class="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
                @click="terpilih = []"
              >
                Kosongkan pilihan
              </button>
            </div>

            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Total sisa</span>
              <span class="font-semibold tabular-nums">{{ formatRupiah(totalSisaTerpilih) }}</span>
            </div>

            <div class="grid gap-1.5">
              <Label for="jumlah-bayar-gabungan">Jumlah yang ingin dibayar</Label>
              <Input
                id="jumlah-bayar-gabungan"
                v-model="jumlahDibayar"
                type="number"
                min="1"
                :placeholder="String(totalSisaTerpilih)"
              />
            </div>

            <p class="text-xs text-muted-foreground">
              <template v-if="jumlahDibayar !== '' && Number(jumlahDibayar) < totalSisaTerpilih">
                Pembayaran sebagian. Sisa tagihan tetap harus dibayar.
              </template>
              <template v-else-if="jumlahDibayar !== '' && Number(jumlahDibayar) > totalSisaTerpilih">
                Pembayaran lebih dari total sisa akan menjadi saldo kredit.
              </template>
              <template v-else>
                Tagihan akan lunas setelah pembayaran berhasil.
              </template>
            </p>

            <label v-if="saldoKredit > 0" class="flex items-center gap-2 text-sm">
              <Checkbox v-model="pakaiDeposit" aria-label="Gunakan saldo kredit" />
              <span>
                Gunakan saldo kredit ({{ formatRupiah(saldoKredit) }})
              </span>
            </label>

            <Button class="w-full" :disabled="isPendingBayar || !jumlahDibayarValid" @click="bayarGabunganSegera">
              <ExternalLink class="mr-2 size-4" />
              Bayar {{ formatRupiah(jumlahDibayar === '' ? totalSisaTerpilih : Number(jumlahDibayar) || totalSisaTerpilih) }}
            </Button>
          </div>

          <p v-else class="text-sm text-muted-foreground">Pilih setidaknya satu tagihan untuk melanjutkan.</p>
        </div>
      </template>
    </template>

    <Pagination v-if="hasil && hasil.last_page > 1" :meta="hasil" />

    <ConfirmDialog
      :open="!!tagihanUntukGanti"
      judul="Buat pembayaran baru?"
      deskripsi="Pembayaran sebelumnya akan digantikan dengan pembayaran baru."
      label-konfirmasi="Buat Pembayaran Baru"
      label-batal="Batal"
      :loading="isMenggantiInvoice"
      @update:open="(v: boolean) => !v && (tagihanUntukGanti = null)"
      @confirm="konfirmasiGantiInvoice"
    />
  </div>
</template>