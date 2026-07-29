<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { getPaketInternetList } from '@/modules/paket-internet/api/paketInternet.api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import LocationPicker from '@/modules/pendaftaran/components/PemilihanLokasi.vue'
import { useBuatPermohonan } from '../composables/usePelangganLayanan'
import type { LayananInternetDetail } from '@/types/models'

const props = defineProps<{ layanan: LayananInternetDetail }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const { data: daftarPaket } = useQuery({
  queryKey: ['paket-internet', 'aktif'],
  queryFn: () => getPaketInternetList().then((r) => r.data.data),
})

const paketId = ref<number | null>(null)
const lokasiPeta = ref<{ lat: number; lng: number; address?: string } | null>(null)
const alamatPemasangan = ref('')
const detailAlamat = ref('')
const isSubmitting = ref(false)
const error = ref('')

watch(lokasiPeta, (l) => {
  if (l?.address) alamatPemasangan.value = l.address
})

const paketTersedia = computed(() =>
  (daftarPaket.value ?? []).filter((p) => p.status_aktif !== false),
)

const { mutateAsync: buatPermohonan } = useBuatPermohonan()

async function kirim() {
  if (!paketId.value) { error.value = 'Pilih paket'; return }
  if (!lokasiPeta.value) { error.value = 'Pilih lokasi pemasangan di peta'; return }
  isSubmitting.value = true; error.value = ''
  try {
    await buatPermohonan({
      jenis_permohonan: 'tambah_paket',
      layanan_internet_id: props.layanan.id,
      paket_internet_id: paketId.value,
      alamat_pemasangan: alamatPemasangan.value || lokasiPeta.value.address || `${lokasiPeta.value.lat}, ${lokasiPeta.value.lng}`,
      detail_alamat: detailAlamat.value || undefined,
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
        <DialogTitle>Tambah Paket Baru</DialogTitle>
        <DialogDescription>
          Tambah layanan internet baru ke akun Anda. Paket saat ini:
          <strong>{{ layanan.paket_internet?.nama_paket ?? layanan.nama_paket_custom }}</strong>
        </DialogDescription>
      </DialogHeader>

      <div class="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
        <div class="space-y-2">
          <Label for="paket">Pilih Paket Tambahan</Label>
          <Select v-model="paketId">
            <SelectTrigger><SelectValue placeholder="Pilih paket..." /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="p in paketTersedia" :key="p.id" :value="p.id">
                {{ p.nama_paket }} — Rp {{ Number(p.harga).toLocaleString('id-ID') }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label>Lokasi Pemasangan Baru</Label>
          <div class="h-[40vh] max-h-[220px] min-h-[160px] w-full overflow-hidden rounded-xl border">
            <LocationPicker v-model="lokasiPeta" class="h-full w-full" />
          </div>
        </div>

        <div class="space-y-2">
          <Label for="alamat_tambah">Alamat Pemasangan</Label>
          <Textarea
            id="alamat_tambah" v-model="alamatPemasangan"
            placeholder="Otomatis terisi dari peta..."
            class="min-h-[70px]"
          />
          <p class="text-xs text-muted-foreground">Alamat akan terisi otomatis saat kamu klik peta.</p>
        </div>

        <div class="space-y-2">
          <Label for="detail_tambah">Detail Tambahan <span class="text-muted-foreground">(opsional)</span></Label>
          <Textarea
            id="detail_tambah" v-model="detailAlamat"
            placeholder="Contoh: RT 03 RW 05, Lantai 2..."
            class="min-h-[70px]"
          />
        </div>

        <p v-if="error" class="text-xs text-destructive">{{ error }}</p>

        <div class="flex justify-end gap-3 pt-1">
          <Button variant="outline" @click="emit('close')">Batal</Button>
          <Button :disabled="!paketId || !lokasiPeta || isSubmitting" @click="kirim">
            {{ isSubmitting ? 'Mengirim...' : 'Ajukan Tambah Paket' }}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
