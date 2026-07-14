<script setup lang="ts">
import { watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { ubahProfilSchema } from '@/schemas/profil.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useProfil, useUbahProfil } from '../composables/useProfil'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const { data: profil, isLoading } = useProfil()

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
  </div>
</template>
