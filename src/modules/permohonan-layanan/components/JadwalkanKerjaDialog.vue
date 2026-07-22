<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { jadwalkanKerjaSchema } from '@/schemas/permohonan-layanan.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useDaftarTeknisi, useJadwalkanKerja } from '../composables/usePermohonanLayanan'
import { useTimTeknisiAktif } from '@/modules/tim-teknisi/composables/useTimTeknisi'
import TeknisiChecklist from '@/components/data/TeknisiChecklist.vue'
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
const { data: daftarTim } = useTimTeknisiAktif()

const { handleSubmit, errors, defineField, setErrors, setFieldValue, resetForm, values } = useForm({
  validationSchema: toTypedSchema(jadwalkanKerjaSchema),
  initialValues: { teknisi_ids: [] },
})
const [timTeknisiId, timTeknisiIdAttrs] = defineField('tim_teknisi_id')
const [tanggalKerja, tanggalKerjaAttrs] = defineField('tanggal_kerja')

// Shortcut: pilih tim -> auto-centang semua anggotanya. Tetap bisa
// ditambah/dikurangi manual sesudahnya di checklist bawah.
function pilihTim(timId: string) {
  setFieldValue('tim_teknisi_id', timId)
  const tim = daftarTim.value?.find((t) => String(t.id) === timId)
  if (tim) {
    setFieldValue('teknisi_ids', (tim.anggota ?? []).map((a) => a.id))
  }
}

const { mutate, isPending } = useJadwalkanKerja()

const onSubmit = handleSubmit((formValues) => {
  mutate(
    { id: props.permohonanId, payload: formValues },
    {
      onSuccess: () => {
        toast.success('Jadwal kerja berhasil dibuat.')
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
        <DialogTitle>Jadwalkan Kerja</DialogTitle>
        <DialogDescription>
          Satu kunjungan buat survey sekaligus pemasangan. Pilih tim (opsional, buat isi cepat)
          atau tentukan teknisi satu-satu.
        </DialogDescription>
      </DialogHeader>
      <form class="space-y-4" novalidate @submit="onSubmit">
        <div class="space-y-2">
          <Label>Pilih Tim <span class="text-muted-foreground">(opsional, isi cepat)</span></Label>
          <Select :model-value="timTeknisiId" v-bind="timTeknisiIdAttrs" @update:model-value="(v) => pilihTim(v as string)">
            <SelectTrigger><SelectValue placeholder="Atau assign manual di bawah" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="t in daftarTim ?? []" :key="t.id" :value="String(t.id)">
                {{ t.nama_tim }} ({{ (t.anggota ?? []).length }} orang)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label>Teknisi Ditugaskan</Label>
          <TeknisiChecklist
            :daftar-teknisi="daftarTeknisi ?? []"
            :model-value="values.teknisi_ids ?? []"
            @update:model-value="(v) => setFieldValue('teknisi_ids', v)"
          />
          <p v-if="errors.teknisi_ids" class="text-xs text-destructive">{{ errors.teknisi_ids }}</p>
        </div>

        <div class="space-y-2">
          <Label for="tanggal_kerja">Tanggal Kunjungan</Label>
          <Input
            id="tanggal_kerja"
            v-model="tanggalKerja"
            v-bind="tanggalKerjaAttrs"
            type="date"
            :aria-invalid="!!errors.tanggal_kerja"
          />
          <p v-if="errors.tanggal_kerja" class="text-xs text-destructive">{{ errors.tanggal_kerja }}</p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="emit('update:open', false)">Batal</Button>
          <Button type="submit" :disabled="isPending">{{ isPending ? 'Menyimpan...' : 'Jadwalkan' }}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>