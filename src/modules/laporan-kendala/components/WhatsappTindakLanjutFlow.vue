<script setup lang="ts">
import { computed, ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { tindakLanjutLaporanSchema } from '@/schemas/laporan-kendala.schema'
import { mapValidationErrors } from '@/lib/errors'
import { useTindakLanjutLaporan } from '../composables/useOperasionalLaporanKendala'
import { useDaftarTeknisi } from '@/modules/permohonan-layanan/composables/usePermohonanLayanan'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { LaporanKendala } from '@/types/models'
import { useTimTeknisiAktif } from '@/modules/tim-teknisi/composables/useTimTeknisi'
import TeknisiChecklist from '@/components/data/TeknisiChecklist.vue'
import { Input } from '@/components/ui/input'

const props = defineProps<{ laporan: LaporanKendala }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const langkah = ref<'wa' | 'form'>('wa')

const waMessage = computed(() => {
  const text = `Yth. Bapak/Ibu *${props.laporan.layanan_internet?.pelanggan?.nama_lengkap || '-'}*,

Kami dari Tim Layanan Pelanggan Sicakra menginformasikan bahwa laporan kendala dengan nomor tiket *${props.laporan.nomor_laporan}* telah kami terima.

*Rincian Laporan:*
Kategori: ${props.laporan.kategori_kendala}
Keluhan: "${props.laporan.deskripsi}"

Saat ini, tim kami sedang melakukan pengecekan awal pada sistem. Apakah terdapat informasi tambahan yang dapat Bapak/Ibu sampaikan terkait kendala ini?`

  const hp = props.laporan.layanan_internet?.pelanggan?.nomor_hp
  const url = hp ? `https://wa.me/${hp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}` : null
  return { text, url }
})

const { data: daftarTeknisi } = useDaftarTeknisi()
const { data: daftarTim } = useTimTeknisiAktif()

const rekomendasiKeputusan = computed(() => {
  const kategori = props.laporan.kategori_kendala?.toLowerCase() || ''
  const butuhTeknisi = ['los', 'putus', 'lambat', 'mati', 'koneksi', 'perangkat', 'router'].some(k => kategori.includes(k))

  return butuhTeknisi ? 'TERUSKAN_TEKNISI' : 'SELESAI_REMOTE'
})

const { handleSubmit, errors, defineField, setErrors, setFieldValue, values } = useForm({
  validationSchema: toTypedSchema(tindakLanjutLaporanSchema),
  initialValues: { keputusan: rekomendasiKeputusan.value, teknisi_ids: [] }
})

const [keputusan, keputusanAttrs] = defineField('keputusan')
const [timTeknisiId, timTeknisiIdAttrs] = defineField('tim_teknisi_id')
const [tanggalKerja, tanggalKerjaAttrs] = defineField('tanggal_kerja')
const [hasilPenanganan, hasilPenangananAttrs] = defineField('hasil_penanganan')

const { mutate, isPending } = useTindakLanjutLaporan()

const onSubmit = handleSubmit((formValues) => {
  mutate({ id: props.laporan.id, payload: formValues }, {
    onSuccess: () => {
      toast.success(formValues.keputusan === 'SELESAI_REMOTE' ? 'Laporan ditutup.' : 'Berhasil menugaskan teknisi.')
      emit('close')
    },
    onError: (error) => {
      const fieldErrors = mapValidationErrors(error)
      if (fieldErrors) setErrors(fieldErrors)
      else toast.error('Terjadi kesalahan.')
    }
  })
})

function bukaWhatsApp() {
  if (waMessage.value.url) window.open(waMessage.value.url, '_blank')
}
function salinPesan() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(waMessage.value.text)
    toast.success('Pesan disalin')
  }
}

function pilihTim(timId: string) {
  setFieldValue('tim_teknisi_id', timId)
  const tim = daftarTim.value?.find((t) => String(t.id) === timId)
  if (tim) {
    setFieldValue('teknisi_ids', (tim.anggota ?? []).map((a) => a.id))
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <span :class="langkah === 'wa' ? 'font-semibold text-foreground' : ''">1. Kirim WhatsApp</span>
      <span class="text-xs">→</span>
      <span :class="langkah === 'form' ? 'font-semibold text-foreground' : ''">2. Keputusan & Tindak Lanjut</span>
    </div>

    <template v-if="langkah === 'wa'">
      <Card>
        <CardHeader>
          <CardTitle class="text-base">Pesan WhatsApp</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <Textarea :model-value="waMessage.text" rows="12" class="font-mono text-xs" readonly />
          <div class="flex gap-2">
            <Button variant="outline" @click="bukaWhatsApp">Buka WhatsApp</Button>
            <Button @click="salinPesan">Salin Pesan</Button>
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
          <CardTitle class="text-base">Konfirmasi</CardTitle>
        </CardHeader>
        <CardContent>
          <form class="space-y-4" novalidate @submit="onSubmit">
            <div class="space-y-2">
              <Label>Keputusan Akhir</Label>
              <Select v-model="keputusan" v-bind="keputusanAttrs">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih keputusan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SELESAI_REMOTE">Selesai via Remote (Tutup Tiket)</SelectItem>
                  <SelectItem value="TERUSKAN_TEKNISI">Teruskan ke Teknisi (Tugas Lapangan)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div v-if="values.keputusan === 'TERUSKAN_TEKNISI'" class="space-y-4">
              <div class="space-y-2">
                <Label>Pilih Tim <span class="text-muted-foreground">(opsional)</span></Label>
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
            </div>

            <div v-if="values.keputusan === 'SELESAI_REMOTE'" class="space-y-2">
              <Label>Hasil Penanganan</Label>
              <Textarea v-model="hasilPenanganan" v-bind="hasilPenangananAttrs"
                placeholder="Jelaskan tindakan yang menyelesaikan kendala" />
              <p v-if="errors.hasil_penanganan" class="text-xs text-destructive">{{ errors.hasil_penanganan }}</p>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" @click="langkah = 'wa'">Kembali</Button>
              <Button type="submit" :disabled="isPending">{{ isPending ? 'Menyimpan...' : 'Simpan Keputusan' }}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </template>
  </div>
</template>