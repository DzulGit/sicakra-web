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

async function kirim() {
  if (!paketIdBaru.value) { error.value = 'Pilih paket baru'; return }
  isSubmitting.value = true; error.value = ''
  try {
    await buatPermohonan({
      jenis_permohonan: 'ganti_paket',
      layanan_internet_id: props.layanan.id,
      paket_internet_id: paketIdBaru.value,
      alasan: alasan.value || undefined,
    })
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

        <div class="space-y-2">
          <Label for="alasan">Alasan <span class="text-muted-foreground">(opsional)</span></Label>
          <Textarea id="alasan" v-model="alasan" placeholder="Contoh: butuh kecepatan lebih tinggi..." class="min-h-[80px]" />
        </div>

        <p v-if="error" class="text-xs text-destructive">{{ error }}</p>

        <div class="flex justify-end gap-3">
          <Button variant="outline" @click="emit('close')">Batal</Button>
          <Button :disabled="!paketIdBaru || isSubmitting" @click="kirim">{{ isSubmitting ? 'Mengirim...' : 'Ajukan Ganti Paket' }}</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
