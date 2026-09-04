<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import {
  ArrowLeft, ArrowRight, CheckCircle2, Copy, MapPin,
  Package, User, FileText, FileImage, UserPlus,
} from 'lucide-vue-next'
import { buatPelangganSchema } from '@/schemas/buat-pelanggan.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useBuatanPelanggan } from '../composables/useBuatanPelanggan'
import { usePaketInternetList } from '@/modules/paket-internet/composables/usePaketInternet'
import FileInputFoto from '@/modules/pendaftaran/components/FileInputFoto.vue'
import LocationPicker from '@/modules/pendaftaran/components/PemilihanLokasi.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import type { PaketInternet } from '@/types/models'

const router = useRouter()
const { data: daftarPaket } = usePaketInternetList()

const currentStep = ref(1)
const selectedPaket = ref<PaketInternet | null>(null)
const isModalPaketOpen = ref(false)
const isModalCustomOpen = ref(false)
const credentialModalOpen = ref(false)

const { handleSubmit, errors, defineField, setErrors, setFieldValue } = useForm({
  validationSchema: toTypedSchema(buatPelangganSchema),
  initialValues: { tipe_paket: 'reguler' },
})

const [namaLengkap, namaLengkapAttrs] = defineField('nama_lengkap')
const [nik, nikAttrs] = defineField('nik')
const [nomorHp, nomorHpAttrs] = defineField('nomor_hp')
const [email, emailAttrs] = defineField('email')
const [alamatPemasangan, alamatPemasanganAttrs] = defineField('alamat_pemasangan')
const [detailAlamat, detailAlamatAttrs] = defineField('detail_alamat')
const [tipePaket] = defineField('tipe_paket')
const [namaPaketCustom, namaPaketCustomAttrs] = defineField('nama_paket_custom')
const [kecepatanCustomMbps, kecepatanCustomMbpsAttrs] = defineField('kecepatan_custom_mbps')
const [catatanCustom, catatanCustomAttrs] = defineField('catatan_custom')

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

const generatedCredentials = ref<{ username: string; password: string } | null>(null)

const { mutate, isPending } = useBuatanPelanggan()

// ── Step navigation ──
function pilihPaket(paket: PaketInternet) {
  selectedPaket.value = paket
  isModalPaketOpen.value = true
}

function lanjutKeLokasi() {
  setFieldValue('tipe_paket', 'reguler')
  setFieldValue('paket_internet_id', String(selectedPaket.value!.id))
  isModalPaketOpen.value = false
  currentStep.value = 2
}

function lanjutKeDataDiri() {
  if (!lokasiPeta.value) return
  currentStep.value = 3
}

function pilihPaketCustom() {
  isModalCustomOpen.value = true
}

function lanjutDariCustom() {
  setFieldValue('tipe_paket', 'custom')
  setFieldValue('paket_internet_id', undefined)
  isModalCustomOpen.value = false
  currentStep.value = 2
}

function lanjutKeReview() {
  currentStep.value = 4
}

// ── Submit ──
const onSubmit = handleSubmit((fv) => {
  mutate(
    { ...fv, foto_ktp: fotoKtp.value ?? undefined, foto_selfie_ktp: fotoSelfieKtp.value ?? undefined },
    {
      onSuccess: (data) => {
        generatedCredentials.value = { username: data.username, password: data.password }
        credentialModalOpen.value = true
        currentStep.value = 5
      },
      onError: (e) => {
        const fe = mapValidationErrors(e)
        if (fe) setErrors(fe)
        else toast.error('Terjadi kesalahan, coba lagi.')
      },
    },
  )
})

// ── Copy to clipboard ──
async function salinKredensial() {
  if (!generatedCredentials.value) return
  const text = `Username: ${generatedCredentials.value.username}\nPassword: ${generatedCredentials.value.password}`
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Kredensial berhasil disalin!')
  } catch {
    toast.error('Gagal menyalin ke clipboard.')
  }
}

// ── Ringkasan preview ──
const ringkasan = computed(() => {
  let paketText = '-'
  let hargaText = '-'

  if (tipePaket.value === 'reguler' && selectedPaket.value) {
    paketText = `${selectedPaket.value.nama_paket} — ${selectedPaket.value.kecepatan_mbps} Mbps`
    hargaText = `Rp ${Number(selectedPaket.value.harga).toLocaleString('id-ID')}/bln`
  } else if (tipePaket.value === 'custom') {
    paketText = `Custom: ${namaPaketCustom.value || '-'} — ${kecepatanCustomMbps.value || '?'} Mbps`
    hargaText = 'Menunggu Negosiasi'
  }

  return {
    paket: paketText,
    harga: hargaText,
    alamat: alamatPemasangan.value || '-',
    detailAlamat: detailAlamat.value || '-',
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
  { id: 2, label: 'Lokasi', icon: MapPin },
  { id: 3, label: 'Data Diri', icon: User },
  { id: 4, label: 'Review', icon: FileText },
]
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <Button variant="ghost" size="sm" @click="router.back()">
        <ArrowLeft class="size-4" /> Kembali
      </Button>
      <h1 class="text-2xl font-semibold tracking-tight">Buat Pelanggan Baru</h1>
    </div>

    <!-- Stepper -->
    <div class="flex items-center gap-2 text-sm">
      <template v-for="(s, i) in steps" :key="s.id">
        <div
          class="flex items-center gap-1.5"
          :class="currentStep === s.id ? 'font-bold text-primary' : currentStep > s.id ? 'text-green-600' : 'text-muted-foreground'"
        >
          <CheckCircle2 v-if="currentStep > s.id" class="size-4" />
          <component v-else :is="s.icon" class="size-4" />
          <span class="hidden sm:inline">{{ s.label }}</span>
        </div>
        <ArrowRight v-if="i < steps.length - 1" class="size-3.5 text-muted-foreground" />
      </template>
    </div>

    <!-- ===== STEP 1: Pilih Paket ===== -->
    <div v-if="currentStep === 1" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card
        v-for="paket in (daftarPaket ?? [])"
        :key="paket.id"
        class="cursor-pointer transition-all hover:shadow-md"
        :class="selectedPaket?.id === paket.id ? 'ring-2 ring-primary' : ''"
        @click="pilihPaket(paket)"
      >
        <CardContent class="p-5">
          <h3 class="font-bold">{{ paket.nama_paket }}</h3>
          <p class="mt-1 text-2xl font-bold text-primary">{{ paket.kecepatan_mbps }} <span class="text-sm font-medium">Mbps</span></p>
          <p class="mt-2 text-sm text-muted-foreground">{{ paket.jumlah_perangkat }} Perangkat</p>
          <p class="mt-1 font-semibold">Rp {{ Number(paket.harga).toLocaleString('id-ID') }}/bln</p>
        </CardContent>
      </Card>

      <!-- Custom package card -->
      <Card class="cursor-pointer border-dashed border-primary/40 bg-primary/5 transition-all hover:shadow-md" @click="pilihPaketCustom">
        <CardContent class="flex flex-col items-center justify-center p-5 text-center">
          <Package class="mb-2 size-8 text-primary" />
          <h3 class="font-bold">Paket Custom</h3>
          <p class="mt-1 text-sm text-muted-foreground">Buat paket sesuai kebutuhan</p>
        </CardContent>
      </Card>
    </div>

    <!-- ===== STEP 2: Lokasi ===== -->
    <div v-if="currentStep === 2" class="mx-auto max-w-3xl">
      <Button variant="ghost" class="mb-4 pl-0" @click="currentStep = 1">
        <ArrowLeft class="mr-1 size-4" /> Kembali
      </Button>
      <Card>
        <CardHeader><CardTitle>Atur Lokasi Pemasangan</CardTitle></CardHeader>
        <CardContent class="space-y-4">
          <p class="text-sm text-muted-foreground">Klik peta atau gunakan tombol Deteksi Lokasi untuk mengisi alamat otomatis.</p>
          <div class="h-[350px] w-full overflow-hidden rounded-xl border">
            <LocationPicker v-model="lokasiPeta" class="h-full w-full" />
          </div>
          <div class="space-y-2">
            <Label for="alamat_pemasangan">Alamat Lengkap</Label>
            <Textarea id="alamat_pemasangan" v-model="alamatPemasangan" v-bind="alamatPemasanganAttrs" placeholder="Otomatis terisi dari peta..." class="min-h-[90px]" />
            <p v-if="errors.alamat_pemasangan" class="text-xs text-destructive">{{ errors.alamat_pemasangan }}</p>
          </div>
          <div class="space-y-2">
            <Label for="detail_alamat">Detail Alamat <span class="text-muted-foreground">(opsional)</span></Label>
            <Textarea id="detail_alamat" v-model="detailAlamat" v-bind="detailAlamatAttrs" placeholder="RT/RW, rumah cat hijau, samping masjid..." class="min-h-[80px]" />
          </div>
          <Button class="w-full" :disabled="!lokasiPeta" @click="lanjutKeDataDiri">
            Simpan & Lanjut <ArrowRight class="ml-1 size-4" />
          </Button>
        </CardContent>
      </Card>
    </div>

    <!-- ===== STEP 3: Data Diri ===== -->
    <div v-if="currentStep === 3" class="mx-auto max-w-2xl">
      <Button variant="ghost" class="mb-4 pl-0" @click="currentStep = 2">
        <ArrowLeft class="mr-1 size-4" /> Kembali
      </Button>
      <Card>
        <CardHeader><CardTitle>Data Diri & Dokumen</CardTitle></CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="nama_lengkap">Nama Lengkap</Label>
              <Input id="nama_lengkap" v-model="namaLengkap" v-bind="namaLengkapAttrs" :aria-invalid="!!errors.nama_lengkap" />
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
                <Input id="nomor_hp" v-model="nomorHp" v-bind="nomorHpAttrs" placeholder="08xxxxxxxxxx" :aria-invalid="!!errors.nomor_hp" />
                <p v-if="errors.nomor_hp" class="text-xs text-destructive">{{ errors.nomor_hp }}</p>
              </div>
            </div>
            <div class="space-y-2">
              <Label for="email">Email <span class="text-muted-foreground">(opsional)</span></Label>
              <Input id="email" v-model="email" v-bind="emailAttrs" type="email" :aria-invalid="!!errors.email" />
              <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <FileInputFoto v-model="fotoKtp" label="Foto KTP" hint="Opsional" :error="errors.foto_ktp" />
              <FileInputFoto v-model="fotoSelfieKtp" label="Foto Selfie dengan KTP" hint="Opsional" :error="errors.foto_selfie_ktp" />
            </div>
          </div>
          <Button class="mt-6 w-full" @click="lanjutKeReview">
            Lanjut ke Review <ArrowRight class="ml-1 size-4" />
          </Button>
        </CardContent>
      </Card>
    </div>

    <!-- ===== STEP 4: Review & Konfirmasi ===== -->
    <div v-if="currentStep === 4" class="mx-auto max-w-3xl">
      <Button variant="ghost" class="mb-4 pl-0" @click="currentStep = 3">
        <ArrowLeft class="mr-1 size-4" /> Kembali
      </Button>
      <form novalidate @submit="onSubmit">
        <Card>
          <CardHeader>
            <CardTitle>Konfirmasi Data Pelanggan</CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
            <p class="text-sm text-muted-foreground">Pastikan semua data sudah benar sebelum disimpan.</p>

            <div class="grid gap-4 sm:grid-cols-2">
              <div class="rounded-lg border bg-muted/50 p-4">
                <h3 class="mb-2 flex items-center gap-1.5 text-sm font-semibold text-primary">
                  <Package class="size-4" /> Paket
                </h3>
                <p class="text-sm"><span class="text-muted-foreground">Paket:</span> <span class="font-medium">{{ ringkasan.paket }}</span></p>
                <p class="text-sm"><span class="text-muted-foreground">Harga:</span> <span class="font-medium">{{ ringkasan.harga }}</span></p>
              </div>
              <div class="rounded-lg border bg-muted/50 p-4">
                <h3 class="mb-2 flex items-center gap-1.5 text-sm font-semibold text-primary">
                  <MapPin class="size-4" /> Lokasi
                </h3>
                <p class="text-sm leading-relaxed">{{ ringkasan.alamat }}</p>
                <p v-if="ringkasan.detailAlamat !== '-'" class="mt-1 text-xs text-muted-foreground">{{ ringkasan.detailAlamat }}</p>
              </div>
              <div class="rounded-lg border bg-muted/50 p-4">
                <h3 class="mb-2 flex items-center gap-1.5 text-sm font-semibold text-primary">
                  <User class="size-4" /> Data Diri
                </h3>
                <div class="space-y-1 text-sm">
                  <p><span class="text-muted-foreground">Nama:</span> <span class="font-medium">{{ ringkasan.nama }}</span></p>
                  <p><span class="text-muted-foreground">NIK:</span> <span class="font-medium">{{ ringkasan.nik }}</span></p>
                  <p><span class="text-muted-foreground">No. HP:</span> <span class="font-medium">{{ ringkasan.hp }}</span></p>
                  <p><span class="text-muted-foreground">Email:</span> {{ ringkasan.email || '-' }}</p>
                </div>
              </div>
              <div class="rounded-lg border bg-muted/50 p-4">
                <h3 class="mb-2 flex items-center gap-1.5 text-sm font-semibold text-primary">
                  <FileImage class="size-4" /> Dokumen
                </h3>
                <div class="space-y-1 text-sm">
                  <p><span class="text-muted-foreground">Foto KTP:</span> <span class="font-medium">{{ ringkasan.fotoKtp || 'Belum diunggah' }}</span></p>
                  <p><span class="text-muted-foreground">Foto Selfie:</span> <span class="font-medium">{{ ringkasan.fotoSelfie || 'Belum diunggah' }}</span></p>
                </div>
              </div>
            </div>

            <Separator />

            <div v-if="Object.keys(errors).length > 0" class="rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
              <p class="font-bold mb-1">Data berikut belum lengkap/sesuai:</p>
              <ul class="list-disc pl-5">
                <li v-for="(msg, field) in errors" :key="field">
                  <span class="font-medium capitalize">{{ String(field).replace('_', ' ') }}</span>: {{ msg }}
                </li>
              </ul>
            </div>

            <Button type="submit" class="w-full" :disabled="isPending">
              <CheckCircle2 v-if="!isPending" class="mr-1.5 size-4" />
              {{ isPending ? 'Menyimpan...' : 'Konfirmasi & Simpan' }}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>

    <!-- ===== STEP 5: Selesai ===== -->
    <div v-if="currentStep === 5" class="mx-auto max-w-md text-center">
      <Card>
        <CardContent class="py-10">
          <CheckCircle2 class="mx-auto size-12 text-green-500" />
          <h2 class="mt-3 text-xl font-bold">Pelanggan Berhasil Dibuat!</h2>
          <p class="mt-2 text-sm text-muted-foreground">Kredensial telah ditampilkan di bawah. Silakan informasikan ke pelanggan.</p>
          <Button class="mt-4" @click="router.push('/admin/operasional/pelanggan')">Lihat Daftar Pelanggan</Button>
        </CardContent>
      </Card>
    </div>

    <!-- ===== Modal: Detail Paket ===== -->
    <Dialog :open="isModalPaketOpen" @update:open="isModalPaketOpen = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ selectedPaket?.nama_paket }} — {{ selectedPaket?.kecepatan_mbps }} Mbps</DialogTitle>
        </DialogHeader>
        <div class="space-y-3">
          <p class="text-2xl font-bold text-primary">Rp {{ Number(selectedPaket?.harga).toLocaleString('id-ID') }}/bln</p>
          <p class="text-sm text-muted-foreground">{{ selectedPaket?.jumlah_perangkat }} Perangkat Terhubung</p>
          <p class="text-sm text-muted-foreground">{{ selectedPaket?.deskripsi || 'Internet cepat dan stabil' }}</p>
        </div>
        <div class="mt-4 flex gap-3">
          <Button variant="outline" class="flex-1" @click="isModalPaketOpen = false">Batal</Button>
          <Button class="flex-1" @click="lanjutKeLokasi">Pilih Paket Ini</Button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- ===== Modal: Paket Custom ===== -->
    <Dialog :open="isModalCustomOpen" @update:open="isModalCustomOpen = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buat Paket Custom</DialogTitle>
          <DialogDescription>Ceritakan kebutuhan internet pelanggan, tim kami akan menghubungi untuk negosiasi harga.</DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-2">
          <div class="space-y-2">
            <Label>Nama Paket / Kebutuhan</Label>
            <Input v-model="namaPaketCustom" v-bind="namaPaketCustomAttrs" placeholder="Mis. Kantor Cabang" />
            <p v-if="errors.nama_paket_custom" class="text-xs text-destructive">{{ errors.nama_paket_custom }}</p>
          </div>
          <div class="space-y-2">
            <Label>Perkiraan Kecepatan (Mbps)</Label>
            <Input type="number" v-model="kecepatanCustomMbps" v-bind="kecepatanCustomMbpsAttrs" placeholder="Mis. 200" />
            <p v-if="errors.kecepatan_custom_mbps" class="text-xs text-destructive">{{ errors.kecepatan_custom_mbps }}</p>
          </div>
          <div class="space-y-2">
            <Label>Catatan Tambahan <span class="text-muted-foreground">(opsional)</span></Label>
            <Textarea v-model="catatanCustom" v-bind="catatanCustomAttrs" placeholder="Butuh IP Publik, instalasi khusus, dsb..." />
          </div>
        </div>
        <div class="flex gap-3">
          <Button variant="outline" class="flex-1" @click="isModalCustomOpen = false">Batal</Button>
          <Button class="flex-1" :disabled="!namaPaketCustom || !kecepatanCustomMbps" @click="lanjutDariCustom">
            Lanjut Atur Lokasi
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- ===== Modal: Kredensial ===== -->
    <Dialog :open="credentialModalOpen" @update:open="credentialModalOpen = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <UserPlus class="size-5 text-primary" />
            Kredensial Pelanggan
          </DialogTitle>
          <DialogDescription>Simpan informasi ini dan informasikan ke pelanggan.</DialogDescription>
        </DialogHeader>
        <div v-if="generatedCredentials" class="space-y-4 py-2">
          <div class="rounded-lg border bg-muted/50 p-4 space-y-3">
            <div>
              <p class="text-xs text-muted-foreground">Username</p>
              <p class="font-mono text-lg font-bold tracking-wide">{{ generatedCredentials.username }}</p>
            </div>
            <Separator />
            <div>
              <p class="text-xs text-muted-foreground">Password</p>
              <p class="font-mono text-lg font-bold tracking-wide">{{ generatedCredentials.password }}</p>
            </div>
          </div>
          <p class="text-xs text-muted-foreground text-center">Username dan password sama. Pelanggan bisa mengubahnya setelah login.</p>
        </div>
        <div class="flex gap-3 mt-2">
          <Button variant="outline" class="flex-1" @click="credentialModalOpen = false">Tutup</Button>
          <Button class="flex-1" @click="salinKredensial">
            <Copy class="mr-1.5 size-4" />
            Salin ke Clipboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
