<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { jadwalkanPemasanganSchema } from '@/schemas/permohonan-layanan.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useDaftarTeknisi, useJadwalkanPemasangan } from '../composables/usePermohonanLayanan'
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
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'

const props = defineProps<{ open: boolean; permohonanId: number }>()
const emit = defineEmits<{ (e: 'update:open', v: boolean): void }>()

const { data: daftarTeknisi } = useDaftarTeknisi()

const { handleSubmit, errors, defineField, setErrors, resetForm } = useForm({
  validationSchema: toTypedSchema(jadwalkanPemasanganSchema),
})
const [adminId, adminIdAttrs] = defineField('admin_id')
const [tanggalPemasangan, tanggalPemasanganAttrs] = defineField('tanggal_pemasangan')

const { mutate, isPending } = useJadwalkanPemasangan()

const onSubmit = handleSubmit((values) => {
  mutate(
    { id: props.permohonanId, payload: values },
    {
      onSuccess: () => {
        toast.success('Jadwal pemasangan berhasil dibuat.')
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
        <DialogTitle>Jadwalkan Pemasangan</DialogTitle>
        <DialogDescription>Pilih teknisi dan tanggal pelaksanaan pemasangan.</DialogDescription>
      </DialogHeader>
      <form class="space-y-4" novalidate @submit="onSubmit">
        <div class="space-y-2">
          <Label>Teknisi</Label>
          <Select v-model="adminId" v-bind="adminIdAttrs">
            <SelectTrigger><SelectValue placeholder="Pilih teknisi" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="t in daftarTeknisi" :key="t.id" :value="String(t.id)">
                {{ t.nama_lengkap }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.admin_id" class="text-xs text-destructive">{{ errors.admin_id }}</p>
        </div>
        <div class="space-y-2">
          <Label for="tanggal_pemasangan">Tanggal Pemasangan</Label>
          <Input
            id="tanggal_pemasangan"
            v-model="tanggalPemasangan"
            v-bind="tanggalPemasanganAttrs"
            type="date"
            :aria-invalid="!!errors.tanggal_pemasangan"
          />
          <p v-if="errors.tanggal_pemasangan" class="text-xs text-destructive">
            {{ errors.tanggal_pemasangan }}
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" @click="emit('update:open', false)">Batal</Button>
          <Button type="submit" :disabled="isPending">{{ isPending ? 'Menyimpan...' : 'Jadwalkan' }}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
