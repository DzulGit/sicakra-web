<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import LocationPicker from '@/modules/pendaftaran/components/PemilihanLokasi.vue'
import { useBuatPermohonan } from '../composables/usePelangganLayanan'
import type { LayananInternetDetail } from '@/types/models'

const props = defineProps<{ layanan: LayananInternetDetail }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const lokasiPeta = ref<{ lat: number; lng: number; address?: string; provinsi?: string; kota?: string } | null>(null)
const alamatPemasangan = ref('')
const detailAlamat = ref('')
const isSubmitting = ref(false)
const error = ref('')

watch(lokasiPeta, (l) => {
  if (l?.address) alamatPemasangan.value = l.address
})

const { mutateAsync: buatPermohonan } = useBuatPermohonan()

async function kirim() {
  if (!lokasiPeta.value) { error.value = 'Pilih lokasi baru di peta'; return }
  isSubmitting.value = true; error.value = ''
  try {
    await buatPermohonan({
      jenis_permohonan: 'relokasi',
      layanan_internet_id: props.layanan.id,
      alamat_pemasangan: alamatPemasangan.value || lokasiPeta.value.address || `${lokasiPeta.value.lat}, ${lokasiPeta.value.lng}`,
      detail_alamat: detailAlamat.value || undefined,
      provinsi: lokasiPeta.value.provinsi ?? undefined,
      kota: lokasiPeta.value.kota ?? undefined,
      latitude: lokasiPeta.value.lat,
      longitude: lokasiPeta.value.lng,
    } as any)
    emit('close')
  } catch {
    error.value = 'Gagal mengirim permohonan. Coba lagi.'
  } finally { isSubmitting.value = false }
}
</script>

<template>
  <Dialog open @update:open="emit('close')">
    <DialogContent class="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Relokasi Alamat</DialogTitle>
        <DialogDescription>
          Alamat saat ini: <strong>{{ layanan.alamat_pemasangan }}</strong>
        </DialogDescription>
      </DialogHeader>

      <div class="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
        <div class="h-[45vh] max-h-[260px] min-h-[180px] w-full overflow-hidden rounded-xl border">
          <LocationPicker v-model="lokasiPeta" class="h-full w-full" />
        </div>

        <div class="space-y-2">
          <Label for="alamat_relokasi">Alamat Baru</Label>
          <Textarea
            id="alamat_relokasi" v-model="alamatPemasangan"
            placeholder="Otomatis terisi dari peta..."
            class="min-h-[70px]"
          />
          <p class="text-xs text-muted-foreground">Alamat akan terisi otomatis saat kamu klik peta atau tekan Deteksi Lokasi.</p>
        </div>

        <div class="space-y-2">
          <Label for="detail_relokasi">Detail Tambahan <span class="text-muted-foreground">(opsional)</span></Label>
          <Textarea
            id="detail_relokasi" v-model="detailAlamat"
            placeholder="Contoh: RT 03 RW 05, Rumah cat hijau, samping masjid..."
            class="min-h-[70px]"
          />
        </div>

        <p v-if="error" class="text-xs text-destructive">{{ error }}</p>

        <div class="flex justify-end gap-3 pt-1">
          <Button variant="outline" @click="emit('close')">Batal</Button>
          <Button :disabled="!lokasiPeta || isSubmitting" @click="kirim">
            {{ isSubmitting ? 'Mengirim...' : 'Ajukan Relokasi' }}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
