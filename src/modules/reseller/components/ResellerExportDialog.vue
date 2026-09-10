<script setup lang="ts">
import { ref, computed } from 'vue'
import { FileDown, Loader2, Store } from 'lucide-vue-next'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useResellerList } from '../composables/useReseller'
import { getLaporanResellerPdf, getLaporanResellerExcel, type LaporanResellerParams } from '../api/reseller.api'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { data: hasil } = useResellerList()

const NAMA_BULAN: Record<number, string> = {
  1: 'Januari', 2: 'Februari', 3: 'Maret', 4: 'April',
  5: 'Mei', 6: 'Juni', 7: 'Juli', 8: 'Agustus',
  9: 'September', 10: 'Oktober', 11: 'November', 12: 'Desember',
}

const tahun = ref(String(new Date().getFullYear()))
const bulan = ref<string | null>(null)
const resellerId = ref<string>('semua')
const format = ref<'pdf' | 'xlsx'>('pdf')
const sedangUnduh = ref(false)

const daftarTahun = computed(() =>
  Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 5 + i),
)

function buildParams(): LaporanResellerParams {
  return {
    reseller_id: resellerId.value === 'semua' ? null : Number(resellerId.value),
    tahun: Number(tahun.value),
    bulan: bulan.value && bulan.value !== '-1' ? Number(bulan.value) : null,
  }
}

async function unduhLaporan() {
  if (sedangUnduh.value) return
  sedangUnduh.value = true
  try {
    const params = buildParams()
    const fetcher = format.value === 'pdf'
      ? () => getLaporanResellerPdf(params)
      : () => getLaporanResellerExcel(params)

    const res = await fetcher()
    const blob = res.data instanceof Blob ? res.data : new Blob([res.data])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const scope = resellerId.value === 'semua' ? 'semua-reseller' : `reseller-${resellerId.value}`
    a.href = url
    a.download = `laporan-reseller-${scope}-${bulan.value ?? 'all'}-${tahun.value}.${format.value === 'pdf' ? 'pdf' : 'xlsx'}`
    a.click()
    URL.revokeObjectURL(url)

    emit('update:open', false)
  } catch {
    // error sudah ditangani httpClient interceptor
  } finally {
    sedangUnduh.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <FileDown class="size-5" />
          Export Laporan Reseller
        </DialogTitle>
        <DialogDescription>
          Pilih cakupan reseller, periode, dan format sebelum mengunduh.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-2">
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-muted-foreground">Cakupan</label>
          <Select v-model="resellerId">
            <SelectTrigger>
              <Store class="mr-2 size-4" />
              <SelectValue placeholder="Pilih reseller" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Reseller</SelectItem>
              <SelectItem
                v-for="r in hasil?.data ?? []"
                :key="r.id"
                :value="String(r.id)"
              >
                {{ r.nama_lengkap }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Tahun</label>
            <Select v-model="tahun">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="y in daftarTahun" :key="y" :value="String(y)">
                  {{ y }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Bulan</label>
            <Select v-model="bulan">
              <SelectTrigger>
                <SelectValue placeholder="Semua Bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="String(-1)">Semua Bulan</SelectItem>
                <SelectItem v-for="m in 12" :key="m" :value="String(m)">
                  {{ NAMA_BULAN[m] }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-medium text-muted-foreground">Format</label>
          <div class="flex gap-3">
            <label class="flex items-center gap-2 text-sm">
              <input v-model="format" type="radio" value="pdf" class="accent-primary" />
              PDF
            </label>
            <label class="flex items-center gap-2 text-sm">
              <input v-model="format" type="radio" value="xlsx" class="accent-primary" />
              Excel
            </label>
          </div>
        </div>
      </div>

      <DialogFooter class="gap-2 sm:gap-0">
        <Button variant="outline" :disabled="sedangUnduh" @click="emit('update:open', false)">
          Batal
        </Button>
        <Button :disabled="sedangUnduh" @click="unduhLaporan">
          <Loader2 v-if="sedangUnduh" class="mr-2 size-4 animate-spin" />
          <FileDown v-else class="mr-2 size-4" />
          Unduh
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>