<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { lupaPasswordSchema } from '@/schemas/auth.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useLupaPasswordPelanggan } from '../composables/usePelangganAuth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

const { handleSubmit, errors, defineField, setErrors } = useForm({
  validationSchema: toTypedSchema(lupaPasswordSchema),
})

const [email, emailAttrs] = defineField('email')

const { mutate: lupaPassword, isPending, isSuccess } = useLupaPasswordPelanggan()

const onSubmit = handleSubmit((values) => {
  lupaPassword(values, {
    onSuccess: () => {
      toast.success('Link reset password telah dikirim ke email Anda.')
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
      <CardTitle>Lupa Password</CardTitle>
      <CardDescription>
        Masukkan email yang terdaftar — kami akan mengirimkan link untuk mereset password Anda.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <template v-if="isSuccess">
        <div class="rounded-md bg-primary/10 p-4 text-sm text-primary">
          Link reset password sudah dikirim ke email Anda. Silakan cek inbox (atau folder spam).
        </div>
        <RouterLink
          to="/pelanggan/masuk"
          class="mt-4 block text-center text-sm font-medium text-primary hover:underline"
        >
          Kembali ke halaman masuk
        </RouterLink>
      </template>

      <form v-else class="space-y-4" novalidate @submit="onSubmit">
        <div class="space-y-2">
          <Label for="email">Email Terdaftar</Label>
          <Input
            id="email"
            v-model="email"
            v-bind="emailAttrs"
            type="email"
            placeholder="nama@email.com"
            autocomplete="email"
            :aria-invalid="!!errors.email"
          />
          <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
        </div>
        <Button type="submit" class="w-full" :disabled="isPending">
          {{ isPending ? 'Mengirim...' : 'Kirim Link Reset' }}
        </Button>
        <RouterLink to="/pelanggan/masuk" class="block text-center text-sm text-muted-foreground hover:underline">
          Ingat password? Masuk di sini
        </RouterLink>
      </form>
    </CardContent>
  </Card>
</template>