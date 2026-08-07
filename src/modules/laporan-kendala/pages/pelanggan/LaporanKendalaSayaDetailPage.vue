<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useLaporanKendalaSayaDetail } from '../../composables/usePelangganLaporanKendala'
import { statusLaporanEnum } from '@/lib/enums'
import StatusBadge from '@/components/data/StatusBadge.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: laporan, isLoading } = useLaporanKendalaSayaDetail(id)

const isImageOpen = ref(false)
const selectedImage = ref('')

const parsedPhotos = computed(() => {
  if (!laporan.value?.foto) return []
  if (Array.isArray(laporan.value.foto)) return laporan.value.foto
  try {
    return JSON.parse(laporan.value.foto)
  } catch (e) {
    return [laporan.value.foto]
  }
})

const getImageUrl = (path: string) => {
  return path.startsWith('http') 
    ? path 
    : `https://hrwyxwwtbpmtrxhdlvud.supabase.co/storage/v1/object/public/wifi-storage/${path}`
}

const openImage = (url: string) => {
  selectedImage.value = url
  isImageOpen.value = true
}
</script>

<template>
  <div v-if="isLoading"><Skeleton class="h-64 w-full max-w-lg" /></div>

  <Card v-else-if="laporan" class="max-w-lg">
    <CardHeader class="flex-row items-center justify-between">
      <CardTitle>{{ laporan.nomor_laporan }}</CardTitle>
      <StatusBadge :value="laporan.status" :map="statusLaporanEnum" />
    </CardHeader>
    <CardContent class="space-y-3 text-sm">
      <div>
        <p class="text-muted-foreground">Kategori</p>
        <p>{{ laporan.kategori_kendala }}</p>
      </div>
      <div>
        <p class="text-muted-foreground">Deskripsi</p>
        <p>{{ laporan.deskripsi }}</p>
      </div>
      <div v-if="laporan.hasil_penanganan">
        <p class="text-muted-foreground">Hasil Penanganan</p>
        <p>{{ laporan.hasil_penanganan }}</p>
      </div>
      <div v-if="parsedPhotos.length > 0">
        <p class="text-muted-foreground mb-2">Foto Kendala</p>
        <div class="flex flex-wrap gap-3">
          <img 
            v-for="(foto, index) in parsedPhotos"
            :key="index"
            @click="openImage(getImageUrl(foto))"
            :src="getImageUrl(foto)" 
            alt="Foto Laporan" 
            class="h-24 w-24 rounded-md border object-cover cursor-pointer hover:opacity-80 transition-opacity" 
          />
        </div>
      </div>
    </CardContent>
  </Card>

  <div 
    v-if="isImageOpen && selectedImage" 
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 cursor-zoom-out"
    @click="isImageOpen = false"
  >
    <img 
      :src="selectedImage" 
      alt="Foto Laporan Full" 
      class="max-h-[90vh] max-w-[90vw] rounded-md object-contain" 
    />
  </div>
</template>