<script setup lang="ts">
import { computed } from 'vue'
import { toast } from 'vue-sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { PermohonanLayanan } from '@/types/models'

const props = defineProps<{ permohonan: PermohonanLayanan }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const kunjunganKendala = computed(() =>
  (props.permohonan.jadwal_kerja ?? [])
    .filter((jadwal) => jadwal.hasil === 'kendala')
    .sort((a, b) => new Date(b.tanggal_kerja).getTime() - new Date(a.tanggal_kerja).getTime())[0],
)

const tanggalKunjungan = computed(() => {
  const jadwal = kunjunganKendala.value
  if (!jadwal) return null
  return new Date(jadwal.tanggal_kerja).toLocaleDateString('id-ID', { dateStyle: 'long' })
})

const isiPesan = computed(() => {
  const permohonan = props.permohonan
  const jadwal = kunjunganKendala.value
  const nama = permohonan.pelanggan?.nama_lengkap ?? '(nama belum tersedia)'
  const kendala = jadwal?.catatan_kendala ?? permohonan.alasan_ditunda ?? 'ada kendala saat kunjungan sebelumnya'
  const tanggal = tanggalKunjungan.value ? `tanggal *${tanggalKunjungan.value}*` : 'pada kunjungan sebelumnya'

  return [
    `Yth. Bapak/Ibu *${nama}*,`,
    '',
    'Kami dari Tim Sicakra menginformasikan bahwa jadwal survey/pemasangan pada ' + tanggal +
      ' tidak dapat diselesaikan karena kendala berikut:',
    '',
    `*Kendala:* ${kendala}`,
    '',
    'Kami akan mengatur jadwal ulang dan menghubungi Anda kembali. Mohon maaf atas ketidaknyamanannya.',
    '',
    'Terima kasih.',
  ].join('\n')
})

const waMessage = computed(() => {
  const hp = props.permohonan.pelanggan?.nomor_hp
  const url = hp
    ? `https://wa.me/${hp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(isiPesan.value)}`
    : null
  return { text: isiPesan.value, url }
})

function bukaWhatsApp() {
  if (waMessage.value.url) window.open(waMessage.value.url, '_blank')
}

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
    <Card>
      <CardHeader>
        <CardTitle class="text-base">Pesan WhatsApp — Konfirmasi Kendala Kunjungan</CardTitle>
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
            <p class="text-xs text-muted-foreground">No. Permohonan</p>
            <p class="font-medium">{{ permohonan.nomor_permohonan }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">Tanggal Kunjungan</p>
            <p class="font-medium">{{ tanggalKunjungan ?? '—' }}</p>
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
      <Button @click="emit('close')">Selesai</Button>
    </div>
  </div>
</template>