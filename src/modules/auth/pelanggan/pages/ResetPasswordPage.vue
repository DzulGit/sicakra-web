<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { resetPasswordSchema } from '@/schemas/auth.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useResetPasswordPelanggan } from '../composables/usePelangganAuth'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const route = useRoute()
const router = useRouter()

const { handleSubmit, errors, defineField, setErrors, setValues } = useForm({
  validationSchema: toTypedSchema(resetPasswordSchema),
})

const [password, passwordAttrs] = defineField('password')
const [passwordConfirmation, passwordConfirmationAttrs] = defineField('password_confirmation')

onMounted(() => {
  const token = typeof route.query.token === 'string' ? route.query.token : ''
  const email = typeof route.query.email === 'string' ? route.query.email : ''

  if (!token) {
    toast.error('Token reset password tidak valid. Silakan minta ulang.')
    router.replace('/pelanggan/lupa-password')
    return
  }

  setValues({ email, token })
})

const { mutate: resetPassword, isPending } = useResetPasswordPelanggan()

const onSubmit = handleSubmit((values) => {
  resetPassword(values, {
    onSuccess: () => {
      toast.success('Password berhasil direset. Silakan login dengan password baru.')
      router.push('/pelanggan/masuk')
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
  <Card>
    <CardHeader>
      <CardTitle>Reset Password</CardTitle>
      <CardDescription>Buat password baru untuk akun kamu.</CardDescription>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" novalidate @submit="onSubmit">
        <div class="space-y-2">
          <Label for="password">Password Baru</Label>
          <Input
            id="password"
            v-model="password"
            v-bind="passwordAttrs"
            type="password"
            placeholder="Minimal 8 karakter"
            :aria-invalid="!!errors.password"
          />
          <p v-if="errors.password" class="text-xs text-destructive">{{ errors.password }}</p>
        </div>
        <div class="space-y-2">
          <Label for="password_confirmation">Konfirmasi Password</Label>
          <Input
            id="password_confirmation"
            v-model="passwordConfirmation"
            v-bind="passwordConfirmationAttrs"
            type="password"
            placeholder="Ulangi password"
            :aria-invalid="!!errors.password_confirmation"
          />
          <p v-if="errors.password_confirmation" class="text-xs text-destructive">
            {{ errors.password_confirmation }}
          </p>
        </div>
        <Button type="submit" class="w-full" :disabled="isPending">
          {{ isPending ? 'Menyimpan...' : 'Simpan Password Baru' }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>