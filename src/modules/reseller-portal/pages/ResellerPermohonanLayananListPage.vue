<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { useQuery } from '@tanstack/vue-query'
import { Plus, MapPin, PackagePlus, RefreshCw } from 'lucide-vue-next'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { useResellerPelangganList } from '../composables/useResellerPortal'
import {
  useResellerPermohonanLayananList,
  useBuatResellerPermohonan,
} from '../composables/useResellerPermohonanLayanan'
import { buatPermohonanResellerSchema } from '@/schemas/reseller-portal.schema'
import { getResellerPaketInternetList } from '@/modules/paket-internet/api/reseller/resellerPaketInternet.api'
import { statusPermohonanEnum, jenisPermohonanEnum } from '@/lib/enums'
import type { PermohonanLayanan } from '@/types/models'
import type { FilterFieldConfig } from '@/types/filter'
import { mapValidationErrors } from '@/lib/errors'

import DataTable from '@/components/data/DataTable.vue'
import FilterBar from '@/components/data/FilterBar.vue'
import Pagination from '@/components/data/Pagination.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
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

type TabId = 'semua' | 'relokasi' | 'tambah_paket' | 'ganti_paket'

const tabs: { id: TabId; label: string; icon: Component }[] = [
  { id: 'semua', label: 'Semua', icon: MapPin },
  { id: 'relokasi', label: 'Relokasi', icon: MapPin },
  { id: 'tambah_paket', label: 'Tambah Paket', icon: PackagePlus },
  { id: 'ganti_paket', label: 'Ganti Paket', icon: RefreshCw },
]

const route = useRoute()
const router = useRouter()
const tabAktif = computed<TabId>(() => (route.query.jenis_permohonan as TabId) || 'semua')
function pilihTab(id: TabId) {
  router.push({
    query: id === 'semua' ? {} : { ...route.query, jenis_permohonan: id },
  })
}

const { data: hasil, isLoading } = useResellerPermohonanLayananList()

const filterFields: FilterFieldConfig[] = [
  {
    key: 'status',
    label: 'Status',
    options: Object.entries(statusPermohonanEnum).map(([value, meta]) => ({ value, label: meta.label })),
  },
]

const columns = computed<ColumnDef<PermohonanLayanan, unknown>[]>(() => [
  { accessorKey: 'nomor_permohonan', header: 'Nomor' },
  {
    id: 'jenis',
    header: 'Jenis',
    cell: ({ row }) => h(StatusBadge, { value: row.original.jenis_permohonan, map: jenisPermohonanEnum }),
  },
  {
    id: 'pelanggan',
    header: 'Pelanggan',
    cell: ({ row }) => row.original.pelanggan?.nama_lengkap ?? '-',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h(StatusBadge, { value: row.original.status, map: statusPermohonanEnum }),
  },
  {
    id: 'aksi',
    header: '',
    cell: ({ row }) =>
      h(
        Button,
        {
          as: RouterLink,
          to: `/reseller/permohonan-layanan/${row.original.id}`,
          variant: 'outline',
          size: 'sm',
        },
        () => 'Detail',
      ),
  },
])

// ===== Dialog Buat Permohonan =====
const dialogBuka = ref(false)
const { data: pelangganData } = useResellerPelangganList()
const semuaPelanggan = computed(() => pelangganData.value?.data ?? [])
const { data: paketList } = useQuery({
  queryKey: ['reseller-portal', 'paket-internet'],
  queryFn: () => getResellerPaketInternetList().then((r) => r.data.data),
})

const { handleSubmit, resetForm, errors, values, setFieldValue, isSubmitting } = useForm({
  validationSchema: toTypedSchema(buatPermohonanResellerSchema),
  initialValues: {
    jenis_permohonan: 'relokasi',
    tipe_paket: 'reguler',
  },
})

const pelangganTerpilih = computed(() => semuaPelanggan.value.find((p) => p.id === Number(values.pelanggan_id)))
const layananOptions = computed(() => pelangganTerpilih.value?.layanan_internet ?? [])
const gantiAtauTambah = computed(() => values.jenis_permohonan === 'ganti_paket' || values.jenis_permohonan === 'tambah_paket')
const paketOptions = computed(() => (paketList.value ?? []).filter((p) => p.status_aktif))

const buatPermohonan = useBuatResellerPermohonan()
const simpan = handleSubmit(async (formValues) => {
  try {
    await buatPermohonan.mutateAsync(formValues)
    toast.success('Permohonan berhasil dibuat')
    dialogBuka.value = false
    resetForm()
  } catch (err: unknown) {
    const data = (err as { response?: { data?: { errors?: Record<string, string[]> } } })?.response?.data
    if (data?.errors) {
      mapValidationErrors(data.errors)
    } else {
      toast.error('Gagal membuat permohonan')
    }
  }
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Permohonan Layanan</h1>
      <Button size="sm" class="gap-1.5" @click="dialogBuka = true">
        <Plus class="size-4" /> Buat Permohonan
      </Button>
    </div>

    <div class="flex gap-1 rounded-lg border bg-muted/30 p-1 w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="pilihTab(tab.id)"
        class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
        :class="tabAktif === tab.id ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
      >
        <component :is="tab.icon" class="size-4" />
        {{ tab.label }}
      </button>
    </div>

    <FilterBar :fields="filterFields" />

    <DataTable
      :columns="columns"
      :data="hasil?.data ?? []"
      :loading="isLoading"
      empty-judul="Belum ada permohonan"
      empty-deskripsi="Belum ada permohonan pada tab ini."
    />

    <Pagination v-if="hasil" :meta="hasil" />
  </div>

  <!-- Dialog Buat Permohonan -->
  <Dialog :open="dialogBuka" @update:open="(v) => { dialogBuka = v; if (!v) resetForm() }">
    <DialogContent class="max-w-lg max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Buat Permohonan Layanan</DialogTitle>
        <DialogDescription>Ajukan permohonan atas nama pelanggan yang sudah terdaftar.</DialogDescription>
      </DialogHeader>

      <form @submit.prevent="simpan" class="space-y-4">
        <div class="space-y-2">
          <Label>Jenis Permohonan</Label>
          <Select :model-value="values.jenis_permohonan" @update:model-value="(v: any) => setFieldValue('jenis_permohonan', v)">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="relokasi">Relokasi</SelectItem>
              <SelectItem value="ganti_paket">Ganti Paket</SelectItem>
              <SelectItem value="tambah_paket">Tambah Paket</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.jenis_permohonan" class="text-sm text-destructive">{{ errors.jenis_permohonan }}</p>
        </div>

        <div class="space-y-2">
          <Label>Pelanggan</Label>
          <Select :model-value="values.pelanggan_id" @update:model-value="(v: any) => { setFieldValue('pelanggan_id', v); setFieldValue('layanan_internet_id', undefined) }">
            <SelectTrigger><SelectValue placeholder="Pilih pelanggan" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="p in semuaPelanggan" :key="p.id" :value="String(p.id)">{{ p.nama_lengkap }}</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.pelanggan_id" class="text-sm text-destructive">{{ errors.pelanggan_id }}</p>
        </div>

        <div v-if="pelangganTerpilih && layananOptions.length" class="space-y-2">
          <Label>Layanan Aktif</Label>
          <Select :model-value="values.layanan_internet_id" @update:model-value="(v: any) => setFieldValue('layanan_internet_id', v)">
            <SelectTrigger><SelectValue placeholder="Pilih layanan" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="l in layananOptions" :key="l.id" :value="String(l.id)">
                {{ l.nomor_layanan }} — {{ l.paket_internet?.nama_paket ?? 'Custom' }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.layanan_internet_id" class="text-sm text-destructive">{{ errors.layanan_internet_id }}</p>
        </div>
        <p v-else-if="pelangganTerpilih" class="text-sm text-muted-foreground">Pelanggan ini belum memiliki layanan aktif.</p>

        <!-- Ganti / Tambah Paket -->
        <template v-if="gantiAtauTambah">
          <div class="space-y-2">
            <Label>Tipe Paket</Label>
            <div class="flex gap-3">
              <label v-for="t in [{v:'reguler',l:'Reguler'},{v:'custom',l:'Custom'}]" :key="t.v" class="flex items-center gap-1.5 text-sm">
                <input type="radio" :value="t.v" :checked="values.tipe_paket === t.v" @change="setFieldValue('tipe_paket', t.v as any)" class="accent-primary" />
                {{ t.l }}
              </label>
            </div>
          </div>

          <div v-if="values.tipe_paket === 'reguler'" class="space-y-2">
            <Label>Paket Baru</Label>
            <Select :model-value="values.paket_internet_id" @update:model-value="(v: any) => setFieldValue('paket_internet_id', v)">
              <SelectTrigger><SelectValue placeholder="Pilih paket" /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="p in paketOptions" :key="p.id" :value="String(p.id)">
                  {{ p.nama_paket }} — {{ p.kecepatan_mbps }} Mbps
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.paket_internet_id" class="text-sm text-destructive">{{ errors.paket_internet_id }}</p>
          </div>

          <template v-if="values.tipe_paket === 'custom'">
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <Label>Nama Paket</Label>
                <Input :model-value="values.nama_paket_custom" @update:model-value="(v: any) => setFieldValue('nama_paket_custom', v)" />
                <p v-if="errors.nama_paket_custom" class="text-xs text-destructive">{{ errors.nama_paket_custom }}</p>
              </div>
              <div class="space-y-1.5">
                <Label>Kecepatan (Mbps)</Label>
                <Input type="number" :model-value="values.kecepatan_custom_mbps" @update:model-value="(v: any) => setFieldValue('kecepatan_custom_mbps', Number(v) || undefined)" />
                <p v-if="errors.kecepatan_custom_mbps" class="text-xs text-destructive">{{ errors.kecepatan_custom_mbps }}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <Label>Harga (Rp/bln)</Label>
                <Input type="number" :model-value="values.harga_custom" @update:model-value="(v: any) => setFieldValue('harga_custom', Number(v) || undefined)" />
                <p v-if="errors.harga_custom" class="text-xs text-destructive">{{ errors.harga_custom }}</p>
              </div>
              <div class="space-y-1.5">
                <Label>Catatan</Label>
                <Input :model-value="values.catatan_custom" @update:model-value="(v: any) => setFieldValue('catatan_custom', v)" />
              </div>
            </div>
          </template>
        </template>

        <!-- Relokasi -->
        <template v-if="values.jenis_permohonan === 'relokasi'">
          <div class="space-y-1.5">
            <Label>Alamat Baru</Label>
            <Input :model-value="values.alamat_pemasangan" @update:model-value="(v: any) => setFieldValue('alamat_pemasangan', v)" placeholder="Jl. Contoh No. 123" />
            <p v-if="errors.alamat_pemasangan" class="text-xs text-destructive">{{ errors.alamat_pemasangan }}</p>
          </div>
          <div class="space-y-1.5">
            <Label>Detail Alamat (opsional)</Label>
            <Textarea :model-value="values.detail_alamat" @update:model-value="(v: any) => setFieldValue('detail_alamat', v)" />
          </div>
        </template>

        <div class="space-y-1.5">
          <Label>Alasan (opsional)</Label>
          <Textarea :model-value="values.alasan" @update:model-value="(v: any) => setFieldValue('alasan', v)" />
        </div>

        <DialogFooter>
          <Button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Mengirim...' : 'Kirim Permohonan' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>