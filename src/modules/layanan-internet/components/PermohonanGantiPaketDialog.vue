<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { getPaketInternetList } from '@/modules/paket-internet/api/paketInternet.api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { useBuatPermohonan } from '../composables/usePelangganLayanan'
import type { LayananInternetDetail } from '@/types/models'
import { Input } from '@/components/ui/input'

const props = defineProps<{ layanan: LayananInternetDetail }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const { data: daftarPaket } = useQuery({
  queryKey: ['paket-internet', 'aktif'],
  queryFn: () => getPaketInternetList().then((r) => r.data.data),
})

const paketIdBaru = ref<number | null>(null)
const alasan = ref('')
const isSubmitting = ref(false)
const error = ref('')

const paketTersedia = computed(() =>
  (daftarPaket.value ?? []).filter((p) => p.id !== props.layanan.paket_internet_id && p.status_aktif !== false),
)

const { mutateAsync: buatPermohonan } = useBuatPermohonan()

const tipePaket = ref<'reguler' | 'custom'>('reguler')
const namaPaketCustom = ref('')
const kecepatanCustom = ref<number | null>(null)

async function kirim() {
  if (tipePaket.value === 'reguler' && !paketIdBaru.value) { error.value = 'Pilih paket baru'; return }
  if (tipePaket.value === 'custom' && (!namaPaketCustom.value || !kecepatanCustom.value)) { error.value = 'Lengkapi detail paket custom'; return }
  
  isSubmitting.value = true; error.value = ''
  try {
    await buatPermohonan({
      jenis_permohonan: 'ganti_paket',
      layanan_internet_id: props.layanan.id,
      tipe_paket: tipePaket.value,
      paket_internet_id: tipePaket.value === 'reguler' ? paketIdBaru.value : undefined,
      nama_paket_custom: tipePaket.value === 'custom' ? namaPaketCustom.value : undefined,
      kecepatan_custom_mbps: tipePaket.value === 'custom' ? kecepatanCustom.value : undefined,
      alasan: alasan.value || undefined,
    } as any)
    emit('close')
  } catch {
    error.value = 'Gagal mengirim permohonan. Coba lagi.'
  } finally { isSubmitting.value = false }
}
</script>

<template>
  <Dialog open @update:open="emit('close')">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Ganti Paket</DialogTitle>
        <DialogDescription>
          Layanan: <strong>{{ layanan.paket_internet?.nama_paket ?? layanan.nama_paket_custom }}</strong>
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <div class="space-y-2">
          <Label>Tipe Paket</Label>
          <Select v-model="tipePaket">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="reguler">Paket Reguler</SelectItem>
              <SelectItem value="custom">Paket Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div v-if="tipePaket === 'reguler'" class="space-y-2">
          <Label for="paket_baru">Pilih Paket Baru</Label>
          <Select v-model="paketIdBaru">
            <SelectTrigger><SelectValue placeholder="Pilih paket..." /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="p in paketTersedia" :key="p.id" :value="p.id">
                {{ p.nama_paket }} — Rp {{ Number(p.harga).toLocaleString('id-ID') }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div v-if="tipePaket === 'custom'" class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="nama_custom">Nama Paket Custom</Label>
            <Input id="nama_custom" v-model="namaPaketCustom" placeholder="Contoh: Paket 150Mbps" />
          </div>
          <div class="space-y-2">
            <Label for="kecepatan_custom">Kecepatan (Mbps)</Label>
            <Input id="kecepatan_custom" type="number" v-model="kecepatanCustom" placeholder="Contoh: 150" />
          </div>
        </div>

        <div class="space-y-2">
          <Label for="alasan">Alasan <span class="text-muted-foreground">(opsional)</span></Label>
          <Textarea id="alasan" v-model="alasan" placeholder="Contoh: butuh kecepatan lebih tinggi..." class="min-h-[80px]" />
        </div>

        <p v-if="error" class="text-xs text-destructive">{{ error }}</p>

        <div class="flex justify-end gap-3">
          <Button variant="outline" @click="emit('close')">Batal</Button>
          <Button :disabled="isSubmitting" @click="kirim">{{ isSubmitting ? 'Mengirim...' : 'Ajukan Ganti Paket' }}</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
