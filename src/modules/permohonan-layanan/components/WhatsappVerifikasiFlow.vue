<script setup lang="ts">
import { computed, ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { verifikasiDanJadwalkanSchema } from '@/schemas/permohonan-layanan.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useDaftarTeknisi, useVerifikasiDanJadwalkan, generateWaMessage } from '../composables/usePermohonanLayanan'
import { useTimTeknisiAktif } from '@/modules/tim-teknisi/composables/useTimTeknisi'
import TeknisiChecklist from '@/components/data/TeknisiChecklist.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import type { PermohonanLayanan } from '@/types/models'

const props = defineProps<{ permohonan: PermohonanLayanan }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const langkah = ref<'wa' | 'form'>('wa')
const waMessage = computed(() => generateWaMessage(props.permohonan))

const { data: daftarTeknisi } = useDaftarTeknisi()
const { data: daftarTim } = useTimTeknisiAktif()

const { handleSubmit, errors, defineField, setErrors, setFieldValue, values } = useForm({
  validationSchema: toTypedSchema(verifikasiDanJadwalkanSchema),
  initialValues: {
    status: 'DITERIMA',
    teknisi_ids: [],
    tipe_paket: props.permohonan.tipe_paket
  },
})

const [status, statusAttrs] = defineField('status')
const [catatan, catatanAttrs] = defineField('catatan')
const [timTeknisiId, timTeknisiIdAttrs] = defineField('tim_teknisi_id')
const [tanggalKerja, tanggalKerjaAttrs] = defineField('tanggal_kerja')
const [hargaCustom, hargaCustomAttrs] = defineField('harga_custom')

function pilihTim(timId: string) {
  setFieldValue('tim_teknisi_id', timId)
  const tim = daftarTim.value?.find((t) => String(t.id) === timId)
  if (tim) {
    setFieldValue('teknisi_ids', (tim.anggota ?? []).map((a) => a.id))
  }
}

const { mutate, isPending } = useVerifikasiDanJadwalkan()

const onSubmit = handleSubmit((formValues) => {
  mutate(
    { id: props.permohonan.id, payload: formValues },
    {
      onSuccess: () => {
        toast.success(
          formValues.status === 'DITERIMA'
            ? 'Permohonan diterima & jadwal kerja telah dibuat.'
            : 'Verifikasi berhasil disimpan.',
        )
        emit('close')
      },
      onError: (error) => {
        const fieldErrors = mapValidationErrors(error)
        if (fieldErrors) setErrors(fieldErrors)
        else toast.error('Terjadi kesalahan, coba lagi.')
      },
    },
  )
})

function bukaWhatsApp() {
  if (waMessage.value.waUrl) window.open(waMessage.value.waUrl, '_blank')
}

const butuhJadwal = computed(() => values.status === 'DITERIMA')

function salinPesan() {
  if (navigator && navigator.clipboard) {
    navigator.clipboard.writeText(waMessage.value.text)
    toast.success('Pesan disalin')
  } else {
    toast.error('Gagal menyalin pesan')
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <span :class="langkah === 'wa' ? 'font-semibold text-foreground' : ''">1. Kirim WhatsApp</span>
      <span class="text-xs">→</span>
      <span :class="langkah === 'form' ? 'font-semibold text-foreground' : ''">2. Konfirmasi & Jadwalkan</span>
    </div>

    <template v-if="langkah === 'wa'">
      <Card>
        <CardHeader>
          <CardTitle class="text-base">Pesan WhatsApp</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-2 gap-4 rounded-lg bg-muted p-4 text-sm">
            <div>
              <p class="text-xs text-muted-foreground">Pelanggan</p>
              <p class="font-medium">{{ permohonan.pelanggan?.nama_lengkap }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">No. WhatsApp</p>
              <p class="font-medium">{{ permohonan.pelanggan?.nomor_hp }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Paket</p>
              <p class="font-medium">
                {{ permohonan.tipe_paket === 'reguler' ? permohonan.paket_internet?.nama_paket :
                  permohonan.nama_paket_custom }}
              </p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">No. Permohonan</p>
              <p class="font-medium">{{ permohonan.nomor_permohonan }}</p>
            </div>
          </div>

          <Textarea :model-value="waMessage.text" rows="12" class="font-mono text-xs" readonly />

          <div class="flex gap-2">
            <Button variant="outline" @click="bukaWhatsApp">
              Buka WhatsApp
            </Button>
            <Button @click="salinPesan">
              Salin Pesan
            </Button>
          </div>
        </CardContent>
      </Card>

      <div class="flex justify-end gap-2">
        <Button variant="ghost" @click="emit('close')">Batal</Button>
        <Button @click="langkah = 'form'">Pelanggan sudah dihubungi — Lanjutkan</Button>
      </div>
    </template>

    <template v-else>
      <Card>
        <CardHeader>
          <CardTitle class="text-base">Konfirmasi & Jadwalkan</CardTitle>
        </CardHeader>
        <CardContent>
          <form class="space-y-4" novalidate @submit="onSubmit">
            <div class="space-y-2">
              <Label>Keputusan</Label>
              <Select v-model="status" v-bind="statusAttrs">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih keputusan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DITERIMA">Terima & Jadwalkan</SelectItem>
                  <SelectItem value="PERLU_REVISI">Minta Revisi</SelectItem>
                  <SelectItem value="DITOLAK">Tolak</SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.status" class="text-xs text-destructive">{{ errors.status }}</p>
            </div>

            <template v-if="butuhJadwal">
              <Separator />

              <div v-if="permohonan.tipe_paket === 'custom'" class="space-y-2 mt-4 mb-4">
                <Label for="harga_custom">Harga Kesepakatan (Rp/Bulan)</Label>
                <Input id="harga_custom" type="number" v-model="hargaCustom" v-bind="hargaCustomAttrs"
                  placeholder="Mis: 350000" :aria-invalid="!!errors.harga_custom" />
                <p v-if="errors.harga_custom" class="text-xs text-destructive">{{ errors.harga_custom }}</p>
                <p class="text-xs text-muted-foreground">Harga ini akan digunakan sebagai tagihan bulanan pelanggan.</p>
              </div>

              <div class="space-y-2">
                <Label>Pilih Tim <span class="text-muted-foreground">(opsional, isi cepat)</span></Label>
                <Select :model-value="timTeknisiId" v-bind="timTeknisiIdAttrs"
                  @update:model-value="(v) => pilihTim(v as string)">
                  <SelectTrigger>
                    <SelectValue placeholder="Atau assign manual di bawah" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="t in daftarTim ?? []" :key="t.id" :value="String(t.id)">
                      {{ t.nama_tim }} ({{ (t.anggota ?? []).length }} orang)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="space-y-2">
                <Label>Teknisi Ditugaskan</Label>
                <TeknisiChecklist :daftar-teknisi="daftarTeknisi ?? []" :model-value="values.teknisi_ids ?? []"
                  @update:model-value="(v) => setFieldValue('teknisi_ids', v)" />
                <p v-if="errors.teknisi_ids" class="text-xs text-destructive">{{ errors.teknisi_ids }}</p>
              </div>

              <div class="space-y-2">
                <Label for="tanggal_kerja">Tanggal Kunjungan</Label>
                <Input id="tanggal_kerja" v-model="tanggalKerja" v-bind="tanggalKerjaAttrs" type="date"
                  :aria-invalid="!!errors.tanggal_kerja" />
                <p v-if="errors.tanggal_kerja" class="text-xs text-destructive">{{ errors.tanggal_kerja }}</p>
              </div>
            </template>

            <div v-if="!butuhJadwal" class="space-y-2">
              <Label for="catatan">Catatan</Label>
              <Textarea id="catatan" v-model="catatan" v-bind="catatanAttrs"
                placeholder="Wajib diisi untuk Tolak / Perlu Revisi" />
              <p v-if="errors.catatan" class="text-xs text-destructive">{{ errors.catatan }}</p>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" @click="langkah = 'wa'">Kembali</Button>
              <Button type="submit" :disabled="isPending">
                {{ isPending ? 'Menyimpan...' : 'Simpan' }}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
