<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  hargaSnapshot: number
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [jumlahBulan: number]
}>()

const jumlahBulan = ref(1)
const opsiBulan = [1, 2, 3]

const total = computed(() => props.hargaSnapshot * jumlahBulan.value)

function formatRupiah(nilai: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(nilai)
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => !v && emit('close')">
    <DialogContent class="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>Pilih Jumlah Bulan</DialogTitle>
        <DialogDescription>
          Bayar lebih banyak bulan sekaligus — bebas repot bulan depan.
        </DialogDescription>
      </DialogHeader>

      <div class="flex justify-center gap-2 py-4">
        <Button
          v-for="b in opsiBulan"
          :key="b"
          :variant="jumlahBulan === b ? 'default' : 'outline'"
          size="lg"
          class="min-w-16 text-lg"
          @click="jumlahBulan = b"
        >
          {{ b }} <span class="ml-0.5 text-sm font-normal">bln</span>
        </Button>
      </div>

      <div class="text-center text-sm text-muted-foreground">
        Total yang harus dibayar
      </div>
      <div class="text-center text-2xl font-semibold">
        {{ formatRupiah(total) }}
      </div>

      <DialogFooter class="gap-2 sm:gap-0">
        <Button variant="outline" @click="emit('close')">Batal</Button>
        <Button @click="emit('confirm', jumlahBulan)">Lanjutkan</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
