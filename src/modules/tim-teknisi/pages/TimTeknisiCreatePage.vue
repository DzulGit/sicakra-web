<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { simpanTimTeknisiSchema } from '@/schemas/tim-teknisi.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useSimpanTimTeknisi } from '../composables/useTimTeknisi'
import { useDaftarTeknisi } from '@/modules/permohonan-layanan/composables/usePermohonanLayanan'
import TeknisiChecklist from '@/components/data/TeknisiChecklist.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const router = useRouter()
const { data: daftarTeknisi } = useDaftarTeknisi()

const { handleSubmit, errors, defineField, setErrors, setFieldValue, values } = useForm({
  validationSchema: toTypedSchema(simpanTimTeknisiSchema),
  initialValues: { anggota_ids: [] },
})
const [namaTim, namaTimAttrs] = defineField('nama_tim')

const { mutate, isPending } = useSimpanTimTeknisi()

const onSubmit = handleSubmit((formValues) => {
  mutate(formValues, {
    onSuccess: () => {
      toast.success('Tim teknisi berhasil dibuat.')
      router.push('/admin/super-admin/tim-teknisi')
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
    <CardHeader>
      <CardTitle>Tambah Tim Teknisi</CardTitle>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" novalidate @submit="onSubmit">
        <div class="space-y-2">
          <Label for="nama_tim">Nama Tim</Label>
          <Input id="nama_tim" v-model="namaTim" v-bind="namaTimAttrs" placeholder="mis. Tim Alpha" :aria-invalid="!!errors.nama_tim" />
          <p v-if="errors.nama_tim" class="text-xs text-destructive">{{ errors.nama_tim }}</p>
        </div>
        <div class="space-y-2">
          <Label>Anggota</Label>
          <TeknisiChecklist
            :daftar-teknisi="daftarTeknisi ?? []"
            :model-value="values.anggota_ids ?? []"
            @update:model-value="(v) => setFieldValue('anggota_ids', v)"
          />
          <p v-if="errors.anggota_ids" class="text-xs text-destructive">{{ errors.anggota_ids }}</p>
        </div>
        <Button type="submit" class="w-full" :disabled="isPending">
          {{ isPending ? 'Menyimpan...' : 'Simpan' }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>