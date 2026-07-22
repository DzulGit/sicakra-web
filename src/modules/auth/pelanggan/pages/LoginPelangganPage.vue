<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { loginPelangganSchema, loginPertamaPelangganSchema } from '@/schemas/auth.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useAuthStore } from '@/stores/auth.store'
import { useLoginPelanggan, useLoginPertamaPelanggan } from '../composables/usePelangganAuth'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const authStore = useAuthStore()
const router = useRouter()

// ----- Mode: Login Pertama Kali -----
const formPertama = useForm({
  validationSchema: toTypedSchema(loginPertamaPelangganSchema),
})
const [nomorPelangganPertama, nomorPelangganPertamaAttrs] = formPertama.defineField('nomor_pelanggan')
const [nomorHp, nomorHpAttrs] = formPertama.defineField('nomor_hp')
const { mutate: loginPertama, isPending: isPendingPertama } = useLoginPertamaPelanggan()

const submitLoginPertama = formPertama.handleSubmit((values) => {
  loginPertama(values, {
    onSuccess: ({ data }) => {
      const { pelanggan, token } = data.data
      authStore.setSesi(token, {
        id: pelanggan.id,
        nama_lengkap: pelanggan.nama_lengkap,
        tipe: 'pelanggan',
        password_sudah_dibuat: false,
      })
      toast.info('Silakan buat password baru untuk melanjutkan.')
      router.push('/pelanggan/buat-password')
    },
    onError: (error) => {
      const fieldErrors = mapValidationErrors(error)
      if (fieldErrors) formPertama.setErrors(fieldErrors)
      else toast.error('Terjadi kesalahan, coba lagi.')
    },
  })
})

// ----- Mode: Login Biasa -----
const formBiasa = useForm({
  validationSchema: toTypedSchema(loginPelangganSchema),
})
const [nomorPelangganBiasa, nomorPelangganBiasaAttrs] = formBiasa.defineField('nomor_pelanggan')
const [password, passwordAttrs] = formBiasa.defineField('password')
const { mutate: loginBiasa, isPending: isPendingBiasa } = useLoginPelanggan()

const submitLoginBiasa = formBiasa.handleSubmit((values) => {
  loginBiasa(values, {
    onSuccess: ({ data }) => {
      const { pelanggan, token } = data.data
      authStore.setSesi(token, {
        id: pelanggan.id,
        nama_lengkap: pelanggan.nama_lengkap,
        tipe: 'pelanggan',
        password_sudah_dibuat: true,
      })
      toast.success(`Selamat datang, ${pelanggan.nama_lengkap}`)
      router.push('/pelanggan/dashboard')
    },
    onError: (error) => {
      const fieldErrors = mapValidationErrors(error)
      if (fieldErrors) formBiasa.setErrors(fieldErrors)
      else toast.error('Terjadi kesalahan, coba lagi.')
    },
  })
})
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Masuk sebagai Pelanggan</CardTitle>
      <CardDescription>Pilih sesuai status akun kamu</CardDescription>
    </CardHeader>
    <CardContent>
      <Tabs default-value="biasa">
        <TabsList>
          <TabsTrigger value="biasa">Sudah Punya Password</TabsTrigger>
          <TabsTrigger value="pertama">Pertama Kali Login</TabsTrigger>
        </TabsList>

        <TabsContent value="biasa">
          <form class="space-y-4" novalidate @submit="submitLoginBiasa">
            <div class="space-y-2">
              <Label for="nomor_pelanggan_biasa">Nomor Pelanggan</Label>
              <Input
                id="nomor_pelanggan_biasa"
                v-model="nomorPelangganBiasa"
                v-bind="nomorPelangganBiasaAttrs"
                placeholder="PLG000001"
                :aria-invalid="!!formBiasa.errors.value.nomor_pelanggan"
              />
              <p v-if="formBiasa.errors.value.nomor_pelanggan" class="text-xs text-destructive">
                {{ formBiasa.errors.value.nomor_pelanggan }}
              </p>
            </div>
            <div class="space-y-2">
              <Label for="password">Password</Label>
              <Input
                id="password"
                v-model="password"
                v-bind="passwordAttrs"
                type="password"
                placeholder="••••••••"
                :aria-invalid="!!formBiasa.errors.value.password"
              />
              <p v-if="formBiasa.errors.value.password" class="text-xs text-destructive">
                {{ formBiasa.errors.value.password }}
              </p>
            </div>
            <Button type="submit" class="w-full" :disabled="isPendingBiasa">
              {{ isPendingBiasa ? 'Memproses...' : 'Masuk' }}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="pertama">
          <p class="mb-4 text-xs text-muted-foreground">
            Dipakai hanya untuk login pertama kali setelah pemasangan selesai — pakai Nomor
            Pelanggan dan Nomor HP yang terdaftar, tanpa password.
          </p>
          <form class="space-y-4" novalidate @submit="submitLoginPertama">
            <div class="space-y-2">
              <Label for="nomor_pelanggan_pertama">Nomor Pelanggan</Label>
              <Input
                id="nomor_pelanggan_pertama"
                v-model="nomorPelangganPertama"
                v-bind="nomorPelangganPertamaAttrs"
                placeholder="PLG000001"
                :aria-invalid="!!formPertama.errors.value.nomor_pelanggan"
              />
              <p v-if="formPertama.errors.value.nomor_pelanggan" class="text-xs text-destructive">
                {{ formPertama.errors.value.nomor_pelanggan }}
              </p>
            </div>
            <div class="space-y-2">
              <Label for="nomor_hp">Nomor HP Terdaftar</Label>
              <Input
                id="nomor_hp"
                v-model="nomorHp"
                v-bind="nomorHpAttrs"
                placeholder="081234567890"
                :aria-invalid="!!formPertama.errors.value.nomor_hp"
              />
              <p v-if="formPertama.errors.value.nomor_hp" class="text-xs text-destructive">
                {{ formPertama.errors.value.nomor_hp }}
              </p>
            </div>
            <Button type="submit" class="w-full" :disabled="isPendingPertama">
              {{ isPendingPertama ? 'Memproses...' : 'Lanjutkan' }}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
</template>
