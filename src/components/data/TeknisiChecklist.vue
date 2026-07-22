<script setup lang="ts">
import { computed } from 'vue'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { AdminRingkas } from '@/types/models'

/**
 * Checklist multi-pilih teknisi — dipakai di 2 tempat: JadwalkanKerjaDialog
 * (pilih siapa yang ditugaskan ke 1 pekerjaan) dan form Tim Teknisi (pilih
 * anggota tim). Sengaja checkbox biasa, bukan Select multi — checklist lebih
 * jelas menunjukkan "siapa aja yang kepilih" dibanding dropdown tertutup.
 */
const props = defineProps<{
  daftarTeknisi: AdminRingkas[]
  modelValue: number[]
}>()
const emit = defineEmits<{ (e: 'update:modelValue', value: number[]): void }>()

function toggle(id: number, dicentang: boolean) {
  const next = dicentang ? [...props.modelValue, id] : props.modelValue.filter((v) => v !== id)
  emit('update:modelValue', next)
}

const adaTeknisi = computed(() => props.daftarTeknisi.length > 0)
</script>

<template>
  <div class="space-y-2 rounded-md border p-3">
    <p v-if="!adaTeknisi" class="text-sm text-muted-foreground">Belum ada teknisi terdaftar.</p>
    <div v-for="t in daftarTeknisi" :key="t.id" class="flex items-center gap-2">
      <Checkbox
        :id="`teknisi-${t.id}`"
        :model-value="modelValue.includes(t.id)"
        @update:model-value="(v) => toggle(t.id, !!v)"
      />
      <Label :for="`teknisi-${t.id}`" class="cursor-pointer font-normal">{{ t.nama_lengkap }}</Label>
    </div>
  </div>
</template>