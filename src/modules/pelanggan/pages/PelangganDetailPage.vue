<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { usePelangganDetail } from '../composables/usePelanggan'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { data: pelanggan, isLoading } = usePelangganDetail(Number(route.params.id))
</script>

<template>
  <div class="space-y-6">
    <Button variant="ghost" size="sm" @click="router.back()">
      <ArrowLeft class="size-4 mr-1" /> Kembali
    </Button>

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
