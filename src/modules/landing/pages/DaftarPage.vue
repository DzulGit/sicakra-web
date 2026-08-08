<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import {
  CheckCircle2, ChevronLeft, ChevronRight, MapPin,
  Package, User, ShoppingCart, FileText, FileImage,
  Monitor, Settings, Tv, CreditCard, Info, ArrowLeft, ArrowRight
} from 'lucide-vue-next'
import { daftarSchema } from '@/schemas/pendaftaran.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useDaftar } from '@/modules/pendaftaran/composables/usePendaftaran'
import { usePaketInternetList } from '@/modules/paket-internet/composables/usePaketInternet'
import FileInputFoto from '@/modules/pendaftaran/components/FileInputFoto.vue'
import LocationPicker from '@/modules/pendaftaran/components/PemilihanLokasi.vue'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import type { PaketInternet } from '@/types/models'

const route = useRoute()
const router = useRouter()
const { data: daftarPaket } = usePaketInternetList()

const currentStep = ref(1)
const selectedPaket = ref<PaketInternet | null>(null)
const isModalOpen = ref(false)
const setujuKirim = ref(false)

// ponytail: banner images as placeholder, swap with real promos later
const banners = [
  { id: 1, image: 'banner1.png', title: 'Promo Kemerdekaan' },
  { id: 2, image: 'banner2.png', title: 'Gratis Biaya Pasang' },
  { id: 3, image: 'banner3.png', title: 'Diskon Up To 50%' },
]
const bannerAktif = ref(0)
let bannerTimer: ReturnType<typeof setInterval> | null = null

function mulaiBanner() {
  bannerTimer = setInterval(() => {
    bannerAktif.value = (bannerAktif.value + 1) % banners.length
  }, 3000)
}
function pindahBanner(i: number) {
  bannerAktif.value = i
  clearInterval(bannerTimer!)
  mulaiBanner()
}
onMounted(mulaiBanner)
onBeforeUnmount(() => bannerTimer && clearInterval(bannerTimer))

// Filter
const filterHarga = ref<string[]>([])
const filterKecepatan = ref<string[]>([])
const filterPerangkat = ref<string[]>([])

const paketFiltered = computed(() => {
  const raw = daftarPaket?.value
  // 1. Ganti any[] menjadi PaketInternet[]
  let all: PaketInternet[] = []

  if (Array.isArray(raw)) {
    all = raw as PaketInternet[]
  } else if (
    raw &&
    typeof raw === 'object' &&
    'data' in raw &&
    // 2. Ganti (raw as any) menjadi (raw as { data: unknown })
    Array.isArray((raw as { data: unknown }).data)
  ) {
    // 3. Ganti (raw as any) menjadi (raw as { data: PaketInternet[] })
    all = (raw as { data: PaketInternet[] }).data
  }

  // 4. Ganti (p: any) menjadi (p: PaketInternet)
  return all.filter((p: PaketInternet) => {
    const harga = Number(p.harga)
    let passHarga = true
    if (filterHarga.value.length > 0) {
      passHarga = filterHarga.value.some((r) => {
        if (r === '>1000000') return harga > 1000000
        if (r === '500000-999999') return harga >= 500000 && harga <= 999999
        if (r === '100000-499999') return harga >= 100000 && harga <= 499999
        return false
      })
    }

    const kec = Number(p.kecepatan_mbps)
    let passKec = true
    if (filterKecepatan.value.length > 0) {
      passKec = filterKecepatan.value.some((r) => {
        if (r === '>200') return kec > 200
        if (r === '50-100') return kec >= 50 && kec <= 100
        if (r === '20-50') return kec >= 20 && kec <= 50
        if (r === '10-20') return kec >= 10 && kec <= 20
        return false
      })
    }

    const perangkat = Number(p.jumlah_perangkat)
    let passPerangkat = true
    if (filterPerangkat.value.length > 0) {
      passPerangkat = filterPerangkat.value.some((r) => {
        if (r === '1-20') return perangkat >= 1 && perangkat <= 10
        if (r === '20-50') return perangkat >= 10 && perangkat <= 20
        if (r === '50+') return perangkat > 50
        return false
      })
    }

    return passHarga && passKec && passPerangkat
  })
})

// Pagination
const PER_PAGE = 4
const halaman = ref(0)
const totalHalaman = computed(() => Math.max(1, Math.ceil(paketFiltered.value.length / PER_PAGE)))
const paketDiHalaman = computed(() => {
  const start = halaman.value * PER_PAGE
  return paketFiltered.value.slice(start, start + PER_PAGE)
})
watch(paketFiltered, () => { halaman.value = 0 })
watch(filterHarga, () => { halaman.value = 0 }, { deep: true })
watch(filterKecepatan, () => { halaman.value = 0 }, { deep: true })
watch(filterPerangkat, () => { halaman.value = 0 }, { deep: true })

function pilihPaket(paket: PaketInternet) {
  selectedPaket.value = paket
  isModalOpen.value = true
}

// Form
const { handleSubmit, errors, defineField, setErrors, setFieldValue } = useForm({
  validationSchema: toTypedSchema(daftarSchema),
  initialValues: {
    tipe_paket: 'reguler',
    paket_internet_id: typeof route.query.paket_internet_id === 'string' ? route.query.paket_internet_id : undefined,

  },
})

const [namaLengkap, namaLengkapAttrs] = defineField('nama_lengkap')
const [nik, nikAttrs] = defineField('nik')
const [nomorHp, nomorHpAttrs] = defineField('nomor_hp')
const [email, emailAttrs] = defineField('email')
const [alamatPemasangan, alamatPemasanganAttrs] = defineField('alamat_pemasangan')
const [detailAlamat, detailAlamatAttrs] = defineField('detail_alamat')

const fotoKtp = ref<File | null>(null)
const fotoSelfieKtp = ref<File | null>(null)
const lokasiPeta = ref<{ lat: number; lng: number; address?: string } | null>(null)

watch(fotoKtp, (f) => setFieldValue('foto_ktp', f ?? undefined))
watch(fotoSelfieKtp, (f) => setFieldValue('foto_selfie_ktp', f ?? undefined))
watch(lokasiPeta, (l) => {
  setFieldValue('latitude', l?.lat)
  setFieldValue('longitude', l?.lng)
  if (l?.address) setFieldValue('alamat_pemasangan', l.address)
})

const { mutate, isPending } = useDaftar()
const nomorPermohonanBerhasil = ref<string | null>(null)

function lanjutKeLokasi() {
  setFieldValue('tipe_paket', 'reguler')
  setFieldValue('paket_internet_id', String(selectedPaket.value!.id))
  isModalOpen.value = false
  currentStep.value = 2
}
function lanjutKeDataDiri() {
  if (!lokasiPeta.value) return
  currentStep.value = 3
}
function lanjutKeReview() { currentStep.value = 4 }

const onSubmit = handleSubmit((fv) => {
  mutate(
    { ...fv, foto_ktp: fotoKtp.value as File, foto_selfie_ktp: fotoSelfieKtp.value ?? undefined },
    {
      onSuccess: ({ data }) => { nomorPermohonanBerhasil.value = data.data.nomor_permohonan; currentStep.value = 5 },
      onError: (e) => { const fe = mapValidationErrors(e); if (fe) setErrors(fe) },
    },
  )
})

const ringkasan = computed(() => {
  let paketText = '-'
  let hargaText = '-'

  if (tipePaket.value === 'reguler' && selectedPaket.value) {
    paketText = `${selectedPaket.value.nama_paket} — ${selectedPaket.value.kecepatan_mbps} Mbps`
    hargaText = `Rp ${Number(selectedPaket.value.harga).toLocaleString('id-ID')}/bln`
  } else if (tipePaket.value === 'custom') {
    paketText = `Custom: ${namaPaketCustom.value || '-'} — ${kecepatanCustomMbps.value || '?'} Mbps`
    hargaText = 'Menunggu Negosiasi/Survey'
  }

  return {
    paket: paketText,
    harga: hargaText,
    alamat: alamatPemasangan.value || '-',
    nama: namaLengkap.value || '-',
    nik: nik.value || '-',
    email: email.value || '-',
    hp: nomorHp.value || '-',
    fotoKtp: fotoKtp.value?.name,
    fotoSelfie: fotoSelfieKtp.value?.name,
  }
})

const steps = [
  { id: 1, label: 'Pilih Paket', icon: Package },
  { id: 2, label: 'Atur Lokasi', icon: MapPin },
  { id: 3, label: 'Data Diri', icon: User },
  { id: 4, label: 'Review', icon: FileText },
  { id: 5, label: 'Selesai', icon: CheckCircle2 },
]

const [tipePaket] = defineField('tipe_paket')
const [namaPaketCustom, namaPaketCustomAttrs] = defineField('nama_paket_custom')
const [kecepatanCustomMbps, kecepatanCustomMbpsAttrs] = defineField('kecepatan_custom_mbps')
const [catatanCustom, catatanCustomAttrs] = defineField('catatan_custom')

const isModalCustomOpen = ref(false)

function pilihPaketCustom() {
  isModalCustomOpen.value = true
}

function lanjutDariCustom() {
  setFieldValue('tipe_paket', 'custom')
  setFieldValue('paket_internet_id', undefined)
  isModalCustomOpen.value = false
  currentStep.value = 2
}
</script>

<template>
  <div class="min-h-screen bg-landing-mist pb-20">
    <!-- Progress Stepper -->
    <div class="sticky top-0 z-30 border-b bg-white/95 backdrop-blur-sm">
      <div class="mx-auto flex max-w-7xl items-center gap-1 px-4 py-3 sm:gap-2 sm:px-6">
        <template v-for="(s, i) in steps" :key="s.id">
          <div class="flex items-center gap-1.5 text-xs sm:text-sm"
            :class="currentStep === s.id ? 'font-bold text-landing-teal' : currentStep > s.id ? 'text-green-600' : 'text-slate-300'">
            <component :is="s.icon" class="size-4" />
            <span class="hidden sm:inline">{{ s.label }}</span>
          </div>
          <ChevronRight v-if="i < steps.length - 1" class="size-3.5 text-slate-300" />
        </template>
        <button class="ml-auto text-xs text-slate-400 hover:text-slate-600" @click="currentStep = 1">Ulang</button>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
      <!-- STEP 1: Pilih Paket -->
      <div v-if="currentStep === 1">
        <!-- Banner 2:1 -->
        <div class="relative mb-6 overflow-hidden rounded-2xl">
          <div class="flex transition-transform duration-500 ease-in-out"
            :style="{ transform: `translateX(-${bannerAktif * 100}%)` }">
            <div v-for="b in banners" :key="b.id" class="w-full shrink-0">
              <img :src="b.image" :alt="b.title" class="aspect-[2/1] w-full object-cover" />
              <div class="absolute inset-0 flex items-end bg-gradient-to-t from-black/40 to-transparent p-6 sm:p-10">
                <h3 class="text-xl font-bold text-white sm:text-3xl">{{ b.title }}</h3>
              </div>
            </div>
          </div>
          <div class="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            <button v-for="(b, i) in banners" :key="b.id" class="size-2.5 rounded-full transition-colors"
              :class="i === bannerAktif ? 'bg-white' : 'bg-white/40'" @click="pindahBanner(i)" />
          </div>
        </div>

        <div class="flex flex-col gap-6 lg:flex-row lg:items-stretch">
          <!-- Filter sidebar -->
          <div class="w-full shrink-0 lg:w-64">
            <div class="rounded-xl border bg-white p-5 shadow-sm">
              <h3 class="mb-4 font-bold text-sm">Filter Paket</h3>
              <div class="space-y-5">
                <div>
                  <h4 class="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Harga</h4>
                  <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm cursor-pointer"
                      v-for="[v, l] in [['100000-499999', 'Rp100.000 – Rp499.999'], ['500000-999999', 'Rp500.000 – Rp999.999'], ['>1000000', '> Rp1.000.000']]"
                      :key="v">
                      <input type="checkbox" :value="v" v-model="filterHarga"
                        class="size-4 cursor-pointer accent-landing-teal" />
                      {{ l }}
                    </label>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 class="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kecepatan</h4>
                  <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm cursor-pointer"
                      v-for="[v, l] in [['10-20', '10 – 20 Mbps'], ['20-50', '20 – 50 Mbps'], ['50-100', '50 – 100 Mbps'], ['>200', '> 200 Mbps']]"
                      :key="v">
                      <input type="checkbox" :value="v" v-model="filterKecepatan"
                        class="size-4 cursor-pointer accent-landing-teal" />
                      {{ l }}
                    </label>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 class="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Perangkat</h4>
                  <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm cursor-pointer"
                      v-for="[v, l] in [['1-20', '1 – 20 Perangkat'], ['20-50', '20 – 50 Perangkat'], ['50+', '> 50 Perangkat']]"
                      :key="v">
                      <input type="checkbox" :value="v" v-model="filterPerangkat"
                        class="size-4 cursor-pointer accent-landing-teal" />
                      {{ l }}
                    </label>
                  </div>
                </div>
                <Button variant="outline" size="sm" class="w-full text-xs mt-4"
                  @click="filterHarga = []; filterKecepatan = []; filterPerangkat = []; halaman = 0">Reset Filter</Button>
              </div>
            </div>
          </div>

          <!-- Paket grid -->
          <div class="flex flex-1 flex-col gap-6">
            <!-- Content fills height to match filter sidebar -->
            <div class="flex-1">
              <!-- Empty state — full height, centered flush with filter bottom -->
              <div v-if="paketFiltered.length === 0"
                class="flex h-full flex-col items-center justify-center gap-2 rounded-xl border bg-white text-sm text-slate-400">
                <ShoppingCart class="size-8" /> Tidak ada paket yang cocok dengan filter
              </div>

              <!-- Cards + pagination -->
              <template v-else>
                <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  <div v-for="paket in paketDiHalaman" :key="paket.id"
                    class="flex flex-col rounded-2xl border bg-white transition-all hover:shadow-md"
                    :class="selectedPaket?.id === paket.id ? 'border-landing-teal ring-2 ring-landing-teal/20' : 'border-slate-200'">
                    <div class="flex flex-1 flex-col p-5">
                      <h3 class="font-bold text-landing-ink">{{ paket.nama_paket }}</h3>
                      <p class="mt-1 text-3xl font-bold text-landing-teal">{{ paket.kecepatan_mbps }} <span
                          class="text-sm font-medium">Mbps</span></p>
                      <div class="mt-4 space-y-1.5 text-xs text-slate-500">
                        <div class="flex items-center gap-1.5">
                          <Monitor class="size-3.5" /> {{ paket.jumlah_perangkat }} Perangkat Terhubung
                        </div>
                        <div class="flex items-center gap-1.5">
                          <Settings class="size-3.5" /> Biaya Pasang Gratis
                        </div>
                        <div class="flex items-center gap-1.5">
                          <Tv class="size-3.5" /> Prime Video, Catchplay+
                        </div>
                      </div>
                    </div>
                    <div class="border-t px-5 py-3">
                      <div class="mb-3">
                        <span class="text-xs text-slate-400">Mulai dari</span>
                        <p class="text-xl font-bold text-landing-ink">Rp {{ Number(paket.harga).toLocaleString('id-ID')
                          }}<span class="text-xs font-normal text-slate-400">/bln</span></p>
                      </div>
                      <Button class="w-full py-2.5 text-sm text-white bg-landing-teal hover:bg-landing-teal-deep"
                        @click="pilihPaket(paket)">
                        {{ selectedPaket?.id === paket.id ? 'Lihat Detail' : 'Pilih Paket' }}
                      </Button>
                    </div>
                  </div>
                </div>

                <!-- Pagination -->
                <div v-if="totalHalaman > 1" class="mt-6 flex items-center justify-center gap-3">
                  <Button variant="outline" size="sm" :disabled="halaman === 0" @click="halaman--">
                    <ArrowLeft class="mr-1 size-4" /> Sebelumnya
                  </Button>
                  <span class="text-sm text-slate-500">
                    {{ halaman + 1 }} / {{ totalHalaman }}
                  </span>
                  <Button variant="outline" size="sm" :disabled="halaman >= totalHalaman - 1" @click="halaman++">
                    Selanjutnya
                    <ArrowRight class="ml-1 size-4" />
                  </Button>
                </div>
              </template>
            </div>

            <!-- Banner Paket Custom — always snug at bottom of right column -->
            <div
              class="rounded-2xl border border-landing-teal/30 bg-landing-teal/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 class="text-xl font-bold text-landing-ink">Tidak menemukan paket yang pas?</h3>
                <p class="mt-2 text-sm text-slate-600">Konsultasikan kebutuhan internet khusus untuk bisnis, kantor,
                  atau
                  warnet Anda dengan tim kami. Kecepatan dan harga bisa disesuaikan.</p>
              </div>
              <Button @click="pilihPaketCustom"
                class="shrink-0 bg-landing-teal hover:bg-landing-teal-deep text-white px-6 py-6 rounded-xl shadow-sm">
                Buat Paket Custom
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 2: Lokasi -->
      <div v-if="currentStep === 2" class="mx-auto max-w-3xl">
        <Button variant="ghost" class="mb-4 pl-0" @click="currentStep = 1">
          <ChevronLeft class="mr-1 size-4" /> Kembali
        </Button>
        <div class="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 class="font-bold text-xl mb-1">Atur Lokasi Pemasangan</h2>
          <p class="mb-5 text-sm text-muted-foreground">Klik peta atau gunakan tombol Deteksi Lokasi untuk mengisi
            alamat
            otomatis.</p>
          <div class="mb-5 h-[350px] w-full overflow-hidden rounded-xl border">
            <LocationPicker v-model="lokasiPeta" class="h-full w-full" />
          </div>
          <div class="space-y-2">
            <Label for="alamat_pemasangan">Detail Alamat Lengkap</Label>
            <Textarea id="alamat_pemasangan" v-model="alamatPemasangan" v-bind="alamatPemasanganAttrs"
              placeholder="Otomatis terisi dari peta..." class="min-h-[90px]" />
            <p v-if="errors.alamat_pemasangan" class="text-xs text-destructive">{{ errors.alamat_pemasangan }}</p>
          </div>
          <div class="space-y-2">
            <Label for="detail_alamat">Detail Alamat <span class="text-muted-foreground">(opsional)</span></Label>
            <Textarea id="detail_alamat" v-model="detailAlamat" v-bind="detailAlamatAttrs"
              placeholder="Contoh: RT 03 RW 05, Rumah cat hijau, samping masjid..." class="min-h-[80px]" />
            <p v-if="errors.detail_alamat" class="text-xs text-destructive">{{ errors.detail_alamat }}</p>
          </div>
          <Button @click="lanjutKeDataDiri"
            class="mt-6 w-full py-5 text-white bg-landing-teal hover:bg-landing-teal-deep" :disabled="!lokasiPeta">
            Simpan Alamat & Lanjut
            <ChevronRight class="ml-1 size-4" />
          </Button>
        </div>
      </div>

      <!-- STEP 3: Data Diri -->
      <div v-if="currentStep === 3" class="mx-auto max-w-2xl">
        <Button variant="ghost" class="mb-4 pl-0" @click="currentStep = 2">
          <ChevronLeft class="mr-1 size-4" /> Kembali
        </Button>
        <div class="rounded-2xl border bg-white p-6 sm:p-8 shadow-sm">
          <h2 class="font-bold text-xl mb-6">Data Diri & Dokumen</h2>
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="nama_lengkap">Nama Lengkap</Label>
              <Input id="nama_lengkap" v-model="namaLengkap" v-bind="namaLengkapAttrs"
                :aria-invalid="!!errors.nama_lengkap" />
              <p v-if="errors.nama_lengkap" class="text-xs text-destructive">{{ errors.nama_lengkap }}</p>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label for="nik">NIK</Label>
                <Input id="nik" v-model="nik" v-bind="nikAttrs" maxlength="16" :aria-invalid="!!errors.nik" />
                <p v-if="errors.nik" class="text-xs text-destructive">{{ errors.nik }}</p>
              </div>
              <div class="space-y-2">
                <Label for="nomor_hp">Nomor HP</Label>
                <Input id="nomor_hp" v-model="nomorHp" v-bind="nomorHpAttrs" placeholder="08xxxxxxxxxx"
                  :aria-invalid="!!errors.nomor_hp" />
                <p v-if="errors.nomor_hp" class="text-xs text-destructive">{{ errors.nomor_hp }}</p>
              </div>
            </div>
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input id="email" v-model="email" v-bind="emailAttrs" type="email" :aria-invalid="!!errors.email" />
              <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <FileInputFoto v-model="fotoKtp" label="Foto KTP" :error="errors.foto_ktp" />
              <FileInputFoto v-model="fotoSelfieKtp" label="Foto Selfie dengan KTP" hint="Opsional"
                :error="errors.foto_selfie_ktp" />
            </div>
          </div>
          <Button @click="lanjutKeReview"
            class="mt-8 w-full py-5 text-white bg-landing-teal hover:bg-landing-teal-deep">
            Lanjut ke Review
            <ChevronRight class="ml-1 size-4" />
          </Button>
        </div>
      </div>

      <!-- STEP 4: Review & Kirim -->
      <div v-if="currentStep === 4" class="mx-auto max-w-3xl">
        <Button variant="ghost" class="mb-4 pl-0" @click="currentStep = 3">
          <ChevronLeft class="mr-1 size-4" /> Kembali
        </Button>
        <form novalidate @submit="onSubmit">
          <div class="rounded-2xl border bg-white p-6 sm:p-8 shadow-sm">
            <h2 class="font-bold text-xl mb-6">Review Pendaftaran</h2>
            <p class="mb-6 text-sm text-muted-foreground">Pastikan semua data sudah benar sebelum dikirim.</p>
            <div class="grid gap-6 sm:grid-cols-2">
              <div class="rounded-xl border bg-slate-50/50 p-4">
                <h3 class="mb-3 flex items-center gap-1.5 text-sm font-semibold text-landing-teal">
                  <Package class="size-4" /> Paket Dipilih
                </h3>
                <div class="space-y-1.5 text-sm">
                  <p><span class="text-slate-400">Paket:</span> <span class="font-medium">{{ ringkasan.paket }}</span>
                  </p>
                  <p><span class="text-slate-400">Harga:</span> <span class="font-medium">{{ ringkasan.harga }}</span>
                  </p>
                </div>
              </div>
              <div class="rounded-xl border bg-slate-50/50 p-4">
                <h3 class="mb-3 flex items-center gap-1.5 text-sm font-semibold text-landing-teal">
                  <MapPin class="size-4" /> Alamat Pemasangan
                </h3>
                <p class="text-sm leading-relaxed">{{ ringkasan.alamat }}</p>
              </div>
              <div class="rounded-xl border bg-slate-50/50 p-4">
                <h3 class="mb-3 flex items-center gap-1.5 text-sm font-semibold text-landing-teal">
                  <User class="size-4" /> Data Diri
                </h3>
                <div class="space-y-1.5 text-sm">
                  <p><span class="text-slate-400">Nama:</span> <span class="font-medium">{{ ringkasan.nama }}</span></p>
                  <p><span class="text-slate-400">NIK:</span> <span class="font-medium">{{ ringkasan.nik }}</span></p>
                  <p><span class="text-slate-400">No. HP:</span> <span class="font-medium">{{ ringkasan.hp }}</span></p>
                  <p><span class="text-slate-400">Email:</span> {{ ringkasan.email || '-' }}</p>
                </div>
              </div>
              <div class="rounded-xl border bg-slate-50/50 p-4">
                <h3 class="mb-3 flex items-center gap-1.5 text-sm font-semibold text-landing-teal">
                  <FileImage class="size-4" /> Dokumen
                </h3>
                <div class="space-y-1.5 text-sm">
                  <p><span class="text-slate-400">Foto KTP:</span> <span class="font-medium">{{ ringkasan.fotoKtp || '-'
                      }}</span></p>
                  <p><span class="text-slate-400">Foto Selfie:</span> <span class="font-medium">{{ ringkasan.fotoSelfie
                      ||
                      '-' }}</span></p>
                </div>
              </div>
            </div>
            <Separator class="my-6" />

            <!-- PESAN ERROR BILA FORM TIDAK VALID SAAT DIKLIK -->
            <div v-if="Object.keys(errors).length > 0"
              class="mb-4 rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
              <p class="font-bold mb-1">Pendaftaran tertunda karena data berikut belum lengkap/sesuai:</p>
              <ul class="list-disc pl-5">
                <li v-for="(msg, field) in errors" :key="field">
                  <span class="font-medium capitalize">{{ field.replace('_', ' ') }}</span>: {{ msg }}
                </li>
              </ul>
              <p class="mt-2 text-xs">Silakan tekan tombol <b>Kembali</b> untuk memperbaiki data di atas.</p>
            </div>

            <!-- CHECKBOX MENGGUNAKAN NATIVE HTML AGAR PASTI BISA DI-TOGGLE -->
            <label class="flex cursor-pointer items-start gap-3 rounded-lg bg-slate-50 p-4 border transition-colors"
              :class="setujuKirim ? 'border-slate-200' : 'border-destructive/50'">
              <input type="checkbox" v-model="setujuKirim" class="mt-1 size-4 accent-landing-teal" />
              <div class="text-sm">
                <span class="font-medium">Saya menyatakan bahwa data yang diisi adalah benar</span>
                <p class="mt-0.5 text-xs text-muted-foreground">Dengan mengirim pendaftaran, Anda menyetujui syarat dan
                  ketentuan yang berlaku.</p>
              </div>
            </label>

            <Button type="submit" :disabled="!setujuKirim || isPending"
              class="mt-6 w-full py-5 text-white bg-landing-teal hover:bg-landing-teal-deep disabled:opacity-50">
              <CheckCircle2 v-if="setujuKirim && !isPending" class="mr-1.5 size-5" />
              {{ isPending ? 'Mengirim...' : 'Kirim Pendaftaran Sekarang' }}
            </Button>
          </div>
        </form>
      </div>

      <!-- STEP 5: Sukses -->
      <div v-if="currentStep === 5" class="mx-auto max-w-2xl">
        <div class="rounded-2xl border bg-white p-10 text-center shadow-sm">
          <CheckCircle2 class="mx-auto size-14 text-green-500" />
          <h2 class="mt-4 font-bold text-2xl">Pendaftaran berhasil dikirim</h2>
          <p class="mt-2 text-sm text-muted-foreground">
            Nomor permohonan kamu:
            <span class="font-mono font-bold">{{ nomorPermohonanBerhasil }}</span>
          </p>
          <p class="mt-3 text-sm text-muted-foreground">
            Simpan nomor ini. Tim kami akan menghubungi nomor HP yang kamu daftarkan.
          </p>
          <Button @click="router.push('/')"
            class="mt-6 px-8 py-3 bg-landing-ink text-white hover:bg-landing-ink/90">Kembali
            ke Beranda</Button>
        </div>
      </div>
    </div>

    <!-- Dialog Detail Paket (IndiHome-style) -->
    <Dialog :open="isModalOpen" @update:open="isModalOpen = $event">
      <DialogContent class="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle class="text-xl">{{ selectedPaket?.nama_paket }} — {{ selectedPaket?.kecepatan_mbps }} Mbps
            Internet
          </DialogTitle>
        </DialogHeader>

        <div class="space-y-5">
          <!-- Harga utama -->
          <div class="rounded-xl bg-slate-50 p-5 text-center">
            <p class="text-sm text-slate-500">{{ selectedPaket?.kecepatan_mbps }} Mbps</p>
            <p class="mt-1 text-3xl font-bold text-landing-teal">Rp {{
              Number(selectedPaket?.harga).toLocaleString('id-ID')
              }}<span class="text-base font-normal text-slate-400">/bulan</span></p>
            <p class="mt-1 text-sm text-slate-500">Bayar sekaligus mulai Rp{{ (Number(selectedPaket?.harga) *
              0.7).toLocaleString('id-ID') }}/bulan</p>
          </div>

          <!-- Dialog Detail Paket -->
          <Dialog :open="isModalOpen" @update:open="isModalOpen = $event">
            <DialogContent class="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle class="text-2xl">{{ selectedPaket?.nama_paket }} — {{ selectedPaket?.kecepatan_mbps }} Mbps
                  Internet</DialogTitle>
              </DialogHeader>

              <div class="space-y-6">
                <!-- Harga utama -->
                <div class="rounded-2xl bg-slate-50 p-6 text-center border">
                  <p class="text-base text-slate-500 font-medium">{{ selectedPaket?.kecepatan_mbps }} Mbps</p>
                  <p class="mt-2 text-4xl font-bold text-landing-teal">Rp {{
                    Number(selectedPaket?.harga).toLocaleString('id-ID') }}<span
                      class="text-lg font-normal text-slate-400">/bulan</span></p>
                </div>

                <!-- Detail grid -->
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div class="flex items-start gap-4 rounded-xl border p-4 shadow-sm">
                    <Monitor class="mt-0.5 size-6 text-landing-teal shrink-0" />
                    <div>
                      <p class="text-xs text-slate-400 uppercase tracking-wide">Perangkat Terhubung</p>
                      <p class="text-base font-semibold mt-0.5">{{ selectedPaket?.jumlah_perangkat }} Perangkat</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-4 rounded-xl border p-4 shadow-sm">
                    <Settings class="mt-0.5 size-6 text-landing-teal shrink-0" />
                    <div>
                      <p class="text-xs text-slate-400 uppercase tracking-wide">Biaya Pasang</p>
                      <p class="text-base font-semibold mt-0.5">Rp0 (Gratis)</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-4 rounded-xl border p-4 shadow-sm">
                    <Tv class="mt-0.5 size-6 text-landing-teal shrink-0" />
                    <div>
                      <p class="text-xs text-slate-400 uppercase tracking-wide">Deskripsi</p>
                      <p class="text-sm font-semibold mt-0.5 leading-snug">{{ selectedPaket?.deskripsi || 'Internet cepat dan stabil' }}</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-4 rounded-xl border p-4 shadow-sm">
                    <CreditCard class="mt-0.5 size-6 text-landing-teal shrink-0" />
                    <div>
                      <p class="text-xs text-slate-400 uppercase tracking-wide">Pembayaran</p>
                      <p class="text-base font-semibold mt-0.5">Pascabayar</p>
                    </div>
                  </div>
                </div>

                <!-- Petunjuk pembayaran -->
                <div class="rounded-xl bg-slate-50 p-5 border">
                  <div class="flex items-start gap-3">
                    <Info class="mt-0.5 size-5 text-landing-teal shrink-0" />
                    <div class="text-sm text-slate-600 space-y-2">
                      <p>Pembayaran layanan kami terdiri dari pembayaran biaya instalasi & pembayaran tagihan bulanan.
                      </p>
                      <p>Pembayaran biaya instalasi dilakukan setelah proses instalasi selesai oleh teknisi, pembayaran
                        dapat dilakukan melalui berbagai channel pembayaran.</p>
                      <p>Pembayaran tagihan bulanan dilakukan setiap tanggal 5-20 setiap bulannya. Untuk bulan pertama
                        pemakaian, pembayaran dilakukan di bulan selanjutnya. Pembayaran menggunakan skema pascabayar
                        (pakai
                        layanan dulu, baru bayar).</p>
                    </div>
                  </div>
                </div>

                <!-- Syarat & Ketentuan -->
                <div class="text-sm text-slate-500 space-y-1">
                  <p class="font-semibold text-slate-700">Syarat & Ketentuan:</p>
                  <ul class="list-disc pl-5 space-y-1">
                    <li>Harga belum termasuk PPN 11%</li>
                    <li>Kontrak berlangganan minimal 12 bulan</li>
                  </ul>
                </div>
              </div>

              <div class="mt-6 flex gap-4">
                <Button variant="outline" class="flex-1 py-6 text-base" @click="isModalOpen = false">Batal</Button>
                <Button @click="lanjutKeLokasi"
                  class="flex-1 py-6 text-base text-white bg-landing-teal hover:bg-landing-teal-deep">
                  Pilih Paket Ini
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <!-- Petunjuk pembayaran -->
          <div class="rounded-xl bg-slate-50 p-4">
            <div class="flex items-start gap-2">
              <Info class="mt-0.5 size-4 text-landing-teal shrink-0" />
              <div class="text-xs text-slate-500 space-y-1.5">
                <p>Pembayaran IndiHome terdiri dari pembayaran biaya instalasi & pembayaran tagihan bulanan.</p>
                <p>Pembayaran biaya instalasi dilakukan setelah proses instalasi selesai oleh teknisi, pembayaran dapat
                  dilakukan melalui berbagai channel pembayaran.</p>
                <p>Pembayaran tagihan bulanan dilakukan setiap tanggal 5-20 setiap bulannya. Untuk bulan pertama
                  pemakaian,
                  pembayaran dilakukan di bulan selanjutnya. Pembayaran menggunakan skema pascabayar (pakai layanan
                  dulu,
                  baru bayar).</p>
              </div>
            </div>
          </div>

          <!-- Syarat & Ketentuan -->
          <div class="text-xs text-slate-400 space-y-0.5">
            <p class="font-medium text-slate-500">Syarat & Ketentuan:</p>
            <ul class="list-disc pl-4 space-y-0.5">
              <li>Harga belum termasuk PPN 11%</li>
              <li>Kontrak berlangganan minimal 12 bulan</li>
            </ul>
          </div>
        </div>

        <div class="mt-4 flex gap-3">
          <Button variant="outline" class="flex-1" @click="isModalOpen = false">Batal</Button>
          <Button @click="lanjutKeLokasi" class="flex-1 text-white bg-landing-teal hover:bg-landing-teal-deep">
            Pilih Paket Ini
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    <!-- Dialog Paket Custom -->
    <Dialog :open="isModalCustomOpen" @update:open="isModalCustomOpen = $event">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle class="text-xl">Buat Paket Custom</DialogTitle>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <p class="text-sm text-slate-500">Ceritakan kebutuhan internet Anda, tim kami akan menghubungi untuk negosiasi
            harga dan spesifikasi teknis.</p>

          <div class="space-y-2">
            <Label>Nama Paket / Kebutuhan (Mis: Kantor Cabang)</Label>
            <Input v-model="namaPaketCustom" v-bind="namaPaketCustomAttrs" placeholder="Masukkan kebutuhan..." />
            <p v-if="errors.nama_paket_custom" class="text-xs text-destructive">{{ errors.nama_paket_custom }}</p>
          </div>

          <div class="space-y-2">
            <Label>Perkiraan Kecepatan (Mbps)</Label>
            <Input type="number" v-model="kecepatanCustomMbps" v-bind="kecepatanCustomMbpsAttrs"
              placeholder="Mis. 200" />
            <p v-if="errors.kecepatan_custom_mbps" class="text-xs text-destructive">{{ errors.kecepatan_custom_mbps }}
            </p>
          </div>

          <div class="space-y-2">
            <Label>Catatan Tambahan (Opsional)</Label>
            <Textarea v-model="catatanCustom" v-bind="catatanCustomAttrs"
              placeholder="Butuh IP Publik, instalasi khusus, dsb..." />
          </div>
        </div>

        <div class="mt-2 flex gap-3">
          <Button variant="outline" class="flex-1" @click="isModalCustomOpen = false">Batal</Button>
          <Button @click="lanjutDariCustom" class="flex-1 text-white bg-landing-teal hover:bg-landing-teal-deep"
            :disabled="!namaPaketCustom || !kecepatanCustomMbps">
            Lanjut Atur Lokasi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>