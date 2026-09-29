<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { cn } from '@/lib/utils'
import { httpClient } from '@/app/providers/httpClient'

/**
 * Preview foto KTP yang AMAN:
 * - Mengambil gambar dari endpoint ber-authorize lewat httpClient (Bearer token),
 *   menyimpannya sebagai object URL sementara (bukan URL public permanen).
 * - Object URL di-revoke saat komponen di-unmount.
 * - Tidak pernah memakai <img src="/storage/..."> atau Storage::url().
 * - `imageClass` & `hideCaption` hanya menyesuaikan presentasi (mis. thumb
 *   compact pada layout dashboard height-tetap), default tetap seperti semula.
 */
const props = defineProps<{
  /** Id pelanggan pemilik KTP. Path selalu berasal dari record ini. */
  pelangganId: number
  /** Kategori user yang sedang login — menentukan endpoint API ber-authorize. */
  kategori: 'admin' | 'reseller'
  /** Class tambahan untuk <img> (digabung dengan default). */
  imageClass?: string
  /** Sembunyikan caption "Foto KTP" di bawah thumb (layout compact). */
  hideCaption?: boolean
  /**
   * Mode popup/dialog: klik thumb meng-emit `buka` (url) agar parent membuka
   * preview diperbesar di dalam aplikasi. Bila false (default) tetap membuka
   * gambar di tab baru seperti sebelumnya.
   */
  popup?: boolean
}>()

const emit = defineEmits<{ buka: [url: string] }>()

const objectUrl = ref<string | null>(null)
const gagal = ref(false)
const memuat = ref(false)

let dibatalkan = false

function urlApi(): string {
  return props.kategori === 'reseller'
    ? `/reseller/pelanggan/${props.pelangganId}/foto-ktp`
    : `/admin/operasional/pelanggan/${props.pelangganId}/foto-ktp`
}

async function muat(): Promise<void> {
  if (!props.pelangganId) return
  memuat.value = true
  gagal.value = false
  try {
    const res = await httpClient.get<Blob>(urlApi(), { responseType: 'blob' })
    if (dibatalkan) return
    if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = URL.createObjectURL(res.data)
  } catch {
    if (!dibatalkan) gagal.value = true
  } finally {
    memuat.value = false
  }
}

watch(() => props.pelangganId, muat, { immediate: true })

onBeforeUnmount(() => {
  dibatalkan = true
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
})

function bukaGambar(): void {
  if (!objectUrl.value) return
  if (props.popup) {
    emit('buka', objectUrl.value)
  } else {
    window.open(objectUrl.value, '_blank', 'noopener,noreferrer')
  }
}
</script>

<template>
  <div v-if="objectUrl" class="flex flex-wrap gap-3">
    <button type="button" class="group text-left" @click="bukaGambar">
      <img
        :src="objectUrl"
        alt="Foto KTP"
        :class="cn('h-36 w-60 rounded-md border object-cover transition-opacity group-hover:opacity-80', props.imageClass)"
      />
      <p v-if="!props.hideCaption" class="mt-1 text-xs text-muted-foreground underline-offset-2 group-hover:underline">
        Foto KTP
      </p>
    </button>
  </div>
  <p v-else-if="memuat" class="text-xs text-muted-foreground">Memuat foto KTP…</p>
  <p v-else-if="gagal" class="text-xs text-muted-foreground">Foto KTP tidak tersedia.</p>
</template>