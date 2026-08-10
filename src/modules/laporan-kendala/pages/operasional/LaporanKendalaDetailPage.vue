<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import {
  useLaporanKendalaDetail,
  useTutupLaporan,
} from '../../composables/useOperasionalLaporanKendala'
import { statusLaporanEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import ConfirmDialog from '@/components/feedback/ConfirmDialog.vue'
import WhatsappTindakLanjutFlow from '../../components/WhatsappTindakLanjutFlow.vue'

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: laporan, isLoading } = useLaporanKendalaDetail(id)

const dialogWaTerbuka = ref(false)
const dialogTutupTerbuka = ref(false)

const { mutate: tutup, isPending: isPendingTutup } = useTutupLaporan()

function handleTutup() {
  tutup(id.value, {
    onSuccess: () => {
      toast.success('Laporan ditutup secara manual.')
      dialogTutupTerbuka.value = false
    },
    onError: () => toast.error('Gagal menutup laporan.'),
  })
}

function namaAdmin(nilai: number | { nama_lengkap: string } | null): string | null {
  if (!nilai) return null
  return typeof nilai === 'object' ? nilai.nama_lengkap : `Admin #${nilai}`
}

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'long' })
}

const pelanggan = computed(() => laporan.value?.layanan_internet?.pelanggan)

// Tombol WA Tindak Lanjut hanya muncul saat baru masuk (menunggu)
const bisaTindakLanjutWa = computed(() => laporan.value?.status === 'menunggu')
// Tutup Manual untuk laporan yang udah dikerjakan teknisi
const bisaTutup = computed(() => laporan.value?.status === 'selesai')

const isImageOpen = ref(false)
const selectedImage = ref<string | null>(null)

function bukaGambar(foto: string) {
  selectedImage.value = foto.startsWith('http')
    ? foto
    : `https://hrwyxwwtbpmtrxhdlvud.supabase.co/storage/v1/object/public/wifi-storage/${foto}`
  isImageOpen.value = true
}

const parsedPhotos = computed(() => {
  if (!laporan.value?.foto) return []
  if (Array.isArray(laporan.value.foto)) return laporan.value.foto
  try {
    return JSON.parse(laporan.value.foto as string)
  } catch (e) {
    return [laporan.value.foto]
  }
})
</script>

<template>
  <div v-if="isLoading" class="space-y-4">
    <Skeleton class="h-8 w-64" />
    <Skeleton class="h-40 w-full" />
  </div>

  <div v-else-if="laporan" class="grid gap-4 lg:grid-cols-3">
    <div class="space-y-4 lg:col-span-2">
      <Card>
        <CardHeader class="flex-row items-center justify-between">
          <div>
            <CardTitle>{{ laporan.nomor_laporan }}</CardTitle>
            <p class="text-sm text-muted-foreground">
              {{ pelanggan?.nama_lengkap }} &middot; {{ pelanggan?.nomor_hp }} &middot;
              {{ laporan.layanan_internet?.nomor_layanan }}
            </p>
          </div>
          <StatusBadge :value="laporan.status" :map="statusLaporanEnum" />
        </CardHeader>
        <CardContent class="space-y-3 text-sm">
          <div class="grid grid-cols-3 gap-x-6 gap-y-1.5">
            <div>
              <p class="text-xs text-muted-foreground">Kategori Kendala</p>
              <p>{{ laporan.kategori_kendala }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Tanggal Laporan</p>
              <p>{{ formatTanggal(laporan.created_at) }}</p>
            </div>
            <div v-if="laporan.updated_at !== laporan.created_at">
              <p class="text-xs text-muted-foreground">Terakhir Diupdate</p>
              <p>{{ formatTanggal(laporan.updated_at) }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Kontak Pelanggan</p>
              <p>{{ pelanggan?.nomor_hp }} {{ pelanggan?.email ? '· ' + pelanggan.email : '' }}</p>
            </div>
            <div v-if="namaAdmin(laporan.ditugaskan_ke)">
              <p class="text-xs text-muted-foreground">Ditugaskan ke</p>
              <p>{{ namaAdmin(laporan.ditugaskan_ke) }}</p>
            </div>
            <div v-if="namaAdmin(laporan.ditutup_oleh)">
              <p class="text-xs text-muted-foreground">Ditutup oleh</p>
              <p>{{ namaAdmin(laporan.ditutup_oleh) }}</p>
            </div>
          </div>

          <div class="space-y-1.5">
            <div>
              <p class="text-xs text-muted-foreground">Deskripsi Kendala</p>
              <p>{{ laporan.deskripsi }}</p>
            </div>
            <div v-if="laporan.hasil_penanganan">
              <p class="text-xs text-muted-foreground">Hasil Penanganan (Teknisi)</p>
              <p>{{ laporan.hasil_penanganan }}</p>
            </div>
          </div>
          <div v-if="parsedPhotos.length > 0" class="space-y-1.5 mt-4">
            <p class="text-xs text-muted-foreground">Foto Kendala</p>
            <div class="flex flex-wrap gap-4 mt-2">
              <img v-for="(foto, index) in parsedPhotos" :key="index"
                :src="foto.startsWith('http') ? foto : `https://hrwyxwwtbpmtrxhdlvud.supabase.co/storage/v1/object/public/wifi-storage/${foto}`"
                alt="Foto Laporan"
                class="h-32 w-32 rounded-md border object-cover cursor-pointer hover:opacity-80 transition-opacity"
                @click="bukaGambar(foto)" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle class="text-base">Aksi</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2">
          <Button v-if="bisaTindakLanjutWa" class="w-full" @click="dialogWaTerbuka = true">
            Tindak Lanjut via WhatsApp
          </Button>
          <Button v-if="bisaTutup" class="w-full" variant="destructive" @click="dialogTutupTerbuka = true">
            Tutup Laporan
          </Button>
          <p v-if="!bisaTindakLanjutWa && !bisaTutup" class="text-sm text-muted-foreground">
            Laporan sedang ditangani teknisi. Tunggu statusnya Selesai.
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Dialog WA 2 Tahap -->
    <Dialog :open="dialogWaTerbuka" @update:open="dialogWaTerbuka = $event">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tindak Lanjut Laporan Kendala</DialogTitle>
          <DialogDescription>
            Hubungi pelanggan melalui WhatsApp untuk verifikasi awal.
          </DialogDescription>
        </DialogHeader>
        <WhatsappTindakLanjutFlow :laporan="laporan" @close="dialogWaTerbuka = false" />
      </DialogContent>
    </Dialog>

    <!-- Dialog Penutupan Akhir (setelah teknisi bekerja) -->
    <ConfirmDialog v-model:open="dialogTutupTerbuka" judul="Tutup laporan ini?"
      deskripsi="Pastikan pelanggan sudah mengonfirmasi bahwa layanannya telah kembali normal."
      label-konfirmasi="Tutup Laporan" variant-konfirmasi="destructive" :loading="isPendingTutup"
      @confirm="handleTutup" />

    <Teleport to="body">
      <div v-if="isImageOpen && selectedImage"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 cursor-zoom-out"
        @click="isImageOpen = false; selectedImage = null">
        <img :src="selectedImage" alt="Foto Laporan Full" class="max-h-[90vh] max-w-[90vw] rounded-md object-contain" />
      </div>
    </Teleport>
  </div>
</template>