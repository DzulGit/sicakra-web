<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { AxiosError } from 'axios'
import { toast } from 'vue-sonner'
import { Loader2, CalendarClock } from 'lucide-vue-next'
import { useGenerateTagihanManual } from '@/modules/tagihan/composables/useKeuanganTagihan'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import type { ApiErrorResponse } from '@/types/api'
import type { Pelanggan } from '@/types/models'

const props = defineProps<{
  open: boolean
  pelanggan: Pelanggan | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'saved'): void
}>()

const { mutate: generate, isPending } = useGenerateTagihanManual()

const daftarBulan = ref<string[]>([])
const bulanTerpilih = ref('')
const jumlahHari = ref('7')
const error = ref('')

watch(
  () => props.open,
  (open) => {
    if (!open) return
    const mulai = new Date()
    mulai.setDate(1)
    const opsi: string[] = []
    for (let i = 0; i < 12; i++) {
      const t = new Date(mulai.getFullYear(), mulai.getMonth() + i, 1)
      opsi.push(`${t.getMonth() + 1}-${t.getFullYear()}`)
    }
    daftarBulan.value = opsi
    bulanTerpilih.value = opsi[0] ?? ''
    jumlahHari.value = '7'
    error.value = ''
  },
  { immediate: true },
)

const layananAktif = computed(() => props.pelanggan?.layanan_internet?.filter((l) => l.status === 'aktif') ?? [])

const bulanPeriode = computed(() => Number(bulanTerpilih.value.split('-')[0]) || 1)
const tahunPeriode = computed(() => Number(bulanTerpilih.value.split('-')[1]) || new Date().getFullYear())

const namaBulan = computed(() => {
  if (!bulanTerpilih.value) return '-'
  return new Date(tahunPeriode.value, bulanPeriode.value - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
})

const tanggalJatuhTempo = computed(() => {
  const tgl = new Date()
  tgl.setDate(tgl.getDate() + Number(jumlahHari.value || 0))
  return tgl.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
})

function tutup() {
  if (!isPending.value) emit('update:open', false)
}

function konfirmasi() {
  const hari = Number(jumlahHari.value)
  if (!Number.isInteger(hari) || hari < 1 || hari > 31) {
    error.value = 'Jumlah hari jatuh tempo harus 1–31.'
    return
  }
  if (layananAktif.value.length === 0) {
    error.value = 'Pelanggan tidak punya layanan aktif.'
    return
  }

  error.value = ''
  generate(
    {
      pelangganId: props.pelanggan!.id,
      payload: {
        periode_bulan: bulanPeriode.value,
        periode_tahun: tahunPeriode.value,
        jumlah_hari_jatuh_tempo: hari,
      },
    },
    {
      onSuccess: (tagihan) => {
        toast.success(`Tagihan ${tagihan.map((t) => t.nomor_tagihan).join(', ')} berhasil dibuat.`)
        emit('saved')
      },
      onError: (e: Error) => {
        const pesan = e instanceof AxiosError ? (e.response?.data as ApiErrorResponse | undefined)?.message : undefined
        toast.error(pesan ?? 'Gagal membuat tagihan.')
      },
    },
  )
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => !isPending && emit('update:open', v)">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <CalendarClock class="size-5" /> Generate Tagihan
        </DialogTitle>
        <DialogDescription>
          Pilih periode tagihan &amp; jatuh tempo, lalu tinjau sebelum dibuat.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="bulan-tagihan">Bulan Tagihan</Label>
            <Select v-model="bulanTerpilih">
              <SelectTrigger id="bulan-tagihan" class="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="opsi in daftarBulan" :key="opsi" :value="opsi">
                  {{ new Date(Number(opsi.split('-')[1]), Number(opsi.split('-')[0]) - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="jumlah-hari">Jatuh Tempo (hari)</Label>
            <Input id="jumlah-hari" v-model="jumlahHari" type="number" min="1" max="31" />
            <p class="text-xs text-muted-foreground">Hari terhitung sejak tagihan dibuat.</p>
          </div>
        </div>

        <div class="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
          <p class="font-medium">Ringkasan</p>
          <dl class="mt-2 space-y-1">
            <div class="flex justify-between gap-4">
              <dt class="text-muted-foreground">Pelanggan</dt>
              <dd class="text-right font-medium">{{ pelanggan?.nama_lengkap ?? '-' }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-muted-foreground">No. Pelanggan</dt>
              <dd class="font-mono text-right">{{ pelanggan?.nomor_pelanggan ?? '-' }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-muted-foreground">Periode</dt>
              <dd class="text-right">{{ namaBulan }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-muted-foreground">Jatuh Tempo</dt>
              <dd class="text-right">{{ tanggalJatuhTempo }}</dd>
            </div>
          </dl>

          <Separator class="my-3" />

          <p v-if="!layananAktif.length" class="text-destructive">Pelanggan tidak punya layanan aktif.</p>
          <ul v-else class="space-y-1">
            <li v-for="l in layananAktif" :key="l.id" class="flex justify-between gap-4">
              <span class="font-mono text-xs text-muted-foreground">{{ l.nomor_layanan }}</span>
              <span class="text-right">
                {{ l.paket_internet?.nama_paket ?? l.nama_paket_custom ?? 'Paket Custom' }}
                · {{ l.paket_internet?.kecepatan_mbps ?? l.kecepatan_custom_mbps }} Mbps
              </span>
            </li>
          </ul>
        </div>

        <p v-if="error" class="text-sm font-medium text-destructive">{{ error }}</p>
      </div>

      <DialogFooter>
        <Button variant="outline" :disabled="isPending" @click="tutup">Batal</Button>
        <Button :disabled="isPending || !layananAktif.length" @click="konfirmasi">
          <Loader2 v-if="isPending" class="mr-2 size-4 animate-spin" />
          {{ isPending ? 'Membuat...' : 'Konfirmasi & Buat Tagihan' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
