<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { loginAdminSchema } from '@/schemas/auth.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useAuthStore } from '@/stores/auth.store'
import { useLoginAdmin } from '../composables/useAdminAuth'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const authStore = useAuthStore()
const router = useRouter()

const { handleSubmit, errors, defineField, setErrors } = useForm({
  validationSchema: toTypedSchema(loginAdminSchema),
})

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

const { mutate: login, isPending } = useLoginAdmin()

// Halaman default per peran setelah login — cermin rute Fase-5-9.
const rutePerPeran: Record<string, string> = {
  super_admin: '/admin/super-admin/admin',
  operasional: '/admin/operasional/permohonan-layanan',
  teknisi: '/admin/teknisi/jadwal-survey',
  keuangan: '/admin/keuangan/tagihan',
}

const onSubmit = handleSubmit((values) => {
  login(values, {
    onSuccess: ({ data }) => {
      const { admin, token } = data.data
      authStore.setSesi(token, {
        id: admin.id,
        nama_lengkap: admin.nama_lengkap,
        tipe: 'admin',
        peran: admin.peran,
      })
      toast.success(`Selamat datang, ${admin.nama_lengkap}`)
      router.push(rutePerPeran[admin.peran] ?? '/admin/masuk')
    },
    onError: (error) => {
      const fieldErrors = mapValidationErrors(error)
      if (fieldErrors) {
        setErrors(fieldErrors)
      } else {
        toast.error('Terjadi kesalahan, coba lagi.')
      }
    },
  })
})
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Masuk sebagai Admin</CardTitle>
      <CardDescription>Operasional, Teknisi, Keuangan, atau Super Admin</CardDescription>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" novalidate @submit="onSubmit">
        <div class="space-y-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="email"
            v-bind="emailAttrs"
            type="email"
            placeholder="nama@sicakra.id"
            :aria-invalid="!!errors.email"
          />
          <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
        </div>
        <div class="space-y-2">
          <Label for="password">Password</Label>
          <Input
            id="password"
            v-model="password"
            v-bind="passwordAttrs"
            type="password"
            placeholder="••••••••"
            :aria-invalid="!!errors.password"
          />
          <p v-if="errors.password" class="text-xs text-destructive">{{ errors.password }}</p>
        </div>
        <Button type="submit" class="w-full" :disabled="isPending">
          {{ isPending ? 'Memproses...' : 'Masuk' }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
