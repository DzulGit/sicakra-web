<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { verifikasiPermohonanSchema } from '@/schemas/permohonan-layanan.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useVerifikasiPermohonan } from '../composables/usePermohonanLayanan'
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
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'

const props = defineProps<{ open: boolean; permohonanId: number }>()
const emit = defineEmits<{ (e: 'update:open', v: boolean): void }>()

const { handleSubmit, errors, defineField, setErrors, resetForm } = useForm({
  validationSchema: toTypedSchema(verifikasiPermohonanSchema),
})
const [status, statusAttrs] = defineField('status')
const [catatan, catatanAttrs] = defineField('catatan')

const { mutate, isPending } = useVerifikasiPermohonan()

const onSubmit = handleSubmit((values) => {
  mutate(
    { id: props.permohonanId, payload: values },
    {
      onSuccess: () => {
        toast.success('Verifikasi berhasil disimpan.')
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
        <DialogTitle>Verifikasi Permohonan</DialogTitle>
        <DialogDescription>Terima, tolak, atau minta revisi data pendaftaran ini.</DialogDescription>
      </DialogHeader>
      <form class="space-y-4" novalidate @submit="onSubmit">
        <div class="space-y-2">
          <Label>Keputusan</Label>
          <Select v-model="status" v-bind="statusAttrs">
            <SelectTrigger><SelectValue placeholder="Pilih keputusan" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DITERIMA">Terima</SelectItem>
              <SelectItem value="PERLU_REVISI">Minta Revisi</SelectItem>
              <SelectItem value="DITOLAK">Tolak</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.status" class="text-xs text-destructive">{{ errors.status }}</p>
        </div>
        <div class="space-y-2">
          <Label for="catatan">Catatan</Label>
          <Textarea
            id="catatan"
            v-model="catatan"
            v-bind="catatanAttrs"
            placeholder="Wajib diisi untuk Tolak / Perlu Revisi"
          />
          <p v-if="errors.catatan" class="text-xs text-destructive">{{ errors.catatan }}</p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" @click="emit('update:open', false)">Batal</Button>
          <Button type="submit" :disabled="isPending">{{ isPending ? 'Menyimpan...' : 'Simpan' }}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>