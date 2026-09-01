<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Search, Users, Calendar, FileDown, Loader2 } from 'lucide-vue-next'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { getPelangganList, getLaporanPendapatanPdf, getLaporanPendapatanExcel, type PelangganList, type PendapatanFilterParams } from '../api/pendapatan.api'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const NAMA_BULAN: Record<number, string> = {
  1: 'Januari', 2: 'Februari', 3: 'Maret', 4: 'April',
  5: 'Mei', 6: 'Juni', 7: 'Juli', 8: 'Agustus',
  9: 'September', 10: 'Oktober', 11: 'November', 12: 'Desember',
}
const bulanList = Array.from({ length: 12 }, (_, i) => i + 1)

// ─── Tahun ─────────────────────────────────────────────────
const tahun = ref(String(new Date().getFullYear()))

// ─── Format ────────────────────────────────────────────────
const format = ref<'pdf' | 'xlsx'>('pdf')

// ─── Bulan Multi-Select ────────────────────────────────────
const bulanOpen = ref(false)
const selectedBulan = ref<number[]>([])

function toggleBulan(b: number) {
  const idx = selectedBulan.value.indexOf(b)
  if (idx === -1) {
    selectedBulan.value.push(b)
  } else {
    selectedBulan.value.splice(idx, 1)
  }
}

function removeBulan(b: number) {
  selectedBulan.value = selectedBulan.value.filter((v) => v !== b)
}

const bulanButtonLabel = computed(() => {
  if (selectedBulan.value.length === 0) return 'Semua Bulan'
  if (selectedBulan.value.length === 1) return NAMA_BULAN[selectedBulan.value[0]]
  return `${selectedBulan.value.length} bulan dipilih`
})

// ─── Pelanggan Multi-Select ────────────────────────────────
const daftarPelanggan = ref<PelangganList[]>([])
const pelangganOpen = ref(false)
const pelangganSearch = ref('')
const selectedPelangganIds = ref<number[]>([])

const filteredPelanggan = computed(() => {
  const q = pelangganSearch.value.toLowerCase()
  return daftarPelanggan.value.filter(
    (p) => p.nama_lengkap.toLowerCase().includes(q) || p.nomor_pelanggan.toLowerCase().includes(q),
  )
})

function togglePelanggan(id: number) {
  const idx = selectedPelangganIds.value.indexOf(id)
  if (idx === -1) {
    selectedPelangganIds.value.push(id)
  } else {
    selectedPelangganIds.value.splice(idx, 1)
  }
}

function removePelanggan(id: number) {
  selectedPelangganIds.value = selectedPelangganIds.value.filter((i) => i !== id)
}

const selectedPelangganLabels = computed(() =>
  selectedPelangganIds.value
    .map((id) => daftarPelanggan.value.find((p) => p.id === id))
    .filter(Boolean)
    .map((p) => p!.nama_lengkap),
)

// ─── Load Pelanggan ────────────────────────────────────────
watch(() => props.open, (v) => {
  if (v && daftarPelanggan.value.length === 0) {
    getPelangganList()
      .then((res) => { daftarPelanggan.value = res.data.data })
      .catch(() => {})
  }
})

// ─── Build Params ──────────────────────────────────────────
function buildParams(): PendapatanFilterParams {
  const p: PendapatanFilterParams = { tahun: tahun.value }
  if (selectedBulan.value.length > 0) p.bulan = [...selectedBulan.value]
  if (selectedPelangganIds.value.length > 0) p.pelanggan_ids = [...selectedPelangganIds.value]
  return p
}

// ─── Download ──────────────────────────────────────────────
const sedangUnduh = ref(false)

async function downloadBlob(fetcher: () => Promise<{ data: Blob }>, filename: string) {
  const res = await fetcher()
  const blob = res.data instanceof Blob ? res.data : new Blob([res.data])
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function slugPeriode(): string {
  const b = selectedBulan.value.length > 0 ? selectedBulan.value.join('-') : 'all'
  return `${b}-${tahun.value}`
}

async function unduhLaporan() {
  if (sedangUnduh.value) return
  sedangUnduh.value = true
  try {
    const ext = format.value === 'pdf' ? 'pdf' : 'xlsx'
    const fetcher = format.value === 'pdf'
      ? () => getLaporanPendapatanPdf(buildParams())
      : () => getLaporanPendapatanExcel(buildParams())
    await downloadBlob(fetcher, `laporan-pendapatan-${slugPeriode()}.${ext}`)
    emit('update:open', false)
  } finally {
    sedangUnduh.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <FileDown class="size-5" />
          Export Laporan
        </DialogTitle>
        <DialogDescription>
          Pilih filter dan format sebelum mengunduh laporan.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-5 py-2">
        <!-- Tahun -->
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-muted-foreground">Tahun</label>
          <select
            v-model="tahun"
            class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option v-for="y in 5" :key="y" :value="String(new Date().getFullYear() - 4 + y)">
              {{ new Date().getFullYear() - 4 + y }}
            </option>
          </select>
        </div>

        <!-- Multi-Select Bulan -->
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-muted-foreground">Bulan</label>
          <Popover v-model:open="bulanOpen">
            <PopoverTrigger as-child>
              <Button variant="outline" class="w-full justify-start text-left font-normal">
                <Calendar class="mr-2 size-4 shrink-0" />
                <span :class="selectedBulan.length === 0 ? 'text-muted-foreground' : ''">
                  {{ bulanButtonLabel }}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-[220px] p-0" align="start">
              <div class="max-h-[260px] overflow-y-auto p-1">
                <div
                  v-for="b in bulanList"
                  :key="b"
                  class="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                  @click="toggleBulan(b)"
                >
                  <Checkbox :model-value="selectedBulan.includes(b)" @update:model-value="toggleBulan(b)" />
                  <span>{{ NAMA_BULAN[b] }}</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <div v-if="selectedBulan.length > 0" class="flex flex-wrap gap-1 pt-1">
            <Badge v-for="b in selectedBulan" :key="b" variant="secondary" class="gap-1">
              {{ NAMA_BULAN[b] }}
              <button class="ml-0.5 rounded-full hover:bg-muted" @click="removeBulan(b)">
                <svg class="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </Badge>
          </div>
        </div>

        <!-- Multi-Select Pelanggan -->
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-muted-foreground">Pelanggan</label>
          <Popover v-model:open="pelangganOpen">
            <PopoverTrigger as-child>
              <Button variant="outline" class="w-full justify-start text-left font-normal">
                <Users class="mr-2 size-4 shrink-0" />
                <span v-if="selectedPelangganIds.length === 0" class="text-muted-foreground">
                  Semua Pelanggan
                </span>
                <span v-else class="truncate">
                  {{ selectedPelangganLabels.length }} dipilih
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-[280px] p-0" align="start">
              <div class="flex items-center border-b px-3 py-2">
                <Search class="mr-2 size-4 shrink-0 opacity-50" />
                <Input
                  v-model="pelangganSearch"
                  placeholder="Cari nama / nomor..."
                  class="h-8 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <div class="max-h-[220px] overflow-y-auto p-1">
                <div
                  v-for="p in filteredPelanggan"
                  :key="p.id"
                  class="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                  @click="togglePelanggan(p.id)"
                >
                  <Checkbox
                    :model-value="selectedPelangganIds.includes(p.id)"
                    @update:model-value="togglePelanggan(p.id)"
                  />
                  <div class="flex-1 truncate">
                    <span class="font-medium">{{ p.nama_lengkap }}</span>
                    <span class="ml-1 text-xs text-muted-foreground">{{ p.nomor_pelanggan }}</span>
                  </div>
                </div>
                <div v-if="filteredPelanggan.length === 0" class="py-4 text-center text-sm text-muted-foreground">
                  Tidak ditemukan.
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <div v-if="selectedPelangganIds.length > 0" class="flex flex-wrap gap-1 pt-1">
            <Badge
              v-for="(label, i) in selectedPelangganLabels"
              :key="selectedPelangganIds[i]"
              variant="secondary"
              class="gap-1"
            >
              {{ label }}
              <button class="ml-0.5 rounded-full hover:bg-muted" @click="removePelanggan(selectedPelangganIds[i])">
                <svg class="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </Badge>
          </div>
        </div>

        <!-- Format -->
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
