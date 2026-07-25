<script setup lang="ts">
import { computed, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import {
  ubahProfilSchema,
  ubahUsernameSchema,
  buatUbahPasswordSchema,
} from '@/schemas/profil.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useProfil, useUbahProfil, useUbahUsername, useUbahPassword } from '../composables/useProfil'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const { data: profil, isLoading } = useProfil()

// ---------- Form: Ubah Data (nama & email) ----------
const { handleSubmit, errors, defineField, setErrors, setValues } = useForm({
  validationSchema: toTypedSchema(ubahProfilSchema),
})
const [namaLengkap, namaLengkapAttrs] = defineField('nama_lengkap')
const [email, emailAttrs] = defineField('email')

watch(
  profil,
  (nilai) => {
    if (nilai) setValues({ nama_lengkap: nilai.nama_lengkap, email: nilai.email ?? '' })
  },
  { immediate: true },
)

const { mutate, isPending } = useUbahProfil()

const onSubmit = handleSubmit((values) => {
  mutate(values, {
    onSuccess: () => toast.success('Profil berhasil diperbarui.'),
    onError: (error) => {
      const fieldErrors = mapValidationErrors(error)
      if (fieldErrors) setErrors(fieldErrors)
      else toast.error('Terjadi kesalahan, coba lagi.')
    },
  })
})

// ---------- Form: Ubah Username ----------
const {
  handleSubmit: handleSubmitUsername,
  errors: errorsUsername,
  defineField: defineFieldUsername,
  setErrors: setErrorsUsername,
  setValues: setValuesUsername,
} = useForm({
  validationSchema: toTypedSchema(ubahUsernameSchema),
})
const [username, usernameAttrs] = defineFieldUsername('username')

watch(
  profil,
  (nilai) => {
    if (nilai) setValuesUsername({ username: nilai.username ?? '' })
  },
  { immediate: true },
)

const { mutate: submitUsername, isPending: isPendingUsername } = useUbahUsername()

const onSubmitUsername = handleSubmitUsername((values) => {
  submitUsername(values, {
    onSuccess: () => toast.success('Username berhasil diperbarui.'),
    onError: (error) => {
      const fieldErrors = mapValidationErrors(error)
      if (fieldErrors) setErrorsUsername(fieldErrors)
      else toast.error('Terjadi kesalahan, coba lagi.')
    },
  })
})

// ---------- Form: Ubah Password ----------
// Kalau pelanggan belum pernah ganti password (masih pakai default =
// nomor_pelanggan), password lama TIDAK diminta. Skema divalidasi ulang
// setiap kali status ini berubah.
const wajibPasswordLama = computed(() => profil.value?.password_sudah_dibuat === true)

const {
  handleSubmit: handleSubmitPassword,
  errors: errorsPassword,
  defineField: defineFieldPassword,
  setErrors: setErrorsPassword,
  resetForm: resetFormPassword,
} = useForm({
  validationSchema: computed(() => toTypedSchema(buatUbahPasswordSchema(wajibPasswordLama.value))),
})
const [passwordLama, passwordLamaAttrs] = defineFieldPassword('password_lama')
const [passwordBaru, passwordBaruAttrs] = defineFieldPassword('password')
const [passwordKonfirmasi, passwordKonfirmasiAttrs] = defineFieldPassword('password_confirmation')

const { mutate: submitPassword, isPending: isPendingPassword } = useUbahPassword()

const onSubmitPassword = handleSubmitPassword((values) => {
  submitPassword(values, {
    onSuccess: () => {
      toast.success('Password berhasil diperbarui.')
      resetFormPassword()
    },
    onError: (error) => {
      const fieldErrors = mapValidationErrors(error)
      if (fieldErrors) setErrorsPassword(fieldErrors)
      else toast.error('Terjadi kesalahan, coba lagi.')
    },
  })
})
</script>

<template>
  <div v-if="isLoading" class="max-w-lg"><Skeleton class="h-72 w-full" /></div>

  <div v-else class="max-w-lg space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Profil Saya</CardTitle>
        <CardDescription>Nomor pelanggan, NIK, dan nomor HP tidak bisa diubah sendiri.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-3 text-sm">
        <div>
          <p class="text-muted-foreground">Nomor Pelanggan</p>
          <p class="font-medium">{{ profil?.nomor_pelanggan }}</p>
        </div>
        <div>
          <p class="text-muted-foreground">NIK</p>
          <p class="font-medium">{{ profil?.nik }}</p>
        </div>
        <div>
          <p class="text-muted-foreground">Nomor HP</p>
          <p class="font-medium">{{ profil?.nomor_hp }}</p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Ubah Data</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" novalidate @submit="onSubmit">
          <div class="space-y-2">
            <Label for="nama_lengkap">Nama Lengkap</Label>
            <Input
              id="nama_lengkap"
              v-model="namaLengkap"
              v-bind="namaLengkapAttrs"
              :aria-invalid="!!errors.nama_lengkap"
            />
            <p v-if="errors.nama_lengkap" class="text-xs text-destructive">{{ errors.nama_lengkap }}</p>
          </div>
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input id="email" v-model="email" v-bind="emailAttrs" type="email" :aria-invalid="!!errors.email" />
            <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
          </div>
          <Button type="submit" :disabled="isPending">{{ isPending ? 'Menyimpan...' : 'Simpan' }}</Button>
        </form>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Ubah Username</CardTitle>
        <CardDescription>Dipakai untuk login. Awalnya sama dengan nomor pelanggan.</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" novalidate @submit="onSubmitUsername">
          <div class="space-y-2">
            <Label for="username">Username</Label>
            <Input
              id="username"
              v-model="username"
              v-bind="usernameAttrs"
              autocomplete="username"
              :aria-invalid="!!errorsUsername.username"
            />
            <p v-if="errorsUsername.username" class="text-xs text-destructive">
              {{ errorsUsername.username }}
            </p>
          </div>
          <Button type="submit" :disabled="isPendingUsername">
            {{ isPendingUsername ? 'Menyimpan...' : 'Simpan Username' }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Ubah Password</CardTitle>
        <CardDescription>
          {{
            wajibPasswordLama
              ? 'Masukkan password lama untuk mengganti password.'
              : 'Kamu belum pernah ganti password — cukup buat password baru.'
          }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" novalidate @submit="onSubmitPassword">
          <div v-if="wajibPasswordLama" class="space-y-2">
            <Label for="password_lama">Password Lama</Label>
            <Input
              id="password_lama"
              v-model="passwordLama"
              v-bind="passwordLamaAttrs"
              type="password"
              autocomplete="current-password"
              :aria-invalid="!!errorsPassword.password_lama"
            />
            <p v-if="errorsPassword.password_lama" class="text-xs text-destructive">
              {{ errorsPassword.password_lama }}
            </p>
          </div>
          <div class="space-y-2">
            <Label for="password_baru">Password Baru</Label>
            <Input
              id="password_baru"
              v-model="passwordBaru"
              v-bind="passwordBaruAttrs"
              type="password"
              placeholder="Minimal 8 karakter"
              autocomplete="new-password"
              :aria-invalid="!!errorsPassword.password"
            />
            <p v-if="errorsPassword.password" class="text-xs text-destructive">
              {{ errorsPassword.password }}
            </p>
          </div>
          <div class="space-y-2">
            <Label for="password_confirmation">Konfirmasi Password Baru</Label>
            <Input
              id="password_confirmation"
              v-model="passwordKonfirmasi"
              v-bind="passwordKonfirmasiAttrs"
              type="password"
              autocomplete="new-password"
              :aria-invalid="!!errorsPassword.password_confirmation"
            />
            <p v-if="errorsPassword.password_confirmation" class="text-xs text-destructive">
              {{ errorsPassword.password_confirmation }}
            </p>
          </div>
          <Button type="submit" :disabled="isPendingPassword">
            {{ isPendingPassword ? 'Menyimpan...' : 'Simpan Password' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>