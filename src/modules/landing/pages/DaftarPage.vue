<script setup lang="ts">
import { ref, watch } from 'vue' // <-- Tambah watch di sini
import { useRoute } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { CheckCircle2 } from 'lucide-vue-next'
import { daftarSchema } from '@/schemas/pendaftaran.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useDaftar } from '@/modules/pendaftaran/composables/usePendaftaran'
import { usePaketInternetList } from '@/modules/paket-internet/composables/usePaketInternet'
import FileInputFoto from '@/modules/pendaftaran/components/FileInputFoto.vue'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'

const route = useRoute()
const { data: daftarPaket } = usePaketInternetList()

const { handleSubmit, errors, defineField, setErrors, setFieldValue, values } = useForm({
  validationSchema: toTypedSchema(daftarSchema),
  initialValues: {
    tipe_paket: 'reguler',
    paket_internet_id:
      typeof route.query.paket_internet_id === 'string' ? route.query.paket_internet_id : undefined,
  },
})

const [namaLengkap, namaLengkapAttrs] = defineField('nama_lengkap')
const [nik, nikAttrs] = defineField('nik')
const [nomorHp, nomorHpAttrs] = defineField('nomor_hp')
const [email, emailAttrs] = defineField('email')
const [alamatPemasangan, alamatPemasanganAttrs] = defineField('alamat_pemasangan')
const [rt, rtAttrs] = defineField('rt')
const [rw, rwAttrs] = defineField('rw')
const [kodePos, kodePosAttrs] = defineField('kode_pos')
const [latitude, latitudeAttrs] = defineField('latitude')
const [longitude, longitudeAttrs] = defineField('longitude')
const [tipePaket, tipePaketAttrs] = defineField('tipe_paket')
const [paketInternetId, paketInternetIdAttrs] = defineField('paket_internet_id')
const [namaPaketCustom, namaPaketCustomAttrs] = defineField('nama_paket_custom')
const [kecepatanCustomMbps, kecepatanCustomMbpsAttrs] = defineField('kecepatan_custom_mbps')
const [catatanCustom, catatanCustomAttrs] = defineField('catatan_custom')

const fotoKtp = ref<File | null>(null)
const fotoSelfieKtp = ref<File | null>(null)

const { mutate, isPending } = useDaftar()
const nomorPermohonanBerhasil = ref<string | null>(null)

watch(fotoKtp, (newFile) => {
  setFieldValue('foto_ktp', newFile ?? undefined)
})

watch(fotoSelfieKtp, (newFile) => {
  setFieldValue('foto_selfie_ktp', newFile ?? undefined)
})

const onSubmit = handleSubmit((formValues) => {
  mutate(
    {
      ...formValues,
      foto_ktp: fotoKtp.value as File,
      foto_selfie_ktp: fotoSelfieKtp.value as File,
    },
    {
      onSuccess: ({ data }) => {
        nomorPermohonanBerhasil.value = data.data.nomor_permohonan
      },
      onError: (error) => {
        const fieldErrors = mapValidationErrors(error)
        if (fieldErrors) setErrors(fieldErrors)
      },
    },
  )
})
</script>

<template>
  <div>
    <!-- ============ HEADER ============ -->
    <section class="bg-landing-ink text-landing-mist">
      <div class="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <p class="font-landing-mono text-xs uppercase tracking-[0.2em] text-landing-signal">
          Daftar Berlangganan
        </p>
        <h1 class="mt-3 max-w-xl font-display text-4xl tracking-tight sm:text-5xl">
          Lima menit, lalu tim kami yang lanjutkan.
        </h1>
        <p class="mt-4 max-w-lg text-landing-mist/70">
          Isi data di bawah — tim kami akan verifikasi dan hubungi kamu untuk jadwal survey dalam
          1x24 jam.
        </p>
      </div>
    </section>

    <!-- ============ FORM ============ -->
    <section class="bg-landing-mist">
      <div class="mx-auto max-w-2xl px-6 py-16">
        <!-- Sukses -->
        <div v-if="nomorPermohonanBerhasil" class="rounded-2xl bg-landing-paper p-10 text-center">
          <CheckCircle2 class="mx-auto size-12 text-success" />
          <h2 class="mt-4 font-display text-2xl text-landing-ink">Pendaftaran berhasil dikirim</h2>
          <p class="mt-2 text-sm text-landing-ink/60">
            Nomor permohonan kamu:
            <span class="font-landing-mono font-medium text-landing-ink">{{
              nomorPermohonanBerhasil
            }}</span>
          </p>
          <p class="mt-4 text-sm text-landing-ink/60">
            Simpan nomor ini. Tim kami akan menghubungi nomor HP yang kamu daftarkan untuk proses
            verifikasi dan jadwal survey.
          </p>
          <RouterLink
            to="/"
            class="mt-6 inline-flex items-center justify-center rounded-full bg-landing-ink px-6 py-3 text-sm font-medium text-landing-mist"
          >
            Kembali ke Beranda
          </RouterLink>
        </div>

        <!-- Form -->
        <form
          v-else
          class="space-y-10 rounded-2xl bg-landing-paper p-6 sm:p-8"
          novalidate
          @submit="onSubmit"
        >
          <!-- Data Diri -->
          <fieldset class="space-y-4">
            <legend class="font-display text-lg text-landing-ink">Data Diri</legend>
            <div class="space-y-2">
              <Label for="nama_lengkap">Nama Lengkap</Label>
              <Input
                id="nama_lengkap"
                v-model="namaLengkap"
                v-bind="namaLengkapAttrs"
                :aria-invalid="!!errors.nama_lengkap"
              />
              <p v-if="errors.nama_lengkap" class="text-xs text-destructive">
                {{ errors.nama_lengkap }}
              </p>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label for="nik">NIK</Label>
                <Input
                  id="nik"
                  v-model="nik"
                  v-bind="nikAttrs"
                  maxlength="16"
                  :aria-invalid="!!errors.nik"
                />
                <p v-if="errors.nik" class="text-xs text-destructive">{{ errors.nik }}</p>
              </div>
              <div class="space-y-2">
                <Label for="nomor_hp">Nomor HP</Label>
                <Input
                  id="nomor_hp"
                  v-model="nomorHp"
                  v-bind="nomorHpAttrs"
                  placeholder="08xxxxxxxxxx"
                  :aria-invalid="!!errors.nomor_hp"
                />
                <p v-if="errors.nomor_hp" class="text-xs text-destructive">{{ errors.nomor_hp }}</p>
              </div>
            </div>
            <div class="space-y-2">
              <Label for="email">Email <span class="text-muted-foreground">(opsional)</span></Label>
              <Input
                id="email"
                v-model="email"
                v-bind="emailAttrs"
                type="email"
                :aria-invalid="!!errors.email"
              />
              <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
            </div>
          </fieldset>

          <!-- Alamat -->
          <fieldset class="space-y-4">
            <legend class="font-display text-lg text-landing-ink">Alamat Pemasangan</legend>
            <div class="space-y-2">
              <Label for="alamat_pemasangan">Alamat Lengkap</Label>
              <Textarea
                id="alamat_pemasangan"
                v-model="alamatPemasangan"
                v-bind="alamatPemasanganAttrs"
              />
              <p v-if="errors.alamat_pemasangan" class="text-xs text-destructive">
                {{ errors.alamat_pemasangan }}
              </p>
            </div>
            <div class="grid gap-4 sm:grid-cols-3">
              <div class="space-y-2">
                <Label for="rt">RT</Label>
                <Input
                  id="rt"
                  v-model="rt"
                  v-bind="rtAttrs"
                  maxlength="3"
                  :aria-invalid="!!errors.rt"
                />
                <p v-if="errors.rt" class="text-xs text-destructive">{{ errors.rt }}</p>
              </div>
              <div class="space-y-2">
                <Label for="rw">RW</Label>
                <Input
                  id="rw"
                  v-model="rw"
                  v-bind="rwAttrs"
                  maxlength="3"
                  :aria-invalid="!!errors.rw"
                />
                <p v-if="errors.rw" class="text-xs text-destructive">{{ errors.rw }}</p>
              </div>
              <div class="space-y-2">
                <Label for="kode_pos">Kode Pos</Label>
                <Input
                  id="kode_pos"
                  v-model="kodePos"
                  v-bind="kodePosAttrs"
                  maxlength="5"
                  :aria-invalid="!!errors.kode_pos"
                />
                <p v-if="errors.kode_pos" class="text-xs text-destructive">{{ errors.kode_pos }}</p>
              </div>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label for="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  v-model="latitude"
                  v-bind="latitudeAttrs"
                  placeholder="-6.200000"
                  :aria-invalid="!!errors.latitude"
                />
                <p v-if="errors.latitude" class="text-xs text-destructive">{{ errors.latitude }}</p>
              </div>
              <div class="space-y-2">
                <Label for="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  v-model="longitude"
                  v-bind="longitudeAttrs"
                  placeholder="106.800000"
                  :aria-invalid="!!errors.longitude"
                />
                <p v-if="errors.longitude" class="text-xs text-destructive">
                  {{ errors.longitude }}
                </p>
              </div>
            </div>
            <p class="text-xs text-muted-foreground">
              Buka Google Maps di lokasi pemasangan, tekan lama titik lokasi, lalu salin dua angka
              koordinat yang muncul ke sini.
            </p>
          </fieldset>

          <!-- Paket -->
          <fieldset class="space-y-4">
            <legend class="font-display text-lg text-landing-ink">Paket</legend>
            <div class="space-y-2">
              <Label>Tipe Paket</Label>
              <Select v-model="tipePaket" v-bind="tipePaketAttrs">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="reguler">Paket Reguler</SelectItem>
                  <SelectItem value="custom">Custom (Konsultasi)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div v-if="values.tipe_paket === 'reguler'" class="space-y-2">
              <Label>Pilih Paket</Label>
              <Select v-model="paketInternetId" v-bind="paketInternetIdAttrs">
                <SelectTrigger><SelectValue placeholder="Pilih paket" /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="p in daftarPaket ?? []" :key="p.id" :value="String(p.id)">
                    {{ p.nama_paket }} — {{ p.kecepatan_mbps }} Mbps
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.paket_internet_id" class="text-xs text-destructive">
                {{ errors.paket_internet_id }}
              </p>
            </div>

            <template v-else>
              <div class="space-y-2">
                <Label for="nama_paket_custom">Nama Paket yang Diinginkan</Label>
                <Input
                  id="nama_paket_custom"
                  v-model="namaPaketCustom"
                  v-bind="namaPaketCustomAttrs"
                  placeholder="mis. Custom 150 Mbps"
                />
                <p v-if="errors.nama_paket_custom" class="text-xs text-destructive">
                  {{ errors.nama_paket_custom }}
                </p>
              </div>
              <div class="space-y-2">
                <Label for="kecepatan_custom_mbps">Perkiraan Kecepatan (Mbps)</Label>
                <Input
                  id="kecepatan_custom_mbps"
                  v-model="kecepatanCustomMbps"
                  v-bind="kecepatanCustomMbpsAttrs"
                  type="number"
                  min="1"
                />
                <p v-if="errors.kecepatan_custom_mbps" class="text-xs text-destructive">
                  {{ errors.kecepatan_custom_mbps }}
                </p>
              </div>
              <div class="space-y-2">
                <Label for="catatan_custom"
                  >Catatan Kebutuhan <span class="text-muted-foreground">(opsional)</span></Label
                >
                <Textarea
                  id="catatan_custom"
                  v-model="catatanCustom"
                  v-bind="catatanCustomAttrs"
                  placeholder="Ceritakan kebutuhan khusus kamu"
                />
              </div>
            </template>
          </fieldset>

          <!-- Dokumen -->
          <fieldset class="space-y-4">
            <legend class="font-display text-lg text-landing-ink">Dokumen</legend>
            <FileInputFoto v-model="fotoKtp" label="Foto KTP" :error="errors.foto_ktp" />
            <FileInputFoto
              v-model="fotoSelfieKtp"
              label="Foto Selfie dengan KTP"
              hint="Wajah dan KTP kamu harus sama-sama terlihat jelas."
              :error="errors.foto_selfie_ktp"
            />
          </fieldset>

          <Button
            type="submit"
            :disabled="isPending"
            class="w-full rounded-full bg-landing-signal py-6 text-landing-ink hover:bg-landing-signal/90"
          >
            {{ isPending ? 'Mengirim...' : 'Kirim Pendaftaran' }}
          </Button>
        </form>
      </div>
    </section>
  </div>
</template>
