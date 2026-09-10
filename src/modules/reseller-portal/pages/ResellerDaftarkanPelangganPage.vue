<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { useQuery } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import {
  CheckCircle2, ChevronLeft, ChevronRight, MapPin, Package, User,
  FileText, FileImage, Monitor, Settings, ShoppingCart, Plus, Info,
} from 'lucide-vue-next'
import type { PaketInternet } from '@/types/models'

import { daftarkanPelangganSchema } from '@/schemas/reseller-portal.schema'
import { mapValidationErrors } from '@/lib/errors'
import { getResellerPaketInternetList } from '@/modules/paket-internet/api/reseller/resellerPaketInternet.api'
import FileInputFoto from '@/modules/pendaftaran/components/FileInputFoto.vue'
import LocationPicker from '@/modules/pendaftaran/components/PemilihanLokasi.vue'
import { useDaftarkanPelanggan } from '../composables/useResellerPortal'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

const router = useRouter()

const { data: paketList } = useQuery({
  queryKey: ['paket-internet', 'reseller', 'options'],
  queryFn: () => getResellerPaketInternetList().then((res) => res.data.data),
})

const paketTersedia = computed(() =>
  (paketList.value ?? []).filter((paket) => paket.status_aktif),
)

const currentStep = ref(1)
const selectedPaket = ref<PaketInternet | null>(null)
const isModalOpen = ref(false)
const setujuKirim = ref(false)

const steps = [
  { id: 1, label: 'Pilih Paket', icon: Package },
  { id: 2, label: 'Atur Lokasi', icon: MapPin },
  { id: 3, label: 'Data Diri', icon: User },
  { id: 4, label: 'Review', icon: FileText },
  { id: 5, label: 'Selesai', icon: CheckCircle2 },
]

const {
  handleSubmit, errors, defineField, setErrors, setFieldValue,
} = useForm({
  validationSchema: toTypedSchema(daftarkanPelangganSchema),
  initialValues: {
    latitude: undefined,
    longitude: undefined,
  },
})

const [namaLengkap, namaLengkapAttrs] = defineField('nama_lengkap')
const [nik, nikAttrs] = defineField('nik')
const [nomorHp, nomorHpAttrs] = defineField('nomor_hp')
const [email, emailAttrs] = defineField('email')
const [alamatPemasangan, alamatPemasanganAttrs] = defineField('alamat_pemasangan')
const [detailAlamat, detailAlamatAttrs] = defineField('detail_alamat')
defineField('paket_internet_id')
defineField('foto_ktp')
defineField('foto_selfie_ktp')
defineField('latitude')
defineField('longitude')

const fotoKtp = ref<File | null>(null)
const fotoSelfieKtp = ref<File | null>(null)
const lokasiPeta = ref<{ lat: number; lng: number; address?: string; provinsi?: string; kota?: string } | null>(null)

watch(fotoKtp, (f) => setFieldValue('foto_ktp', f ?? undefined))
watch(fotoSelfieKtp, (f) => setFieldValue('foto_selfie_ktp', f ?? undefined))
watch(lokasiPeta, (l) => {
  setFieldValue('latitude', l?.lat)
  setFieldValue('longitude', l?.lng)
  if (l?.address) setFieldValue('alamat_pemasangan', l.address)
  setFieldValue('provinsi', l?.provinsi ?? undefined)
  setFieldValue('kota', l?.kota ?? undefined)
})

function pilihPaket(paket: PaketInternet) {
  selectedPaket.value = paket
  isModalOpen.value = true
}

function lanjutKeLokasi() {
  setFieldValue('paket_internet_id', String(selectedPaket.value!.id))
  isModalOpen.value = false
  currentStep.value = 2
}

function lanjutKeDataDiri() {
  if (!lokasiPeta.value) return
  currentStep.value = 3
}

function lanjutKeReview() { currentStep.value = 4 }

const { mutate, isPending } = useDaftarkanPelanggan()
const nomorPelangganBerhasil = ref<string | null>(null)

const onSubmit = handleSubmit((fv) => {
  mutate(
    {
      form: fv,
      fotoKtp: fotoKtp.value,
      fotoSelfie: fotoSelfieKtp.value,
    },
    {
      onSuccess: ({ data }) => {
        nomorPelangganBerhasil.value = data.data.nomor_pelanggan
        currentStep.value = 5
      },
      onError: (e) => {
        const fe = mapValidationErrors(e)
        if (fe) {
          setErrors(fe)
        } else {
          toast.error('Terjadi kesalahan saat mendaftarkan pelanggan.')
        }
      },
    },
  )
})

const ringkasan = computed(() => ({
  paket: selectedPaket.value
    ? `${selectedPaket.value.nama_paket} — ${selectedPaket.value.kecepatan_mbps} Mbps`
    : '-',
  harga: selectedPaket.value
    ? `Rp ${Number(selectedPaket.value.harga).toLocaleString('id-ID')}/bln`
    : '-',
  alamat: alamatPemasangan.value || '-',
  nama: namaLengkap.value || '-',
  nik: nik.value || '-',
  email: email.value || '-',
  hp: nomorHp.value || '-',
  fotoKtp: fotoKtp.value?.name,
  fotoSelfie: fotoSelfieKtp.value?.name,
}))
</script>

<template>
  <div class="pb-20">
    <!-- Progress Stepper -->
    <div class="sticky top-0 z-30 mb-6 rounded-xl border bg-white/95 shadow-sm backdrop-blur-sm">
      <div class="flex items-center gap-1 px-4 py-3 sm:gap-2">
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

    <!-- STEP 1: Pilih Paket -->
    <div v-if="currentStep === 1">
      <div v-if="paketTersedia.length"
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="paket in paketTersedia" :key="paket.id"
          class="flex flex-col rounded-2xl border bg-white transition-all hover:shadow-md"
          :class="selectedPaket?.id === paket.id ? 'border-landing-teal ring-2 ring-landing-teal/20' : 'border-slate-200'">
          <div class="flex flex-1 flex-col p-5">
            <h3 class="font-bold text-landing-ink">{{ paket.nama_paket }}</h3>
            <p class="mt-1 text-3xl font-bold text-landing-teal">{{ paket.kecepatan_mbps }}
              <span class="text-sm font-medium">Mbps</span>
            </p>
            <div class="mt-4 space-y-1.5 text-xs text-slate-500">
              <div class="flex items-center gap-1.5">
                <Monitor class="size-3.5" /> {{ paket.jumlah_perangkat }} Perangkat Terhubung
              </div>
              <div class="flex items-center gap-1.5">
                <Settings class="size-3.5" /> Biaya Pasang Gratis
              </div>
            </div>
          </div>
          <div class="border-t px-5 py-3">
            <div class="mb-3">
              <span class="text-xs text-slate-400">Mulai dari</span>
              <p class="text-xl font-bold text-landing-ink">Rp
                {{ Number(paket.harga).toLocaleString('id-ID') }}<span
                  class="text-xs font-normal text-slate-400">/bln</span>
              </p>
            </div>
            <Button class="w-full py-2.5 text-sm text-white bg-landing-teal hover:bg-landing-teal-deep"
              @click="pilihPaket(paket)">
              {{ selectedPaket?.id === paket.id ? 'Lihat Detail' : 'Pilih Paket' }}
            </Button>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-white p-10 text-center">
        <ShoppingCart class="size-10 text-slate-300" />
        <p class="text-sm text-slate-400">Belum ada paket aktif milik Anda.</p>
        <Button :as="RouterLink" to="/reseller/paket-internet/baru" variant="outline" size="sm">
          <Plus class="mr-1.5 size-4" /> Buat Paket Internet
        </Button>
      </div>
    </div>

    <!-- STEP 2: Lokasi -->
    <div v-else-if="currentStep === 2" class="mx-auto max-w-3xl">
      <Button variant="ghost" class="mb-4 pl-0" @click="currentStep = 1">
        <ChevronLeft class="mr-1 size-4" /> Kembali
      </Button>
      <div class="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 class="mb-1 text-xl font-bold">Atur Lokasi Pemasangan</h2>
        <p class="mb-5 text-sm text-muted-foreground">Klik peta atau gunakan tombol Deteksi Lokasi untuk mengisi alamat
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
          <Label for="detail_alamat">Detail Alamat
            <span class="text-muted-foreground">(opsional)</span>
          </Label>
          <Textarea id="detail_alamat" v-model="detailAlamat" v-bind="detailAlamatAttrs"
            placeholder="Contoh: RT 03 RW 05, rumah cat hijau, samping masjid..." class="min-h-[80px]" />
          <p v-if="errors.detail_alamat" class="text-xs text-destructive">{{ errors.detail_alamat }}</p>
        </div>
        <Button @click="lanjutKeDataDiri"
          class="mt-6 w-full bg-landing-teal py-5 text-white hover:bg-landing-teal-deep" :disabled="!lokasiPeta">
          Simpan Alamat & Lanjut
          <ChevronRight class="ml-1 size-4" />
        </Button>
      </div>
    </div>

    <!-- STEP 3: Data Diri -->
    <div v-else-if="currentStep === 3" class="mx-auto max-w-2xl">
      <Button variant="ghost" class="mb-4 pl-0" @click="currentStep = 2">
        <ChevronLeft class="mr-1 size-4" /> Kembali
      </Button>
      <div class="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        <h2 class="mb-6 text-xl font-bold">Data Diri & Dokumen</h2>
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
          class="mt-8 w-full bg-landing-teal py-5 text-white hover:bg-landing-teal-deep">
          Lanjut ke Review
          <ChevronRight class="ml-1 size-4" />
        </Button>
      </div>
    </div>

    <!-- STEP 4: Review & Kirim -->
    <div v-else-if="currentStep === 4" class="mx-auto max-w-3xl">
      <Button variant="ghost" class="mb-4 pl-0" @click="currentStep = 3">
        <ChevronLeft class="mr-1 size-4" /> Kembali
      </Button>
      <form novalidate @submit="onSubmit">
        <div class="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
          <h2 class="mb-6 text-xl font-bold">Review Pendaftaran</h2>
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
                <p><span class="text-slate-400">Foto KTP:</span>
                  <span class="font-medium">{{ ringkasan.fotoKtp || '-' }}</span>
                </p>
                <p><span class="text-slate-400">Foto Selfie:</span>
                  <span class="font-medium">{{ ringkasan.fotoSelfie || '-' }}</span>
                </p>
              </div>
            </div>
          </div>
          <Separator class="my-6" />

          <div v-if="Object.keys(errors).length > 0"
            class="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            <p class="mb-1 font-bold">Pendaftaran tertunda karena data berikut belum lengkap/sesuai:</p>
            <ul class="list-disc pl-5">
              <li v-for="(msg, field) in errors" :key="field">
                <span class="font-medium capitalize">{{ field.replace('_', ' ') }}</span>: {{ msg }}
              </li>
            </ul>
            <p class="mt-2 text-xs">Silakan tekan tombol <b>Kembali</b> untuk memperbaiki data di atas.</p>
          </div>

          <label class="flex cursor-pointer items-start gap-3 rounded-lg border bg-slate-50 p-4 transition-colors"
            :class="setujuKirim ? 'border-slate-200' : 'border-destructive/50'">
            <input type="checkbox" v-model="setujuKirim" class="mt-1 size-4 accent-landing-teal" />
            <div class="text-sm">
              <span class="font-medium">Saya menyatakan bahwa data yang diisi adalah benar</span>
              <p class="mt-0.5 text-xs text-muted-foreground">Dengan mengirim pendaftaran, pelanggan akan langsung
                menjadi milik reseller dan layanan aktif.</p>
            </div>
          </label>

          <Button type="submit" :disabled="!setujuKirim || isPending"
            class="mt-6 w-full bg-landing-teal py-5 text-white hover:bg-landing-teal-deep disabled:opacity-50">
            <CheckCircle2 v-if="setujuKirim && !isPending" class="mr-1.5 size-5" />
            {{ isPending ? 'Mengirim...' : 'Kirim Pendaftaran Sekarang' }}
          </Button>
        </div>
      </form>
    </div>

    <!-- STEP 5: Selesai -->
    <div v-else class="mx-auto max-w-2xl">
      <div class="rounded-2xl border bg-white p-10 text-center shadow-sm">
        <CheckCircle2 class="mx-auto size-14 text-green-500" />
        <h2 class="mt-4 text-2xl font-bold">Pelanggan berhasil didaftarkan</h2>
        <p class="mt-2 text-sm text-muted-foreground">
          Nomor pelanggan:
          <span class="font-mono font-bold">{{ nomorPelangganBerhasil }}</span>
        </p>
        <p class="mt-3 text-sm text-muted-foreground">
          Layanan pelanggan sudah aktif. Simpan nomor ini untuk keperluan penagihan.
        </p>
        <Button @click="router.push('/reseller/pelanggan')"
          class="mt-6 px-8 py-3 bg-landing-ink text-white hover:bg-landing-ink/90">Kembali
          ke Daftar Pelanggan</Button>
      </div>
    </div>

    <!-- Dialog Detail Paket -->
    <Dialog :open="isModalOpen" @update:open="isModalOpen = $event">
      <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle class="text-xl">{{ selectedPaket?.nama_paket }} — {{ selectedPaket?.kecepatan_mbps }} Mbps
            Internet</DialogTitle>
        </DialogHeader>

        <div class="space-y-5">
          <div class="rounded-xl bg-slate-50 p-5 text-center">
            <p class="text-sm text-slate-500">{{ selectedPaket?.kecepatan_mbps }} Mbps</p>
            <p class="mt-1 text-3xl font-bold text-landing-teal">Rp
              {{ Number(selectedPaket?.harga).toLocaleString('id-ID') }}<span
                class="text-base font-normal text-slate-400">/bulan</span>
            </p>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="flex items-start gap-4 rounded-xl border p-4 shadow-sm">
              <Monitor class="mt-0.5 size-6 shrink-0 text-landing-teal" />
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-400">Perangkat Terhubung</p>
                <p class="mt-0.5 text-base font-semibold">{{ selectedPaket?.jumlah_perangkat }} Perangkat</p>
              </div>
            </div>
            <div class="flex items-start gap-4 rounded-xl border p-4 shadow-sm">
              <Settings class="mt-0.5 size-6 shrink-0 text-landing-teal" />
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-400">Biaya Pasang</p>
                <p class="mt-0.5 text-base font-semibold">Rp0 (Gratis)</p>
              </div>
            </div>
            <div class="flex items-start gap-4 rounded-xl border p-4 shadow-sm sm:col-span-2">
              <Info class="mt-0.5 size-6 shrink-0 text-landing-teal" />
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-400">Deskripsi</p>
                <p class="mt-0.5 text-sm font-semibold leading-snug">
                  {{ selectedPaket?.deskripsi || 'Internet cepat dan stabil' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 flex gap-3">
          <Button variant="outline" class="flex-1" @click="isModalOpen = false">Batal</Button>
          <Button @click="lanjutKeLokasi" class="flex-1 bg-landing-teal text-white hover:bg-landing-teal-deep">
            Pilih Paket Ini
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>