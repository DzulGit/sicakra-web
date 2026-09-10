<script setup lang="ts">
import { h, ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { RouterLink } from 'vue-router'
import { toast } from 'vue-sonner'
import { Store, UserPlus, FileDown, Users, UserCheck, Wifi, Wallet } from 'lucide-vue-next'
import type { ColumnDef } from '@tanstack/vue-table'
import { useResellerList, useResellerStatistikGlobal, useSimpanReseller } from '../composables/useReseller'
import { simpanResellerSchema } from '@/schemas/reseller.schema'
import { mapValidationErrors } from '@/lib/errors'
import type { AdminLengkap } from '@/types/models'
import DataTable from '@/components/data/DataTable.vue'
import DashboardStatCard from '@/modules/dashboard-admin/components/DashboardStatCard.vue'
import ResellerPieChart from '../components/ResellerPieChart.vue'
import ResellerBarChart from '../components/ResellerBarChart.vue'
import ResellerTransaksiTable from '../components/ResellerTransaksiTable.vue'
import ResellerExportDialog from '../components/ResellerExportDialog.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

const { data: hasil, isLoading } = useResellerList()
const { data: statistik, isLoading: statistikLoading } = useResellerStatistikGlobal()

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

const showExport = ref(false)

const columns: ColumnDef<AdminLengkap, unknown>[] = [
  { accessorKey: 'nama_lengkap', header: 'Nama' },
  { accessorKey: 'email', header: 'Email' },
  {
    id: 'pelanggan_count',
    header: 'Jumlah Pelanggan',
    cell: ({ row }) => row.original.pelanggan_count ?? 0,
  },
  {
    accessorKey: 'status_aktif',
    header: 'Status',
    cell: ({ row }) =>
      h(Badge, { variant: row.original.status_aktif ? 'success' : 'secondary' }, () =>
        row.original.status_aktif ? 'Aktif' : 'Nonaktif',
      ),
  },
  {
    id: 'aksi',
    header: '',
    cell: ({ row }) =>
      h(
        Button,
        { as: RouterLink, to: `/admin/operasional/reseller/${row.original.id}/pelanggan`, variant: 'outline', size: 'sm' },
        () => 'Monitor Pelanggan',
      ),
  },
]

const showDialog = ref(false)
const { handleSubmit, errors, defineField, resetForm, setErrors } = useForm({
  validationSchema: toTypedSchema(simpanResellerSchema),
})
const [namaLengkap, namaLengkapAttrs] = defineField('nama_lengkap')
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

const { mutate, isPending } = useSimpanReseller()

const onSubmit = handleSubmit((formValues) => {
  mutate(formValues, {
    onSuccess: () => {
      toast.success('Akun reseller berhasil dibuat.')
      showDialog.value = false
      resetForm()
    },
    onError: (error) => {
      const fieldErrors = mapValidationErrors(error)
      if (fieldErrors) setErrors(fieldErrors)
      else toast.error('Terjadi kesalahan, coba lagi.')
    },
  })
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h1 class="text-xl font-semibold">Monitoring Reseller</h1>
        <p class="text-sm text-muted-foreground">
          Pantau distribusi pelanggan, paket internet, dan transaksi seluruh reseller.
        </p>
      </div>
      <div class="flex gap-2">
        <Button size="sm" variant="outline" class="gap-1.5" @click="showExport = true">
          <FileDown class="size-4" /> Export Laporan
        </Button>
        <Button size="sm" class="gap-1.5" @click="showDialog = true">
          <UserPlus class="size-4" /> Tambah Reseller
        </Button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <DashboardStatCard
        :icon="Store"
        label="Total Reseller"
        :value="statistik?.stats.total_reseller ?? 0"
        :loading="statistikLoading"
      />
      <DashboardStatCard
        :icon="UserCheck"
        label="Reseller Aktif"
        :value="statistik?.stats.reseller_aktif ?? 0"
        :loading="statistikLoading"
      />
      <DashboardStatCard
        :icon="Users"
        label="Total Pelanggan"
        :value="statistik?.stats.total_pelanggan ?? 0"
        subtitle="di bawah seluruh reseller"
        :loading="statistikLoading"
      />
      <DashboardStatCard
        :icon="Wallet"
        label="Total Pendapatan"
        :value="formatRupiah(statistik?.stats.total_pendapatan ?? 0)"
        subtitle="pembayaran berhasil"
        :loading="statistikLoading"
      />
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ResellerPieChart
        :data="statistik?.distribusi_pelanggan ?? []"
        :loading="statistikLoading"
        title="Distribusi Pelanggan per Reseller"
      />
      <ResellerBarChart
        :data="statistik?.omzet_per_reseller ?? []"
        :loading="statistikLoading"
        title="Omzet per Reseller"
        :format-value="(v) => formatRupiah(v)"
      />
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ResellerTransaksiTable
        :data="statistik?.transaksi_terbaru ?? []"
        :loading="statistikLoading"
      />
      <div class="grid grid-cols-2 gap-3">
        <DashboardStatCard
          :icon="Wifi"
          label="Total Paket"
          :value="statistik?.stats.total_paket ?? 0"
          :loading="statistikLoading"
          class="h-fit"
        />
        <DashboardStatCard
          :icon="FileDown"
          label="Total Tagihan"
          :value="statistik?.stats.total_tagihan ?? 0"
          :loading="statistikLoading"
          class="h-fit"
        />
      </div>
    </div>

    <ResellerExportDialog :open="showExport" @update:open="(v) => (showExport = v)" />

    <Dialog :open="showDialog" @update:open="(v) => (showDialog = v)">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Store class="size-5" /> Tambah Akun Reseller
          </DialogTitle>
          <DialogDescription>
            Buat akun reseller baru. Reseller mendapat akses gabungan modul operasional,
            teknisi, dan keuangan.
          </DialogDescription>
        </DialogHeader>

        <form id="form-reseller" class="space-y-4" novalidate @submit="onSubmit">
          <div class="space-y-2">
            <Label for="nama_lengkap">Nama Lengkap</Label>
            <Input id="nama_lengkap" v-model="namaLengkap" v-bind="namaLengkapAttrs" placeholder="mis. Rina Reseller" :aria-invalid="!!errors.nama_lengkap" />
            <p v-if="errors.nama_lengkap" class="text-xs text-destructive">{{ errors.nama_lengkap }}</p>
          </div>
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input id="email" v-model="email" v-bind="emailAttrs" type="email" placeholder="reseller@sicakra.com" :aria-invalid="!!errors.email" />
            <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
          </div>
          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input id="password" v-model="password" v-bind="passwordAttrs" type="password" placeholder="Minimal 8 karakter" :aria-invalid="!!errors.password" />
            <p v-if="errors.password" class="text-xs text-destructive">{{ errors.password }}</p>
          </div>
        </form>

        <DialogFooter class="gap-2 sm:gap-0">
          <Button variant="outline" @click="showDialog = false" :disabled="isPending">Batal</Button>
          <Button type="submit" form="form-reseller" :disabled="isPending">
            {{ isPending ? 'Menyimpan...' : 'Simpan' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <DataTable :columns="columns" :data="hasil?.data ?? []" :loading="isLoading" empty-judul="Belum ada reseller" />
  </div>
</template>