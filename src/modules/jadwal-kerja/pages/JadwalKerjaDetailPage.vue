<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import {
  CheckCircle2,
  Copy,
  ImagePlus,
  X,
  MapPin,
  Crosshair,
  User,
  Phone,
  Mail,
  Wifi,
  ExternalLink,
} from 'lucide-vue-next'
import { hasilKerjaSchema } from '@/schemas/jadwal-kerja.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useIsiHasilKerja, useJadwalKerjaDetail } from '@/modules/jadwal-kerja/composables/useJadwalKerja'
import { hasilKerjaEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import type { RingkasanAktivasi } from '@/types/models'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string)

const { data: jadwal, isLoading } = useJadwalKerjaDetail(id)

const { handleSubmit, errors, defineField, setErrors, setFieldValue } = useForm({
  validationSchema: toTypedSchema(hasilKerjaSchema),
})
const [hasilField, hasilFieldAttrs] = defineField('hasil')
const [catatanKendala, catatanKendalaAttrs] = defineField('catatan_kendala')
const [latitudeHasil, latitudeHasilAttrs] = defineField('latitude_hasil')
const [longitudeHasil, longitudeHasilAttrs] = defineField('longitude_hasil')

const fotoInputRef = ref<HTMLInputElement | null>(null)
const fotoFiles = shallowRef<File[]>([])
const previewUrls = ref<string[]>([])
const isImageOpen = ref(false)
const selectedImage = ref<string | null>(null)
const cariKoordinat = ref(false)

const { mutate, isPending } = useIsiHasilKerja()
const ringkasanAktivasi = ref<RingkasanAktivasi | null>(null)

const STORAGE_BASE = 'https://hrwyxwwtbpmtrxhdlvud.supabase.co/storage/v1/object/public/wifi-storage/'

function urlFoto(path?: string | null): string | null {
  if (!path) return null
  return path.startsWith('http') ? path : `${STORAGE_BASE}${path}`
}

function onPilihFoto(event: Event) {
  const files = Array.from((event.target as HTMLInputElement).files || [])
  if (!files.length) return

  const sisaSlot = 3 - fotoFiles.value.length
  const diterima = files.slice(0, sisaSlot)
  if (diterima.length < files.length) {
    toast.warning('Maksimal 3 foto dokumentasi.')
  }

  fotoFiles.value = [...fotoFiles.value, ...diterima]
  setFieldValue('foto_dokumentasi', fotoFiles.value)
  previewUrls.value.forEach((u) => URL.revokeObjectURL(u))
  previewUrls.value = fotoFiles.value.map((f) => URL.createObjectURL(f))
}

function hapusFoto(index: number) {
  URL.revokeObjectURL(previewUrls.value[index])
  fotoFiles.value.splice(index, 1)
  previewUrls.value.splice(index, 1)
  setFieldValue('foto_dokumentasi', fotoFiles.value.length ? fotoFiles.value : undefined)
  if (fotoInputRef.value) fotoInputRef.value.value = ''
}

function bukaGambar(url: string) {
  selectedImage.value = url
  isImageOpen.value = true
}

function gunakanLokasiSaya() {
  if (!navigator.geolocation) {
    toast.error('Browser kamu tidak mendukung geolokasi.')
    return
  }
  cariKoordinat.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setFieldValue('latitude_hasil', pos.coords.latitude.toFixed(7))
      setFieldValue('longitude_hasil', pos.coords.longitude.toFixed(7))
      cariKoordinat.value = false
      toast.success('Koordinat lokasi diambil.')
    },
    () => {
      cariKoordinat.value = false
      toast.error('Gagal mengambil lokasi. Isi manual atau izinkan akses lokasi.')
    },
    { enableHighAccuracy: true, timeout: 10000 },
  )
}

function bukaMaps(lat: string, lng: string) {
  window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')
}

const onSubmit = handleSubmit((values) => {
  const formData = new FormData()
  formData.append('hasil', values.hasil)
  if (values.catatan_kendala) formData.append('catatan_kendala', values.catatan_kendala)
  if (fotoFiles.value.length) {
    fotoFiles.value.forEach((f) => formData.append('foto_dokumentasi[]', f))
  }
  if (values.latitude_hasil) formData.append('latitude_hasil', values.latitude_hasil)
  if (values.longitude_hasil) formData.append('longitude_hasil', values.longitude_hasil)

  mutate(
    { id: id.value, payload: formData },
    {
      onSuccess: ({ data }) => {
        if (data.data.ringkasan_aktivasi) {
          ringkasanAktivasi.value = data.data.ringkasan_aktivasi
        } else {
          toast.success('Kendala dicatat — Operasional akan jadwalkan ulang.')
          router.push('/admin/teknisi/jadwal-kerja')
        }
      },
      onError: (error) => {
        const fieldErrors = mapValidationErrors(error)
        if (fieldErrors) setErrors(fieldErrors)
        else toast.error('Terjadi kesalahan, coba lagi.')
      },
    },
  )
})

function salinUsername() {
  if (!ringkasanAktivasi.value?.nomor_pelanggan) return
  navigator.clipboard.writeText(ringkasanAktivasi.value.nomor_pelanggan)
  toast.success('Username disalin.')
}

const permohonan = computed(() => jadwal.value?.permohonan_layanan)
const pelanggan = computed(() => permohonan.value?.pelanggan)
const koordinatHasil = computed(() => jadwal.value?.latitude_hasil && jadwal.value?.longitude_hasil)

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'long' })
}
</script>

<template>
  <div v-if="isLoading" class="space-y-4">
    <Skeleton class="h-8 w-64" />
    <Skeleton class="h-40 w-full" />
  </div>

  <!-- Kartu ringkasan aktivasi — muncul begitu teknisi tandai "Selesai", TETAP
       di layar (bukan auto-redirect) supaya bisa dibacakan ke pelanggan di lokasi. -->
  <div v-else-if="ringkasanAktivasi" class="max-w-md space-y-6">
    <Card class="border-success">
      <CardHeader>
        <div class="flex items-center gap-2 text-success">
          <CheckCircle2 class="size-5" />
          <CardTitle class="text-base">Pemasangan Selesai — Layanan Aktif</CardTitle>
        </div>
      </CardHeader>
      <CardContent class="space-y-4 text-sm">
        <div>
          <p class="text-muted-foreground">Username / Nomor Pelanggan</p>
          <div class="flex items-center gap-2">
            <p class="font-mono text-lg font-semibold">{{ ringkasanAktivasi.nomor_pelanggan }}</p>
            <Button type="button" variant="ghost" size="icon" @click="salinUsername">
              <Copy class="size-4" />
            </Button>
          </div>
        </div>
        <div>
          <p class="text-muted-foreground">Pelanggan</p>
          <p class="font-medium">{{ ringkasanAktivasi.nama_pelanggan }}</p>
        </div>
        <div>
          <p class="text-muted-foreground">Paket</p>
          <p>{{ ringkasanAktivasi.nama_paket }} ({{ ringkasanAktivasi.kecepatan_mbps }} Mbps)</p>
        </div>
        <div>
          <p class="text-muted-foreground">Status</p>
          <p class="capitalize">{{ ringkasanAktivasi.status }}</p>
        </div>
        <p class="rounded-md bg-muted p-3 text-xs text-muted-foreground">
          Sampaikan ke pelanggan: username di atas dipakai untuk login pertama kali di dashboard
          pelanggan (bersama nomor HP terdaftar), lalu pelanggan akan diminta buat password sendiri.
        </p>
      </CardContent>
    </Card>
    <Button class="w-full" @click="router.push('/admin/teknisi/jadwal-kerja')">
      Kembali ke Daftar Jadwal Kerja
    </Button>
  </div>

  <div v-else-if="jadwal" class="max-w-xl space-y-6">
    <Card>
      <CardHeader>
        <div class="flex items-center gap-2">
          <CardTitle>{{ permohonan?.nomor_permohonan }}</CardTitle>
          <StatusBadge v-if="jadwal.hasil" :value="jadwal.hasil" :map="hasilKerjaEnum" />
        </div>
        <p class="text-sm text-muted-foreground">{{ formatTanggal(jadwal.tanggal_kerja) }}</p>
      </CardHeader>
      <CardContent class="space-y-4 text-sm">
        <div>
          <p class="flex items-center gap-1.5 text-muted-foreground">
            <User class="size-4" /> Info Pelanggan
          </p>
          <div class="mt-1.5 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            <p class="font-medium">{{ pelanggan?.nama_lengkap ?? '-' }}</p>
            <p>{{ pelanggan?.nomor_pelanggan ?? '—' }}</p>
            <p class="flex items-center gap-1.5">
              <Phone class="size-3.5 text-muted-foreground" /> {{ pelanggan?.nomor_hp ?? '-' }}
            </p>
            <p class="flex items-center gap-1.5">
              <Mail class="size-3.5 text-muted-foreground" /> {{ pelanggan?.email ?? '-' }}
            </p>
          </div>
        </div>

        <div>
          <p class="flex items-center gap-1.5 text-muted-foreground">
            <MapPin class="size-4" /> Alamat Pemasangan
          </p>
          <p class="mt-1">{{ permohonan?.alamat_pemasangan }}, RT {{ permohonan?.rt }}/RW {{ permohonan?.rw }}, {{ permohonan?.kode_pos }}</p>
          <p v-if="permohonan?.detail_alamat" class="text-muted-foreground">Detail: {{ permohonan.detail_alamat }}</p>
        </div>

        <div>
          <p class="flex items-center gap-1.5 text-muted-foreground">
            <Wifi class="size-4" /> Paket
          </p>
          <p v-if="permohonan?.paket_internet" class="mt-1">
            {{ permohonan.paket_internet.nama_paket }} ({{ permohonan.paket_internet.kecepatan_mbps }} Mbps)
          </p>
          <p v-else-if="permohonan?.tipe_paket === 'custom'" class="mt-1">
            {{ permohonan.nama_paket_custom }} ({{ permohonan.kecepatan_custom_mbps }} Mbps)
          </p>
        </div>

        <div>
          <p class="text-muted-foreground">Rekan Satu Tim</p>
          <p>{{ (jadwal.teknisi ?? []).map((t) => t.nama_lengkap).join(', ') || '-' }}</p>
        </div>
      </CardContent>
    </Card>

    <Card v-if="jadwal.hasil">
      <CardHeader>
        <CardTitle class="text-base">Hasil Kunjungan</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3 text-sm">
        <StatusBadge :value="jadwal.hasil" :map="hasilKerjaEnum" />
        <p v-if="jadwal.catatan_kendala" class="text-muted-foreground">{{ jadwal.catatan_kendala }}</p>
        <div v-if="jadwal.foto_dokumentasi?.length" class="flex flex-wrap gap-3">
          <img
            v-for="(foto, i) in jadwal.foto_dokumentasi"
            :key="i"
            :src="urlFoto(foto) ?? ''"
            alt="Dokumentasi pekerjaan"
            class="h-28 w-28 cursor-pointer rounded-md border object-cover hover:opacity-80"
            @click="bukaGambar(urlFoto(foto)!)"
          />
        </div>
        <div v-if="koordinatHasil" class="flex items-center gap-2">
          <Crosshair class="size-4 text-muted-foreground" />
          <p>{{ jadwal.latitude_hasil }}, {{ jadwal.longitude_hasil }}</p>
          <Button variant="ghost" size="sm" class="gap-1 px-2" @click="bukaMaps(jadwal.latitude_hasil!, jadwal.longitude_hasil!)">
            <ExternalLink class="size-3.5" /> Maps
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card v-else>
      <CardHeader>
        <CardTitle class="text-base">Isi Hasil Kunjungan</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" novalidate @submit="onSubmit">
          <div class="space-y-2">
            <Label>Hasil</Label>
            <Select v-model="hasilField" v-bind="hasilFieldAttrs">
              <SelectTrigger><SelectValue placeholder="Pilih hasil" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="selesai">Selesai — Pasang Berhasil</SelectItem>
                <SelectItem value="kendala">Ada Kendala</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.hasil" class="text-xs text-destructive">{{ errors.hasil }}</p>
          </div>

          <div v-if="hasilField === 'selesai'" class="space-y-2">
            <Label>Dokumentasi Pekerjaan <span class="text-muted-foreground">(1–3 foto)</span></Label>
            <p class="text-xs text-muted-foreground">
              Wajib minimal 1 foto hasil pemasangan yang sudah selesai.
            </p>
            <div class="flex flex-wrap gap-3">
              <div v-for="(url, index) in previewUrls" :key="index" class="relative w-fit">
                <img
                  :src="url"
                  alt="Preview dokumentasi"
                  class="h-28 w-28 cursor-pointer rounded-lg border object-cover hover:opacity-80"
                  @click="bukaGambar(url)"
                />
                <button
                  type="button"
                  class="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                  aria-label="Hapus foto"
                  @click="hapusFoto(index)"
                >
                  <X class="size-3.5" />
                </button>
              </div>
              <label
                for="foto_dokumentasi"
                class="flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed text-xs text-muted-foreground hover:bg-muted/50"
              >
                <ImagePlus class="size-6" />
                Tambah Foto
              </label>
            </div>
            <input
              id="foto_dokumentasi"
              ref="fotoInputRef"
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              class="hidden"
              @change="onPilihFoto"
            />
            <p v-if="errors.foto_dokumentasi" class="text-xs text-destructive">{{ errors.foto_dokumentasi }}</p>
          </div>

          <div v-if="hasilField === 'selesai'" class="space-y-2">
            <Label>Titik Koordinat Hasil Pekerjaan</Label>
            <p class="text-xs text-muted-foreground">
              Lokasi akurat tempat pekerjaan selesai — dipakai sebagai koordinat layanan pelanggan.
            </p>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <Label for="latitude_hasil" class="text-xs text-muted-foreground">Latitude</Label>
                <Input
                  id="latitude_hasil"
                  v-model="latitudeHasil"
                  v-bind="latitudeHasilAttrs"
                  placeholder="-7.2500000"
                />
              </div>
              <div class="space-y-1.5">
                <Label for="longitude_hasil" class="text-xs text-muted-foreground">Longitude</Label>
                <Input
                  id="longitude_hasil"
                  v-model="longitudeHasil"
                  v-bind="longitudeHasilAttrs"
                  placeholder="112.7500000"
                />
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" class="gap-1.5" :disabled="cariKoordinat" @click="gunakanLokasiSaya">
              <Crosshair class="size-4" /> {{ cariKoordinat ? 'Mencari lokasi...' : 'Gunakan Lokasi Saya' }}
            </Button>
            <p v-if="errors.latitude_hasil" class="text-xs text-destructive">{{ errors.latitude_hasil }}</p>
          </div>

          <div class="space-y-2">
            <Label for="catatan_kendala">Catatan</Label>
            <Textarea
              id="catatan_kendala"
              v-model="catatanKendala"
              v-bind="catatanKendalaAttrs"
              placeholder="Wajib diisi kalau ada kendala — mis. akses rumah, tiang penuh, pelanggan tidak di tempat"
            />
            <p v-if="errors.catatan_kendala" class="text-xs text-destructive">{{ errors.catatan_kendala }}</p>
          </div>

          <Button type="submit" class="w-full" :disabled="isPending">
            {{ isPending ? 'Menyimpan...' : 'Simpan Hasil' }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <!-- Popup Modal Gambar -->
    <div
      v-if="isImageOpen && selectedImage"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 cursor-zoom-out"
      @click="isImageOpen = false; selectedImage = null"
    >
      <img
        :src="selectedImage"
        alt="Preview Foto Full"
        class="max-h-[90vh] max-w-[90vw] rounded-md object-contain"
      />
    </div>
  </div>
</template>