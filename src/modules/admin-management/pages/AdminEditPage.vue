<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { ubahAdminSchema } from '@/schemas/admin.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useAdminDetail, useUbahAdmin } from '../composables/useSuperAdminAdmin'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string)
const { data: admin, isLoading } = useAdminDetail(id)
const { handleSubmit, errors, defineField, setErrors, setValues } = useForm({ validationSchema: toTypedSchema(ubahAdminSchema) })
const [namaLengkap, namaLengkapAttrs] = defineField('nama_lengkap')
const [email, emailAttrs] = defineField('email')
const [peran, peranAttrs] = defineField('peran')

watch(admin, (nilai) => {
  if (!nilai) return
  setValues({ nama_lengkap: nilai.nama_lengkap, email: nilai.email, peran: nilai.peran as 'operasional' | 'teknisi' | 'keuangan' })
}, { immediate: true })

const { mutate, isPending } = useUbahAdmin()
const onSubmit = handleSubmit((values) => {
  mutate({ id: id.value, payload: values }, {
    onSuccess: () => {
      toast.success('Data admin berhasil diperbarui.')
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
  <div v-if="isLoading" class="max-w-lg space-y-4"><Skeleton class="h-64 w-full" /></div>
  <Card v-else class="max-w-lg">
    <CardHeader><CardTitle>Ubah Admin</CardTitle></CardHeader>
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
        <Button type="submit" class="w-full" :disabled="isPending">{{ isPending ? 'Menyimpan...' : 'Simpan Perubahan' }}</Button>
      </form>
    </CardContent>
  </Card>
</template>