<script setup lang="ts">
import { computed } from 'vue'
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
import { Skeleton } from '@/components/ui/skeleton'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string)
const { data: admin, isLoading } = useAdminDetail(id)
const { handleSubmit, errors, defineField, setErrors } = useForm({ validationSchema: toTypedSchema(ubahAdminSchema) })
const [email, emailAttrs] = defineField('email')
const [passwordLama, passwordLamaAttrs] = defineField('password_lama')
const [passwordBaru, passwordBaruAttrs] = defineField('password_baru')

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
          <Label for="email">Email</Label>
          <Input id="email" v-model="email" v-bind="emailAttrs" type="email" :aria-invalid="!!errors.email" />
          <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
        </div>
        <div class="space-y-2">
          <Label for="password_lama">Password Lama</Label>
          <Input id="password_lama" v-model="passwordLama" v-bind="passwordLamaAttrs" type="password" placeholder="Diisi jika ingin ganti password" />
          <p v-if="errors.password_lama" class="text-xs text-destructive">{{ errors.password_lama }}</p>
        </div>
        <div class="space-y-2">
          <Label for="password_baru">Password Baru <span class="text-muted-foreground">(opsional)</span></Label>
          <Input id="password_baru" v-model="passwordBaru" v-bind="passwordBaruAttrs" type="password" placeholder="Minimal 8 karakter" />
          <p v-if="errors.password_baru" class="text-xs text-destructive">{{ errors.password_baru }}</p>
        </div>
        <Button type="submit" class="w-full" :disabled="isPending">{{ isPending ? 'Menyimpan...' : 'Simpan Perubahan' }}</Button>
      </form>
    </CardContent>
  </Card>
</template>