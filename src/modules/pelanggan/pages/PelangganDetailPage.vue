<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AxiosError } from 'axios'
import { toast } from 'vue-sonner'
import { usePelangganDetail } from '../composables/usePelanggan'
import { useGenerateTagihanManual } from '@/modules/tagihan/composables/useKeuanganTagihan'
import { useAuthStore } from '@/stores/auth.store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { ArrowLeft, FilePlus2 } from 'lucide-vue-next'
import type { ApiErrorResponse } from '@/types/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const pelangganId = Number(route.params.id)
const { data: pelanggan, isLoading } = usePelangganDetail(pelangganId)
const { mutate, isPending } = useGenerateTagihanManual()

const showDialog = ref(false)
const jumlahBulan = ref('1')

// Hanya Admin Keuangan / Super Admin yang boleh generate tagihan manual
const bolehGenerateTagihan = authStore.peranAdmin === 'keuangan' || authStore.peranAdmin === 'super_admin'

const opsiBulan = Array.from({ length: 12 }, (_, i) => i + 1)

function bukaDialog() {
  jumlahBulan.value = '1'
  showDialog.value = true
}

function generateTagihan() {
  mutate(
    { pelangganId, jumlahBulan: Number(jumlahBulan.value) },
    {
      onSuccess: (tagihan) => {
        showDialog.value = false
        toast.success(`Tagihan ${tagihan.map((t) => t.nomor_tagihan).join(', ')} berhasil dibuat.`)
      },
      onError: (e: Error) => {
        const pesan = e instanceof AxiosError ? (e.response?.data as ApiErrorResponse | undefined)?.message : undefined
        toast.error(pesan ?? 'Gagal membuat tagihan.')
      },
    },
  )
}

function formatRupiah(nilai: string | number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(nilai))
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <Button variant="ghost" size="sm" @click="router.back()">
        <ArrowLeft class="size-4 mr-1" /> Kembali
      </Button>
      <Button v-if="bolehGenerateTagihan" @click="bukaDialog" :disabled="isPending">
        <FilePlus2 class="size-4 mr-2" />
        {{ isPending ? 'Membuat...' : 'Generate Tagihan Manual' }}
      </Button>
    </div>

    <Dialog :open="showDialog" @update:open="(v) => (showDialog = v)">
      <DialogContent class="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Generate Tagihan Manual</DialogTitle>
          <DialogDescription>
            Buat tagihan untuk bulan berjalan. Bisa sekaligus beberapa bulan (maksimal 12).
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-2">
          <p class="text-sm text-muted-foreground">Jumlah bulan</p>
          <Select v-model="jumlahBulan">
            <SelectTrigger>
              <SelectValue placeholder="Pilih jumlah bulan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="b in opsiBulan" :key="b" :value="String(b)">{{ b }} bulan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showDialog = false">Batal</Button>
          <Button :disabled="isPending" @click="generateTagihan">
            {{ isPending ? 'Membuat...' : 'Generate' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <div v-if="isLoading" class="text-muted-foreground">Memuat...</div>

    <template v-else-if="pelanggan">
      <h1 class="text-xl font-semibold">{{ pelanggan.nama_lengkap }}</h1>

      <div class="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Data Diri</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2 text-sm">
            <p><span class="font-medium">Nomor Pelanggan:</span> {{ pelanggan.nomor_pelanggan ?? '-' }}</p>
            <p><span class="font-medium">NIK:</span> {{ pelanggan.nik }}</p>
            <p><span class="font-medium">No. HP:</span> {{ pelanggan.nomor_hp }}</p>
            <p><span class="font-medium">Email:</span> {{ pelanggan.email ?? '-' }}</p>
            <p>
              <span class="font-medium">Password:</span>
              <Badge :variant="pelanggan.password_sudah_dibuat ? 'success' : 'secondary'" class="ml-1">
                {{ pelanggan.password_sudah_dibuat ? 'Sudah dibuat' : 'Belum' }}
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Layanan Internet</CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="!pelanggan.layanan_internet?.length" class="text-sm text-muted-foreground">
              Belum ada layanan.
            </div>
            <div v-else class="space-y-3">
              <div v-for="l in pelanggan.layanan_internet" :key="l.id" class="rounded-lg border p-3 text-sm">
                <p><span class="font-medium">Layanan:</span> {{ l.nomor_layanan }}</p>
                <p>
                  <span class="font-medium">Paket:</span>
                  {{ l.paket_internet?.nama_paket ?? l.nama_paket_custom ?? '-' }}
                </p>
                <p><span class="font-medium">Status:</span> {{ l.status }}</p>
                <p><span class="font-medium">Aktif sejak:</span> {{ l.tanggal_aktif }}</p>

                <div v-if="l.tagihan?.length" class="mt-3 space-y-1 border-t pt-2">
                  <p class="font-medium">Tagihan:</p>
                  <p
                    v-for="t in [...l.tagihan].sort((a, b) => (b.periode_tahun - a.periode_tahun) || (b.periode_bulan - a.periode_bulan))"
                    :key="t.id"
                    class="flex items-center justify-between gap-2"
                  >
                    <span>{{ t.nomor_tagihan }} ({{ t.periode_bulan }}/{{ t.periode_tahun }})</span>
                    <span class="flex items-center gap-2">
                      {{ formatRupiah(t.total_tagihan) }}
                      <Badge variant="secondary">{{ t.status_pembayaran }}</Badge>
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card v-if="pelanggan.permohonan_layanan?.length">
        <CardHeader>
          <CardTitle>Riwayat Permohonan</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div v-for="p in pelanggan.permohonan_layanan" :key="p.id" class="rounded-lg border p-3 text-sm">
              <p><span class="font-medium">Nomor:</span> {{ p.nomor_permohonan }}</p>
              <p><span class="font-medium">Jenis:</span> {{ p.jenis_permohonan }}</p>
              <p><span class="font-medium">Status:</span> {{ p.status }}</p>
              <p><span class="font-medium">Dibuat:</span> {{ p.created_at }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
