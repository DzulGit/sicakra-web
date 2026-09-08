<script setup lang="ts">
import { h, ref, computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { RouterLink } from 'vue-router'
import { toast } from 'vue-sonner'
import { Plus, Contact, MapPin } from 'lucide-vue-next'
import type { ColumnDef } from '@tanstack/vue-table'
import { daftarkanPelangganSchema } from '@/schemas/reseller-portal.schema'
import { mapValidationErrors } from '@/lib/errors'
import { getPaketInternetList } from '@/modules/paket-internet/api/paketInternet.api'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'

const { data: hasil, isLoading } = useResellerPelangganList()

const columns: ColumnDef<Pelanggan, unknown>[] = [
  { accessorKey: 'nama_lengkap', header: 'Nama' },
  { accessorKey: 'nik', header: 'NIK' },
  { accessorKey: 'nomor_hp', header: 'No. HP' },
  {
    id: 'paket',
    header: 'Paket',
    cell: ({ row }) => {
      const layanan = row.original.layanan_internet?.[0]
      if (!layanan) return '-'
      if (layanan.tipe_paket === 'custom') return layanan.nama_paket_custom ?? 'Custom'
      return layanan.paket_internet?.nama_paket ?? '-'
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const s = row.original.layanan_internet?.[0]?.status
      if (!s) return h(Badge, { variant: 'warning' }, () => 'Belum Aktif')
      return h(StatusBadge, {
        value: s,
        map: {
          aktif: { label: 'Aktif', badgeVariant: 'success' },
          nonaktif: { label: 'Nonaktif', badgeVariant: 'secondary' },
        },
      })
    },
  },
  {
    id: 'aksi',
    header: '',
    cell: ({ row }) => h(Button, { as: RouterLink, to: `/reseller/pelanggan/${row.original.id}`, variant: 'ghost', size: 'sm' }, () => 'Detail'),
  },
]

// ---- form daftarkan pelanggan ----
const { data: paketList } = useQuery({
  queryKey: ['paket-internet', 'options'],
  queryFn: () => getPaketInternetList().then((res) => res.data.data),
})
const queryClient = useQueryClient()

const showDialog = ref(false)
const fotoKtp = ref<File | null>(null)
const fotoSelfie = ref<File | null>(null)
const { handleSubmit, errors, defineField, resetForm, setErrors } = useForm({
  validationSchema: toTypedSchema(daftarkanPelangganSchema),
  initialValues: { tipe_paket: 'reguler' },
})
const [namaLengkap, namaLengkapAttrs] = defineField('nama_lengkap')
const [nik, nikAttrs] = defineField('nik')
const [nomorHp, nomorHpAttrs] = defineField('nomor_hp')
const [email, emailAttrs] = defineField('email')
const [alamat, alamatAttrs] = defineField('alamat_pemasangan')
const [provinsi, provinsiAttrs] = defineField('provinsi')
const [kota, kotaAttrs] = defineField('kota')
const [tipePaket, tipePaketAttrs] = defineField('tipe_paket')
const [paketId, paketIdAttrs] = defineField('paket_internet_id')
const [namaCustom, namaCustomAttrs] = defineField('nama_paket_custom')
const [kecepatanCustom, kecepatanCustomAttrs] = defineField('kecepatan_custom_mbps')
const [catatanCustom, catatanCustomAttrs] = defineField('catatan_custom')

const isCustom = computed(() => tipePaket.value === 'custom')
const paketTersedia = computed(() => (paketList.value ?? []).filter((p) => p.status_aktif))

function onFileKtp(e: Event) {
  const el = e.target as HTMLInputElement
  fotoKtp.value = el.files?.[0] ?? null
}

function onFileSelfie(e: Event) {
  const el = e.target as HTMLInputElement
  fotoSelfie.value = el.files?.[0] ?? null
}

const { mutate, isPending } = useDaftarkanPelanggan()

const onSubmit = handleSubmit((formValues) => {
  mutate(
    { form: formValues, fotoKtp: fotoKtp.value, fotoSelfie: fotoSelfie.value },
    {
      onSuccess: ({ data }) => {
        toast.success(`${data.data.nama_lengkap} berhasil didaftarkan (${data.data.nomor_permohonan}). Menunggu verifikasi.`)
        showDialog.value = false
        resetForm()
        fotoKtp.value = null
        fotoSelfie.value = null
        queryClient.invalidateQueries({ queryKey: ['reseller-portal'] })
      },
      onError: (error) => {
        const fieldErrors = mapValidationErrors(error)
        if (fieldErrors) setErrors(fieldErrors)
        else toast.error('Terjadi kesalahan, coba lagi.')
      },
    },
  )
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Pelanggan</h1>
      <Button size="sm" class="gap-1.5" @click="showDialog = true">
        <Plus class="size-4" /> Daftarkan Pelanggan
      </Button>
    </div>

    <DataTable
      :columns="columns"
      :data="hasil?.data ?? []"
      :loading="isLoading"
      empty-judul="Belum ada pelanggan"
      empty-deskripsi="Daftarkan pelanggan Anda untuk mulai dikelola di sini."
    />
    <Pagination v-if="hasil" :meta="hasil" />

    <Dialog :open="showDialog" @update:open="(v) => (showDialog = v)">
      <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Contact class="size-5" /> Daftarkan Pelanggan
          </DialogTitle>
          <DialogDescription>
            Pelanggan tercatat atas nama reseller Anda dan butuh verifikasi operasional sebelum aktif.
          </DialogDescription>
        </DialogHeader>

        <form id="form-daftarkan-pelanggan" class="space-y-4" novalidate @submit="onSubmit">
          <div class="space-y-2">
            <Label for="nama_lengkap">Nama Lengkap</Label>
            <Input id="nama_lengkap" v-model="namaLengkap" v-bind="namaLengkapAttrs" placeholder="mis. Andi Test" :aria-invalid="!!errors.nama_lengkap" />
            <p v-if="errors.nama_lengkap" class="text-xs text-destructive">{{ errors.nama_lengkap }}</p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="nik">NIK</Label>
              <Input id="nik" v-model="nik" v-bind="nikAttrs" inputmode="numeric" maxlength="16" placeholder="16 digit" :aria-invalid="!!errors.nik" />
              <p v-if="errors.nik" class="text-xs text-destructive">{{ errors.nik }}</p>
            </div>
            <div class="space-y-2">
              <Label for="nomor_hp">No. HP</Label>
              <Input id="nomor_hp" v-model="nomorHp" v-bind="nomorHpAttrs" placeholder="mis. 081234567890" :aria-invalid="!!errors.nomor_hp" />
              <p v-if="errors.nomor_hp" class="text-xs text-destructive">{{ errors.nomor_hp }}</p>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input id="email" v-model="email" v-bind="emailAttrs" type="email" placeholder="email@contoh.com" :aria-invalid="!!errors.email" />
            <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
          </div>

          <div class="space-y-2">
            <Label for="alamat">Alamat Pemasangan</Label>
            <Textarea id="alamat" v-model="alamat" v-bind="alamatAttrs" placeholder="Alamat lokasi pemasangan" :aria-invalid="!!errors.alamat_pemasangan" />
            <p v-if="errors.alamat_pemasangan" class="text-xs text-destructive">{{ errors.alamat_pemasangan }}</p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="provinsi">Provinsi</Label>
              <Input id="provinsi" v-model="provinsi" v-bind="provinsiAttrs" />
            </div>
            <div class="space-y-2">
              <Label for="kota">Kota/Kabupaten</Label>
              <Input id="kota" v-model="kota" v-bind="kotaAttrs" />
            </div>
          </div>

          <div class="space-y-2">
            <Label>Tipe Paket</Label>
            <div class="flex gap-2">
              <Button type="button" size="sm" :variant="tipePaket === 'reguler' ? 'default' : 'outline'" v-bind="tipePaketAttrs" @click="tipePaket = 'reguler'">Reguler</Button>
              <Button type="button" size="sm" :variant="tipePaket === 'custom' ? 'default' : 'outline'" aria-pressed="custom" @click="tipePaket = 'custom'">Custom</Button>
            </div>
          </div>

          <template v-if="isCustom">
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label for="nama_custom">Nama Paket</Label>
                <Input id="nama_custom" v-model="namaCustom" v-bind="namaCustomAttrs" placeholder="mis. Sicakra 200 Mbps" :aria-invalid="!!errors.nama_paket_custom" />
                <p v-if="errors.nama_paket_custom" class="text-xs text-destructive">{{ errors.nama_paket_custom }}</p>
              </div>
              <div class="space-y-2">
                <Label for="kecepatan_custom">Kecepatan (Mbps)</Label>
                <Input id="kecepatan_custom" v-model="kecepatanCustom" v-bind="kecepatanCustomAttrs" type="number" min="1" :aria-invalid="!!errors.kecepatan_custom_mbps" />
                <p v-if="errors.kecepatan_custom_mbps" class="text-xs text-destructive">{{ errors.kecepatan_custom_mbps }}</p>
              </div>
            </div>
            <div class="space-y-2">
              <Label for="catatan_custom">Catatan</Label>
              <Textarea id="catatan_custom" v-model="catatanCustom" v-bind="catatanCustomAttrs" placeholder="Opsional — detail paket custom" />
            </div>
          </template>

          <template v-else>
            <div class="space-y-2">
              <Label>Paket Internet</Label>
              <Select v-model="paketId" v-bind="paketIdAttrs">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih paket" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="p in paketTersedia" :key="p.id" :value="String(p.id)">
                    {{ p.nama_paket }} — {{ p.kecepatan_mbps }} Mbps
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.paket_internet_id" class="text-xs text-destructive">{{ errors.paket_internet_id }}</p>
            </div>
          </template>

          <div class="space-y-2">
            <Label for="foto_ktp">Foto KTP <span class="text-muted-foreground">(opsional)</span></Label>
            <Input id="foto_ktp" type="file" accept="image/*" @change="onFileKtp" />
          </div>
          <div class="space-y-2">
            <Label for="foto_selfie">Foto Selfie + KTP <span class="text-muted-foreground">(opsional)</span></Label>
            <Input id="foto_selfie" type="file" accept="image/*" @change="onFileSelfie" />
          </div>

          <p class="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin class="size-3.5" /> Lokasi GPS bisa dilengkapi admin saat verifikasi.
          </p>
        </form>

        <DialogFooter class="gap-2 sm:gap-0">
          <Button variant="outline" @click="showDialog = false" :disabled="isPending">Batal</Button>
          <Button type="submit" form="form-daftarkan-pelanggan" :disabled="isPending">
            {{ isPending ? 'Menyimpan...' : 'Daftarkan' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>