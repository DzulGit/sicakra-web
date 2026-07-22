<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { teruskanKeTeknisiSchema } from '@/schemas/laporan-kendala.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useDaftarTeknisi } from '@/modules/permohonan-layanan/composables/usePermohonanLayanan'
import { useTeruskanKeTeknisi } from '../composables/useOperasionalLaporanKendala'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'

const props = defineProps<{ open: boolean; laporanId: number }>()
const emit = defineEmits<{ (e: 'update:open', v: boolean): void }>()

const { data: daftarTeknisi } = useDaftarTeknisi()

const { handleSubmit, errors, defineField, setErrors, resetForm } = useForm({
  validationSchema: toTypedSchema(teruskanKeTeknisiSchema),
})
const [teknisiId, teknisiIdAttrs] = defineField('teknisi_id')

const { mutate, isPending } = useTeruskanKeTeknisi()

const onSubmit = handleSubmit((values) => {
  mutate(
    { id: props.laporanId, payload: values },
    {
      onSuccess: () => {
        toast.success('Laporan diteruskan ke teknisi.')
        resetForm()
        emit('update:open', false)
      },
      onError: (error) => {
        const fieldErrors = mapValidationErrors(error)
        if (fieldErrors) setErrors(fieldErrors)
        else toast.error('Terjadi kesalahan, coba lagi.')
      },
    },
  )
})
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Teruskan ke Teknisi</DialogTitle>
        <DialogDescription>Pilih teknisi yang akan menangani laporan ini.</DialogDescription>
      </DialogHeader>
      <form class="space-y-4" novalidate @submit="onSubmit">
        <div class="space-y-2">
          <Label>Teknisi</Label>
          <Select v-model="teknisiId" v-bind="teknisiIdAttrs">
            <SelectTrigger><SelectValue placeholder="Pilih teknisi" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="t in daftarTeknisi" :key="t.id" :value="String(t.id)">
                {{ t.nama_lengkap }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.teknisi_id" class="text-xs text-destructive">{{ errors.teknisi_id }}</p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" @click="emit('update:open', false)">Batal</Button>
          <Button type="submit" :disabled="isPending">{{ isPending ? 'Menyimpan...' : 'Teruskan' }}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
