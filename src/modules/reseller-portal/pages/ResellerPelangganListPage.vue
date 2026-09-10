<script setup lang="ts">
import { h, ref, computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { RouterLink } from 'vue-router'
import { toast } from 'vue-sonner'
import { Plus, Contact } from 'lucide-vue-next'
import type { ColumnDef } from '@tanstack/vue-table'

import { daftarkanPelangganSchema } from '@/schemas/reseller-portal.schema'
import { mapValidationErrors } from '@/lib/errors'
import { getResellerPaketInternetList } from '@/modules/paket-internet/api/reseller/resellerPaketInternet.api'
import LocationPicker from '@/modules/pendaftaran/components/PemilihanLokasi.vue'
import { useResellerPelangganList, useDaftarkanPelanggan } from '../composables/useResellerPortal'

import type { Pelanggan } from '@/types/models'

import DataTable from '@/components/data/DataTable.vue'
import Pagination from '@/components/data/Pagination.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'

const { data: hasil, isLoading } = useResellerPelangganList()

type KategoriPelanggan = 'aktif' | 'baru'

const kategori = ref<KategoriPelanggan>('aktif')

const semuaPelanggan = computed(() => hasil.value?.data ?? [])

const pelangganAktif = computed(() => {
  return semuaPelanggan.value.filter((pelanggan) => {
    const layanan = pelanggan.layanan_internet?.[0]

    return (
      layanan?.status === 'aktif' &&
      (layanan.tagihan?.length ?? 0) > 0
    )
  })
})

const pelangganBaru = computed(() => {
  return semuaPelanggan.value.filter((pelanggan) => {
    const layanan = pelanggan.layanan_internet?.[0]

    return (
      layanan?.status === 'aktif' &&
      (layanan.tagihan?.length ?? 0) === 0
    )
  })
})

const pelangganDitampilkan = computed(() => {
  return kategori.value === 'aktif'
    ? pelangganAktif.value
    : pelangganBaru.value
})

const columns: ColumnDef<Pelanggan, unknown>[] = [
  {
    accessorKey: 'nama_lengkap',
    header: 'Nama',
  },
  {
    accessorKey: 'nik',
    header: 'NIK',
  },
  {
    accessorKey: 'nomor_hp',
    header: 'No. HP',
  },
  {
    id: 'paket',
    header: 'Paket',
    cell: ({ row }) => {
      const layanan = row.original.layanan_internet?.[0]

      if (!layanan) {
        return '-'
      }

      return layanan.paket_internet?.nama_paket ?? '-'
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.layanan_internet?.[0]?.status

      if (!status) {
        return h(Badge, { variant: 'warning' }, () => 'Belum Aktif')
      }

      return h(StatusBadge, {
        value: status,
        map: {
          aktif: {
            label: 'Aktif',
            badgeVariant: 'success',
          },
          nonaktif: {
            label: 'Nonaktif',
            badgeVariant: 'secondary',
          },
        },
      })
    },
  },
  {
    id: 'aksi',
    header: '',
    cell: ({ row }) =>
      h(
        Button,
        {
          as: RouterLink,
          to: `/reseller/pelanggan/${row.original.id}`,
          variant: 'ghost',
          size: 'sm',
        },
        () => 'Detail',
      ),
  },
]

// -----------------------------------------------------------------------------
// FORM DAFTARKAN PELANGGAN
// -----------------------------------------------------------------------------

const { data: paketList } = useQuery({
  queryKey: ['paket-internet', 'reseller', 'options'],
  queryFn: () =>
    getResellerPaketInternetList().then((res) => res.data.data),
})

const paketTersedia = computed(() =>
  (paketList.value ?? []).filter((paket) => paket.status_aktif),
)

const queryClient = useQueryClient()

const showDialog = ref(false)

const fotoKtp = ref<File | null>(null)
const fotoSelfie = ref<File | null>(null)

const {
  handleSubmit,
  errors,
  defineField,
  resetForm,
  setErrors,
} = useForm({
  validationSchema: toTypedSchema(daftarkanPelangganSchema),
})

const [namaLengkap, namaLengkapAttrs] = defineField('nama_lengkap')
const [nik, nikAttrs] = defineField('nik')
const [nomorHp, nomorHpAttrs] = defineField('nomor_hp')
const [email, emailAttrs] = defineField('email')
const [alamat, alamatAttrs] = defineField('alamat_pemasangan')
const [detailAlamat, detailAlamatAttrs] = defineField('detail_alamat')
const [provinsi, provinsiAttrs] = defineField('provinsi')
const [kota, kotaAttrs] = defineField('kota')
const [paketId, paketIdAttrs] = defineField('paket_internet_id')
const [latitude, latitudeAttrs] = defineField('latitude')
const [longitude, longitudeAttrs] = defineField('longitude')

// Model lokasi peta (diisi oleh LocationPicker). Disinkronkan ke vee-validate.
const lokasiPeta = ref<{ lat: number; lng: number; address?: string; provinsi?: string; kota?: string } | null>(null)

watch(fotoKtp, (f) => setFieldValue('foto_ktp', f ?? undefined))
watch(fotoSelfie, (f) => setFieldValue('foto_selfie_ktp', f ?? undefined))
watch(lokasiPeta, (l) => {
  setFieldValue('latitude', l?.lat)
  setFieldValue('longitude', l?.lng)
  if (l?.address) setFieldValue('alamat_pemasangan', l.address)
  setFieldValue('provinsi', l?.provinsi ?? undefined)
  setFieldValue('kota', l?.kota ?? undefined)
})

function onFileKtp(event: Event) {
  const input = event.target as HTMLInputElement
  fotoKtp.value = input.files?.[0] ?? null
}

function onFileSelfie(event: Event) {
  const input = event.target as HTMLInputElement
  fotoSelfie.value = input.files?.[0] ?? null
}

function resetFormState() {
  resetForm()

  fotoKtp.value = null
  fotoSelfie.value = null
  lokasiPeta.value = null
  setFieldValue('latitude', undefined)
  setFieldValue('longitude', undefined)
}

const { mutate, isPending } = useDaftarkanPelanggan()

const onSubmit = handleSubmit((formValues) => {
  mutate(
    {
      form: formValues,
      fotoKtp: fotoKtp.value,
      fotoSelfie: fotoSelfie.value,
    },
    {
      onSuccess: ({ data }) => {
        toast.success(
          `${data.data.nama_lengkap} berhasil didaftarkan. Nomor pelanggan: ${data.data.nomor_pelanggan}`,
        )

        showDialog.value = false
        resetFormState()

        queryClient.invalidateQueries({
          queryKey: ['reseller-portal'],
        })
      },

      onError: (error) => {
        const fieldErrors = mapValidationErrors(error)

        if (fieldErrors) {
          setErrors(fieldErrors)
          return
        }

        toast.error('Terjadi kesalahan saat mendaftarkan pelanggan.')
      },
    },
  )
})
</script>

<template>
  <div class="space-y-4">
    <!-- HEADER -->
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">
        Pelanggan
      </h1>

      <Button size="sm" class="gap-1.5" @click="showDialog = true">
        <Plus class="size-4" />
        Daftarkan Pelanggan
      </Button>
    </div>

    <div class="flex items-center gap-2 border-b">
      <button type="button" class="relative px-4 py-2 text-sm font-medium transition" :class="kategori === 'aktif'
        ? 'text-primary'
        : 'text-muted-foreground hover:text-foreground'
        " @click="kategori = 'aktif'">
        Pelanggan Aktif

        <span class="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
          {{ pelangganAktif.length }}
        </span>

        <span v-if="kategori === 'aktif'" class="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
      </button>

      <button type="button" class="relative px-4 py-2 text-sm font-medium transition" :class="kategori === 'baru'
        ? 'text-primary'
        : 'text-muted-foreground hover:text-foreground'
        " @click="kategori = 'baru'">
        Pelanggan Baru

        <span class="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
          {{ pelangganBaru.length }}
        </span>

        <span v-if="kategori === 'baru'" class="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
      </button>
    </div>

    <!-- TABLE -->
    <DataTable :columns="columns" :data="pelangganDitampilkan" :loading="isLoading" :empty-judul="kategori === 'aktif'
        ? 'Belum ada pelanggan aktif'
        : 'Belum ada pelanggan baru'
      " :empty-deskripsi="kategori === 'aktif'
      ? 'Pelanggan akan masuk ke kategori ini setelah memiliki tagihan pertama.'
      : 'Pelanggan baru adalah pelanggan dengan layanan aktif yang belum memiliki tagihan pertama.'
    " />

    <Pagination v-if="hasil" :meta="hasil" />

    <!-- FORM DIALOG -->
    <Dialog :open="showDialog" @update:open="(value) => (showDialog = value)">
      <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Contact class="size-5" />
            Daftarkan Pelanggan
          </DialogTitle>

          <DialogDescription>
            Tambahkan pelanggan baru dan pilih paket internet milik reseller Anda.
            Setelah berhasil didaftarkan, layanan pelanggan langsung aktif.
          </DialogDescription>
        </DialogHeader>

        <form id="form-daftarkan-pelanggan" class="space-y-4" novalidate @submit="onSubmit">
          <!-- NAMA -->
          <div class="space-y-2">
            <Label for="nama_lengkap">
              Nama Lengkap
            </Label>

            <Input id="nama_lengkap" v-model="namaLengkap" v-bind="namaLengkapAttrs" placeholder="mis. Andi Test"
              :aria-invalid="!!errors.nama_lengkap" />

            <p v-if="errors.nama_lengkap" class="text-xs text-destructive">
              {{ errors.nama_lengkap }}
            </p>
          </div>

          <!-- NIK + NO HP -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="nik">
                NIK
              </Label>

              <Input id="nik" v-model="nik" v-bind="nikAttrs" inputmode="numeric" maxlength="16" placeholder="16 digit"
                :aria-invalid="!!errors.nik" />

              <p v-if="errors.nik" class="text-xs text-destructive">
                {{ errors.nik }}
              </p>
            </div>

            <div class="space-y-2">
              <Label for="nomor_hp">
                No. HP
              </Label>

              <Input id="nomor_hp" v-model="nomorHp" v-bind="nomorHpAttrs" placeholder="mis. 081234567890"
                :aria-invalid="!!errors.nomor_hp" />

              <p v-if="errors.nomor_hp" class="text-xs text-destructive">
                {{ errors.nomor_hp }}
              </p>
            </div>
          </div>

          <!-- EMAIL -->
          <div class="space-y-2">
            <Label for="email">
              Email
              <span class="text-muted-foreground">(opsional)</span>
            </Label>

            <Input id="email" v-model="email" v-bind="emailAttrs" type="email" placeholder="email@contoh.com"
              :aria-invalid="!!errors.email" />

            <p v-if="errors.email" class="text-xs text-destructive">
              {{ errors.email }}
            </p>
          </div>

          <!-- ALAMAT -->
          <div class="space-y-2">
            <Label for="alamat">
              Alamat Pemasangan
            </Label>

            <Textarea id="alamat" v-model="alamat" v-bind="alamatAttrs" placeholder="Alamat lokasi pemasangan"
              :aria-invalid="!!errors.alamat_pemasangan" />

            <p v-if="errors.alamat_pemasangan" class="text-xs text-destructive">
              {{ errors.alamat_pemasangan }}
            </p>
          </div>

          <!-- DETAIL ALAMAT -->
          <div class="space-y-2">
            <Label for="detail_alamat">
              Detail Alamat
              <span class="text-muted-foreground">(opsional)</span>
            </Label>

            <Textarea id="detail_alamat" v-model="detailAlamat" v-bind="detailAlamatAttrs"
              placeholder="Contoh: rumah warna putih, dekat masjid, lantai 2" :aria-invalid="!!errors.detail_alamat" />

            <p v-if="errors.detail_alamat" class="text-xs text-destructive">
              {{ errors.detail_alamat }}
            </p>
          </div>

          <!-- PROVINSI + KOTA -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="provinsi">
                Provinsi
                <span class="text-muted-foreground">(opsional)</span>
              </Label>

              <Input id="provinsi" v-model="provinsi" v-bind="provinsiAttrs" placeholder="Jawa Barat" />

              <p v-if="errors.provinsi" class="text-xs text-destructive">
                {{ errors.provinsi }}
              </p>
            </div>

            <div class="space-y-2">
              <Label for="kota">
                Kota/Kabupaten
                <span class="text-muted-foreground">(opsional)</span>
              </Label>

              <Input id="kota" v-model="kota" v-bind="kotaAttrs" placeholder="Bandung" />

              <p v-if="errors.kota" class="text-xs text-destructive">
                {{ errors.kota }}
              </p>
            </div>
          </div>

          <!-- LOKASI PEMASANGAN (MAP) -->
          <div class="space-y-2">
            <Label>Titik Lokasi Pemasangan</Label>
            <p class="text-xs text-muted-foreground">
              Klik peta atau gunakan tombol Deteksi Lokasi untuk mengisi alamat otomatis.
            </p>
            <div class="h-72 w-full overflow-hidden rounded-md border">
              <LocationPicker v-model="lokasiPeta" class="h-full w-full" />
            </div>
            <input type="hidden" v-bind="latitudeAttrs" :value="latitude" />
            <input type="hidden" v-bind="longitudeAttrs" :value="longitude" />
            <p v-if="errors.latitude || errors.longitude" class="text-xs text-destructive">
              Pilih lokasi di peta dulu ya.
            </p>
            <p v-else class="text-xs text-muted-foreground">
              Koordinat akan terkirim otomatis dari poin yang dipilih.
            </p>
          </div>

          <!-- PAKET -->
          <div class="space-y-2">
            <Label>
              Paket Internet
            </Label>

            <Select v-model="paketId" v-bind="paketIdAttrs">
              <SelectTrigger>
                <SelectValue placeholder="Pilih paket internet" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem v-for="paket in paketTersedia" :key="paket.id" :value="String(paket.id)">
                  {{ paket.nama_paket }}
                  —
                  {{ paket.kecepatan_mbps }} Mbps
                </SelectItem>
              </SelectContent>
            </Select>

            <p v-if="errors.paket_internet_id" class="text-xs text-destructive">
              {{ errors.paket_internet_id }}
            </p>

            <p v-if="!paketTersedia.length" class="text-xs text-muted-foreground">
              Belum ada paket aktif. Buat paket terlebih dahulu di menu
              Paket Internet.
            </p>
          </div>

          <!-- KTP -->
          <div class="space-y-2">
            <Label for="foto_ktp">
              Foto KTP
              <span class="text-muted-foreground">(opsional)</span>
            </Label>

            <Input id="foto_ktp" type="file" accept="image/*" @change="onFileKtp" />
          </div>

          <!-- SELFIE -->
          <div class="space-y-2">
            <Label for="foto_selfie">
              Foto Selfie + KTP
              <span class="text-muted-foreground">(opsional)</span>
            </Label>

            <Input id="foto_selfie" type="file" accept="image/*" @change="onFileSelfie" />
          </div>
        </form>

        <DialogFooter class="gap-2 sm:gap-0">
          <Button variant="outline" :disabled="isPending" @click="showDialog = false">
            Batal
          </Button>

          <Button type="submit" form="form-daftarkan-pelanggan" :disabled="isPending || !paketTersedia.length || !lokasiPeta">
            {{ isPending ? 'Menyimpan...' : 'Daftarkan' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>