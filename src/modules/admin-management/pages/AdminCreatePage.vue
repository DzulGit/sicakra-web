<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { simpanAdminSchema } from '@/schemas/admin.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useSimpanAdmin } from '../composables/useSuperAdminAdmin'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'

const router = useRouter()
const { handleSubmit, errors, defineField, setErrors } = useForm({ validationSchema: toTypedSchema(simpanAdminSchema) })
const [namaLengkap, namaLengkapAttrs] = defineField('nama_lengkap')
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')
const [peran, peranAttrs] = defineField('peran')
const { mutate, isPending } = useSimpanAdmin()

const onSubmit = handleSubmit((values) => {
  mutate(values, {
    onSuccess: () => {
      toast.success('Admin baru berhasil dibuat.')
      router.push('/admin/super-admin/admin')
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
  <Card class="max-w-lg">
    <CardHeader><CardTitle>Tambah Admin</CardTitle></CardHeader>
    <CardContent>
      <form class="space-y-4" novalidate @submit="onSubmit">
        <div class="space-y-2">
          <Label for="nama_lengkap">Nama Lengkap</Label>
          <Input id="nama_lengkap" v-model="namaLengkap" v-bind="namaLengkapAttrs" :aria-invalid="!!errors.nama_lengkap" />
          <p v-if="errors.nama_lengkap" class="text-xs text-destructive">{{ errors.nama_lengkap }}</p>
        </div>
        <div class="space-y-2">
          <Label for="email">Email</Label>
          <Input id="email" v-model="email" v-bind="emailAttrs" type="email" :aria-invalid="!!errors.email" />
          <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
        </div>
        <div class="space-y-2">
          <Label for="password">Password</Label>
          <Input id="password" v-model="password" v-bind="passwordAttrs" type="password" :aria-invalid="!!errors.password" />
          <p v-if="errors.password" class="text-xs text-destructive">{{ errors.password }}</p>
        </div>
        <div class="space-y-2">
          <Label>Peran</Label>
          <Select v-model="peran" v-bind="peranAttrs">
            <SelectTrigger><SelectValue placeholder="Pilih peran" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="operasional">Operasional</SelectItem>
              <SelectItem value="teknisi">Teknisi</SelectItem>
              <SelectItem value="keuangan">Keuangan</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.peran" class="text-xs text-destructive">{{ errors.peran }}</p>
        </div>
        <Button type="submit" class="w-full" :disabled="isPending">{{ isPending ? 'Menyimpan...' : 'Simpan' }}</Button>
      </form>
    </CardContent>
  </Card>
</template>