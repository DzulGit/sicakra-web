<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import type { AxiosError } from 'axios'
import { toast } from 'vue-sonner'
import { usePelangganDetail } from '../composables/usePelanggan'
import { useGenerateTagihanManual } from '@/modules/tagihan/composables/useKeuanganTagihan'
import { useAuthStore } from '@/stores/auth.store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FilePlus2 } from 'lucide-vue-next'
import type { ApiErrorResponse } from '@/types/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const pelangganId = Number(route.params.id)
const { data: pelanggan, isLoading } = usePelangganDetail(pelangganId)
const { mutate, isPending } = useGenerateTagihanManual()

// Hanya Admin Keuangan / Super Admin yang boleh generate tagihan manual
const bolehGenerateTagihan = authStore.peranAdmin === 'keuangan' || authStore.peranAdmin === 'super_admin'

function generateTagihan() {
  mutate(pelangganId, {
    onSuccess: (tagihan) => {
      toast.success(`Tagihan ${tagihan.map((t) => t.nomor_tagihan).join(', ')} berhasil dibuat.`)
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message ?? 'Gagal membuat tagihan.')
    },
  })
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
      <Button v-if="bolehGenerateTagihan" @click="generateTagihan" :disabled="isPending">
        <FilePlus2 class="size-4 mr-2" />
        {{ isPending ? 'Membuat...' : 'Generate Tagihan Manual' }}
      </Button>
    </div>

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
