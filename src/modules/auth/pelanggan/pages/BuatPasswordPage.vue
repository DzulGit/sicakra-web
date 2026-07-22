<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { buatPasswordSchema } from '@/schemas/auth.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useAuthStore } from '@/stores/auth.store'
import { useBuatPasswordPelanggan } from '../composables/usePelangganAuth'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const authStore = useAuthStore()
const router = useRouter()

const { handleSubmit, errors, defineField, setErrors } = useForm({
  validationSchema: toTypedSchema(buatPasswordSchema),
})

const [password, passwordAttrs] = defineField('password')
const [passwordConfirmation, passwordConfirmationAttrs] = defineField('password_confirmation')

const { mutate: buatPassword, isPending } = useBuatPasswordPelanggan()

const onSubmit = handleSubmit((values) => {
  buatPassword(values, {
    onSuccess: ({ data }) => {
      // Token lama (dari login-pertama) diganti token baru untuk sesi dashboard penuh.
      authStore.setSesi(data.data.token, {
        ...authStore.pengguna!,
        password_sudah_dibuat: true,
      })
      toast.success('Password berhasil dibuat.')
      router.push('/pelanggan/dashboard')
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
      <CardTitle>Buat Password Baru</CardTitle>
      <CardDescription>
        Ini login pertama kamu — buat password supaya bisa login lebih cepat berikutnya.
      </CardDescription>
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
          {{ isPending ? 'Menyimpan...' : 'Simpan Password' }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
