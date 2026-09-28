<script setup lang="ts">
import { h, ref } from 'vue'
import { z } from 'zod'
import type { ColumnDef } from '@tanstack/vue-table'
import { toast } from 'vue-sonner'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { useAdminList, useAktifkanAdmin, useNonaktifkanAdmin, useSimpanAdmin, useUbahAdmin } from '../composables/useSuperAdminAdmin'
import { simpanAdminSchema, ubahAdminSchema, validasiPasswordSuperAdminSchema } from '@/schemas/admin.schema'
import { mapValidationErrors } from '@/lib/errors'
import { peranAdminEnum } from '@/lib/enums'
import { useAuthStore } from '@/stores/auth.store'
import DataTable from '@/components/data/DataTable.vue'
import FilterBar from '@/components/data/FilterBar.vue'
import Pagination from '@/components/data/Pagination.vue'
import StatusBadge from '@/components/data/StatusBadge.vue'
import SuperAdminOverview from '../components/SuperAdminOverview.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { FilterFieldConfig } from '@/types/filter'
import type { AdminLengkap } from '@/types/models'

const { data: hasil, isLoading } = useAdminList()
const authStore = useAuthStore()
const filterFields: FilterFieldConfig[] = [
  { key: 'peran', label: 'Peran', options: Object.entries(peranAdminEnum).map(([value, meta]) => ({ value, label: meta.label })) },
  { key: 'status_aktif', label: 'Status', options: [{ value: '1', label: 'Aktif' }, { value: '0', label: 'Nonaktif' }] },
]
type AksiAdmin = { admin: AdminLengkap; tindakan: 'nonaktifkan' | 'aktifkan' }
const aksiAdmin = ref<AksiAdmin | null>(null)
const { mutate: nonaktifkan, isPending: isPendingNonaktifkan } = useNonaktifkanAdmin()
const { mutate: aktifkan, isPending: isPendingAktifkan } = useAktifkanAdmin()
function bukaDialogAksi(admin: AdminLengkap, tindakan: AksiAdmin['tindakan']) {
  aksiAdmin.value = { admin, tindakan }
  draftUbah.value = null
  resetFormValidasi()
  dialogValidasiBuka.value = true
}
const columns: ColumnDef<AdminLengkap, unknown>[] = [
  { accessorKey: 'nama_lengkap', header: 'Nama Lengkap' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'peran', header: 'Peran', cell: ({ row }) => h(StatusBadge, { value: row.original.peran, map: peranAdminEnum }) },
  { accessorKey: 'status_aktif', header: 'Status', cell: ({ row }) => h(Badge, { variant: row.original.status_aktif ? 'success' : 'secondary' }, () => row.original.status_aktif ? 'Aktif' : 'Nonaktif') },
  { id: 'aksi', header: '', cell: ({ row }) => h('div', { class: 'flex justify-end gap-2' }, [
    h(Button, { variant: 'outline', size: 'sm', onClick: () => bukaDialogUbah(row.original) }, () => 'Ubah'),
    row.original.status_aktif && row.original.id !== authStore.pengguna?.id
      ? h(Button, { variant: 'destructive', size: 'sm', onClick: () => bukaDialogAksi(row.original, 'nonaktifkan') }, () => 'Nonaktifkan')
      : null,
    !row.original.status_aktif ? h(Button, { variant: 'outline', size: 'sm', onClick: () => bukaDialogAksi(row.original, 'aktifkan') }, () => 'Aktifkan') : null,
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
  resetForm: resetFormUbah,
} = useForm({ validationSchema: toTypedSchema(ubahAdminSchema) })
const [namaLengkapUbah, namaLengkapUbahAttrs] = defineFieldUbah('nama_lengkap')
const [emailUbah, emailUbahAttrs] = defineFieldUbah('email')
const [passwordBaru, passwordBaruAttrs] = defineFieldUbah('password_baru')
function bukaDialogUbah(admin: AdminLengkap) {
  resetFormUbah({ values: { nama_lengkap: admin.nama_lengkap, email: admin.email, password_baru: '' } })
  adminDiubah.value = admin
}

const draftUbah = ref<z.infer<typeof ubahAdminSchema> | null>(null)
const dialogValidasiBuka = ref(false)
const {
  handleSubmit: handleSubmitValidasi,
  errors: errorsValidasi,
  defineField: defineFieldValidasi,
  setErrors: setErrorsValidasi,
  resetForm: resetFormValidasi,
} = useForm({ validationSchema: toTypedSchema(validasiPasswordSuperAdminSchema) })
const [passwordSuperadmin, passwordSuperadminAttrs] = defineFieldValidasi('password_superadmin')
const { mutate: simpanUbah, isPending: isPendingValidasi } = useUbahAdmin()
const onSubmitUbah = handleSubmitUbah((values) => {
  if (!adminDiubah.value) return
  draftUbah.value = values
  aksiAdmin.value = null
  resetFormValidasi()
  dialogValidasiBuka.value = true
})
const onSubmitValidasi = handleSubmitValidasi((values) => {
  const password = values.password_superadmin
  if (draftUbah.value && adminDiubah.value) {
    simpanUbah({ id: adminDiubah.value.id, payload: { ...draftUbah.value, password_superadmin: password } }, {
      onSuccess: () => {
        toast.success('Data admin berhasil diperbarui.')
        adminDiubah.value = null
        draftUbah.value = null
        dialogValidasiBuka.value = false
      },
      onError: (error) => {
        const fieldErrors = mapValidationErrors(error)
        if (fieldErrors) setErrorsValidasi(fieldErrors)
        else toast.error('Terjadi kesalahan, coba lagi.')
      },
    })
    return
  }
  if (aksiAdmin.value) {
    const { admin, tindakan } = aksiAdmin.value
    const mutateAksi = tindakan === 'nonaktifkan' ? nonaktifkan : aktifkan
    const isNonaktifkan = tindakan === 'nonaktifkan'
    mutateAksi({ id: admin.id, password_superadmin: password }, {
      onSuccess: () => {
        toast.success(isNonaktifkan ? 'Admin berhasil dinonaktifkan.' : 'Admin berhasil diaktifkan kembali.')
        aksiAdmin.value = null
        dialogValidasiBuka.value = false
      },
      onError: (error) => {
        const fieldErrors = mapValidationErrors(error)
        if (fieldErrors) setErrorsValidasi(fieldErrors)
        else toast.error('Terjadi kesalahan, coba lagi.')
      },
    })
  }
})
</script>
<template>
  <div class="space-y-4">
    <SuperAdminOverview />
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Kelola Admin</h1>
      <Button @click="bukaDialog">Tambah Admin</Button>
    </div>
    <FilterBar :fields="filterFields" />
    <DataTable :columns="columns" :data="hasil?.data ?? []" :loading="isLoading" empty-judul="Belum ada admin" />
    <Pagination v-if="hasil" :meta="hasil" />
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
    <Dialog :open="!!adminDiubah" @update:open="(v) => !v && (adminDiubah = null, draftUbah = null)">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Admin</DialogTitle>
          <DialogDescription>Perbarui data {{ adminDiubah?.nama_lengkap }}.</DialogDescription>
        </DialogHeader>
        <form class="space-y-4" novalidate @submit="onSubmitUbah">
          <Tabs default-value="ubah-data">
            <TabsList>
              <TabsTrigger value="ubah-data">Ubah Data</TabsTrigger>
              <TabsTrigger value="ganti-password">Ganti Password</TabsTrigger>
            </TabsList>
            <TabsContent value="ubah-data">
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
              </div>
            </TabsContent>
            <TabsContent value="ganti-password">
              <div class="space-y-2">
                <Label for="password_baru">Password Baru</Label>
                <Input id="password_baru" v-model="passwordBaru" v-bind="passwordBaruAttrs" type="password" placeholder="Minimal 8 karakter" :aria-invalid="!!errorsUbah.password_baru" />
                <p v-if="errorsUbah.password_baru" class="text-xs text-destructive">{{ errorsUbah.password_baru }}</p>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button type="button" variant="outline" @click="adminDiubah = null">Batal</Button>
            <Button type="submit">Simpan Perubahan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <Dialog :open="dialogValidasiBuka" @update:open="(v) => !v && (dialogValidasiBuka = false, aksiAdmin = null)">
      <DialogContent class="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Konfirmasi Password</DialogTitle>
          <DialogDescription v-if="aksiAdmin" v-html="`Masukkan password super admin untuk ${aksiAdmin.tindakan === 'nonaktifkan' ? 'menonaktifkan' : 'mengaktifkan kembali'} ${aksiAdmin.admin.nama_lengkap}.`" />
          <DialogDescription v-else>Masukkan password super admin untuk menyimpan perubahan {{ adminDiubah?.nama_lengkap }}.</DialogDescription>
        </DialogHeader>
        <form class="space-y-4" novalidate @submit="onSubmitValidasi">
          <div class="space-y-2">
            <Label for="password_superadmin">Password Super Admin</Label>
            <Input id="password_superadmin" v-model="passwordSuperadmin" v-bind="passwordSuperadminAttrs" type="password" placeholder="Masukkan password super admin" :aria-invalid="!!errorsValidasi.password_superadmin" />
            <p v-if="errorsValidasi.password_superadmin" class="text-xs text-destructive">{{ errorsValidasi.password_superadmin }}</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" :disabled="isPendingValidasi" @click="dialogValidasiBuka = false; aksiAdmin = null">Batal</Button>
            <Button type="submit" :disabled="isPendingValidasi || isPendingNonaktifkan || isPendingAktifkan">{{ isPendingValidasi || isPendingNonaktifkan || isPendingAktifkan ? 'Menyimpan...' : aksiAdmin ? 'Konfirmasi' : 'Simpan' }}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>