<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { ButtonVariants } from '@/components/ui/button'

withDefaults(
  defineProps<{
    open: boolean
    judul: string
    deskripsi?: string
    labelKonfirmasi?: string
    labelBatal?: string
    variantKonfirmasi?: ButtonVariants['variant']
    loading?: boolean
  }>(),
  { labelKonfirmasi: 'Konfirmasi', labelBatal: 'Batal', variantKonfirmasi: 'default', loading: false },
)
const emit = defineEmits<{ (e: 'update:open', value: boolean): void; (e: 'confirm'): void }>()
</script>
<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ judul }}</DialogTitle>
        <DialogDescription v-if="deskripsi">{{ deskripsi }}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" :disabled="loading" @click="emit('update:open', false)">{{ labelBatal }}</Button>
        <Button :variant="variantKonfirmasi" :disabled="loading" @click="emit('confirm')">
          {{ loading ? 'Memproses...' : labelKonfirmasi }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>