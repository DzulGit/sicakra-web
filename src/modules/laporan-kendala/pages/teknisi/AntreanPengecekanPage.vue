<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { httpClient } from '@/app/providers/httpClient'

const antrean = ref<any[]>([])
const isLoading = ref(false)

const fetchAntrean = async () => {
  isLoading.value = true

  try {
    const res = await httpClient.get('/admin/teknisi/dashboard/antrean-pengecekan')

    console.log('STATUS:', res.status)
    console.log('URL:', res.config.url)
    console.log('RESPONSE ANTREAN:', res.data)

    antrean.value = res.data.data.data
  } catch (error) {
    console.error('Gagal mengambil antrean pengecekan:', error)
  } finally {
    isLoading.value = false
  }
}

const prosesKelayakan = async (
  id: number,
  status: 'layak' | 'tolak'
) => {
  const endpoint =
    status === 'layak'
      ? `admin/teknisi/dashboard/permohonan/${id}/layak-pasang`
      : `admin/teknisi/dashboard/permohonan/${id}/tolak`

  const payload =
    status === 'tolak'
      ? {
        catatan: 'Lokasi tidak terjangkau / port penuh',
      }
      : {}

  try {
    await httpClient.post(endpoint, payload)

    await fetchAntrean()
  } catch (error) {
    console.error('Gagal memproses hasil pengecekan:', error)
  }
}

onMounted(fetchAntrean)
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-xl font-semibold">
        Antrean Pengecekan Lokasi
      </h1>

      <p class="text-sm text-muted-foreground">
        Daftar permohonan baru yang membutuhkan survei teknis.
      </p>
    </div>

    <div class="rounded-md border bg-white">
      <table class="w-full text-sm text-left">
        <thead class="bg-muted/50 text-muted-foreground">
          <tr>
            <th class="p-4 font-medium">Pelanggan</th>
            <th class="p-4 font-medium">Alamat</th>
            <th class="p-4 font-medium">Paket</th>
            <th class="p-4 font-medium">Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="isLoading">
            <td colspan="4" class="p-4 text-center">
              Memuat data...
            </td>
          </tr>

          <tr v-else-if="!antrean.length">
            <td colspan="4" class="p-4 text-center">
              Tidak ada antrean pengecekan.
            </td>
          </tr>

          <tr v-else v-for="item in antrean" :key="item.id" class="border-t">
            <td class="p-4">
              {{ item.pelanggan?.nama_lengkap }}
            </td>

            <td class="p-4">
              {{ item.alamat_pemasangan }}
            </td>

            <td class="p-4">
              {{ item.paket_internet?.nama_paket ?? item.tipe_paket }}
            </td>

            <td class="p-4 flex gap-2">
              <Button size="sm" @click="prosesKelayakan(item.id, 'layak')">
                Layak Pasang
              </Button>

              <Button size="sm" variant="destructive" @click="prosesKelayakan(item.id, 'tolak')">
                Tolak
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>