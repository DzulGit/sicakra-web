<script setup lang="ts">
import { h, ref } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { toast } from 'vue-sonner'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { useAdminList, useNonaktifkanAdmin, useSimpanAdmin, useUbahAdmin } from '../composables/useSuperAdminAdmin'
import { simpanAdminSchema, ubahAdminSchema } from '@/schemas/admin.schema'
import { mapValidationErrors } from '@/lib/errors'
import { peranAdminEnum } from '@/lib/enums'
import { useAuthStore } from '@/stores/auth.store'
import DataTable from '@/components/data/DataTable.vue'
import FilterBar from '@/components/data/FilterBar.vue'
import Pagination from '@/components/data/Pagination.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'
import ConfirmDialog from '@/components/feedback/ConfirmDialog.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { FilterFieldConfig } from '@/types/filter'
import type { AdminLengkap } from '@/types/models'

const { data: hasil, isLoading } = useAdminList()
const authStore = useAuthStore()
const filterFields: FilterFieldConfig[] = [
  { key: 'peran', label: 'Peran', options: Object.entries(peranAdminEnum).map(([value, meta]) => ({ value, label: meta.label })) },
  { key: 'status_aktif', label: 'Status', options: [{ value: '1', label: 'Aktif' }, { value: '0', label: 'Nonaktif' }] },
]
const adminDikonfirmasi = ref<AdminLengkap | null>(null)
const { mutate: nonaktifkan, isPending: isPendingNonaktifkan } = useNonaktifkanAdmin()
function handleNonaktifkan() {
  if (!adminDikonfirmasi.value) return
  nonaktifkan(adminDikonfirmasi.value.id, {
    onSuccess: () => { toast.success('Admin berhasil dinonaktifkan.'); adminDikonfirmasi.value = null },
    onError: () => toast.error('Gagal menonaktifkan admin.'),
  })
}
const columns: ColumnDef<AdminLengkap, unknown>[] = [
  { accessorKey: 'nama_lengkap', header: 'Nama Lengkap' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'peran', header: 'Peran', cell: ({ row }) => h(StatusBadge, { value: row.original.peran, map: peranAdminEnum }) },
  { accessorKey: 'status_aktif', header: 'Status', cell: ({ row }) => h(Badge, { variant: row.original.status_aktif ? 'success' : 'secondary' }, () => row.original.status_aktif ? 'Aktif' : 'Nonaktif') },
  { id: 'aksi', header: '', cell: ({ row }) => h('div', { class: 'flex justify-end gap-2' }, [
    h(Button, { variant: 'outline', size: 'sm', onClick: () => bukaDialogUbah(row.original) }, () => 'Ubah'),
    row.original.status_aktif && row.original.id !== authStore.pengguna?.id ? h(Button, { variant: 'destructive', size: 'sm', onClick: () => (adminDikonfirmasi.value = row.original) }, () => 'Nonaktifkan') : null,
  ]) },
]

const dialogBuka = ref(false)
const { handleSubmit, errors, defineField, setErrors, resetForm } = useForm({ validationSchema: toTypedSchema(simpanAdminSchema) })
const [namaLengkap, namaLengkapAttrs] = defineField('nama_lengkap')
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')
const [peran, peranAttrs] = defineField('peran')
const peranBaruOptions = Object.entries(peranAdminEnum)
  .filter(([value]) => value !== 'super_admin')
  .map(([value, meta]) => ({ value, label: meta.label }))
const { mutate: simpan, isPending: isPendingSimpan } = useSimpanAdmin()
function bukaDialog() {
  resetForm()
  dialogBuka.value = true
}
const onSubmit = handleSubmit((values) => {
  simpan(values, {
    onSuccess: () => {
      toast.success('Admin baru berhasil dibuat.')
      dialogBuka.value = false
    },
    onError: (error) => {
      const fieldErrors = mapValidationErrors(error)
      if (fieldErrors) setErrors(fieldErrors)
      else toast.error('Terjadi kesalahan, coba lagi.')
    },
  })
})

const adminDiubah = ref<AdminLengkap | null>(null)
const {
  handleSubmit: handleSubmitUbah,
  errors: errorsUbah,
  defineField: defineFieldUbah,
  setErrors: setErrorsUbah,
  resetForm: resetFormUbah,
} = useForm({ validationSchema: toTypedSchema(ubahAdminSchema) })
const [namaLengkapUbah, namaLengkapUbahAttrs] = defineFieldUbah('nama_lengkap')
const [emailUbah, emailUbahAttrs] = defineFieldUbah('email')
const [passwordLama, passwordLamaAttrs] = defineFieldUbah('password_lama')
const [passwordBaru, passwordBaruAttrs] = defineFieldUbah('password_baru')
const { mutate: ubah, isPending: isPendingUbah } = useUbahAdmin()
function bukaDialogUbah(admin: AdminLengkap) {
  resetFormUbah({ values: { nama_lengkap: admin.nama_lengkap, email: admin.email, password_lama: '', password_baru: '' } })
  adminDiubah.value = admin
}
const onSubmitUbah = handleSubmitUbah((values) => {
  if (!adminDiubah.value) return
  ubah({ id: adminDiubah.value.id, payload: values }, {
    onSuccess: () => {
      toast.success('Data admin berhasil diperbarui.')
      adminDiubah.value = null
    },
    onError: (error) => {
      const fieldErrors = mapValidationErrors(error)
      if (fieldErrors) setErrorsUbah(fieldErrors)
      else toast.error('Terjadi kesalahan, coba lagi.')
    },
  })
})
</script>
<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Kelola Admin</h1>
      <Button @click="bukaDialog">Tambah Admin</Button>
    </div>
    <FilterBar :fields="filterFields" />
    <DataTable :columns="columns" :data="hasil?.data ?? []" :loading="isLoading" empty-judul="Belum ada admin" />
    <Pagination v-if="hasil" :meta="hasil" />
    <ConfirmDialog :open="!!adminDikonfirmasi" judul="Nonaktifkan admin ini?" :deskripsi="`${adminDikonfirmasi?.nama_lengkap} tidak akan bisa login lagi.`" label-konfirmasi="Nonaktifkan" variant-konfirmasi="destructive" :loading="isPendingNonaktifkan" @update:open="(v) => !v && (adminDikonfirmasi = null)" @confirm="handleNonaktifkan" />
    <Dialog :open="dialogBuka" @update:open="dialogBuka = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Admin</DialogTitle>
          <DialogDescription>Lengkapi data akun admin baru di bawah ini.</DialogDescription>
        </DialogHeader>
        <form class="space-y-4" novalidate @submit="onSubmit">
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="nama_lengkap">Nama Lengkap</Label>
              <Input id="nama_lengkap" v-model="namaLengkap" v-bind="namaLengkapAttrs" placeholder="cth. Budi Santoso" :aria-invalid="!!errors.nama_lengkap" />
              <p v-if="errors.nama_lengkap" class="text-xs text-destructive">{{ errors.nama_lengkap }}</p>
            </div>
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input id="email" v-model="email" v-bind="emailAttrs" type="email" placeholder="nama@perusahaan.id" :aria-invalid="!!errors.email" />
              <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
            </div>
            <div class="space-y-2">
              <Label for="password">Password</Label>
              <Input id="password" v-model="password" v-bind="passwordAttrs" type="password" placeholder="Minimal 8 karakter" :aria-invalid="!!errors.password" />
              <p v-if="errors.password" class="text-xs text-destructive">{{ errors.password }}</p>
            </div>
            <div class="space-y-2">
              <Label>Peran</Label>
              <Select v-model="peran" v-bind="peranAttrs">
                <SelectTrigger><SelectValue placeholder="Pilih peran" /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="option in peranBaruOptions" :key="option.value" :value="option.value">{{ option.label }}</SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.peran" class="text-xs text-destructive">{{ errors.peran }}</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" :disabled="isPendingSimpan" @click="dialogBuka = false">Batal</Button>
            <Button type="submit" :disabled="isPendingSimpan">{{ isPendingSimpan ? 'Menyimpan...' : 'Simpan' }}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <Dialog :open="!!adminDiubah" @update:open="(v) => !v && (adminDiubah = null)">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Admin</DialogTitle>
          <DialogDescription>Perbarui data {{ adminDiubah?.nama_lengkap }}.</DialogDescription>
        </DialogHeader>
        <form class="space-y-4" novalidate @submit="onSubmitUbah">
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="nama_lengkap_ubah">Nama Lengkap</Label>
              <Input id="nama_lengkap_ubah" v-model="namaLengkapUbah" v-bind="namaLengkapUbahAttrs" placeholder="cth. Budi Santoso" :aria-invalid="!!errorsUbah.nama_lengkap" />
              <p v-if="errorsUbah.nama_lengkap" class="text-xs text-destructive">{{ errorsUbah.nama_lengkap }}</p>
            </div>
            <div class="space-y-2">
              <Label for="email_ubah">Email</Label>
              <Input id="email_ubah" v-model="emailUbah" v-bind="emailUbahAttrs" type="email" placeholder="nama@perusahaan.id" :aria-invalid="!!errorsUbah.email" />
              <p v-if="errorsUbah.email" class="text-xs text-destructive">{{ errorsUbah.email }}</p>
            </div>
            <div class="space-y-2">
              <Label for="password_lama">Password Lama <span class="text-muted-foreground">(diisi jika ganti password)</span></Label>
              <Input id="password_lama" v-model="passwordLama" v-bind="passwordLamaAttrs" type="password" placeholder="Diisi jika ingin ganti password" :aria-invalid="!!errorsUbah.password_lama" />
              <p v-if="errorsUbah.password_lama" class="text-xs text-destructive">{{ errorsUbah.password_lama }}</p>
            </div>
            <div class="space-y-2">
              <Label for="password_baru">Password Baru <span class="text-muted-foreground">(opsional)</span></Label>
              <Input id="password_baru" v-model="passwordBaru" v-bind="passwordBaruAttrs" type="password" placeholder="Minimal 8 karakter" :aria-invalid="!!errorsUbah.password_baru" />
              <p v-if="errorsUbah.password_baru" class="text-xs text-destructive">{{ errorsUbah.password_baru }}</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" :disabled="isPendingUbah" @click="adminDiubah = null">Batal</Button>
            <Button type="submit" :disabled="isPendingUbah">{{ isPendingUbah ? 'Menyimpan...' : 'Simpan Perubahan' }}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>