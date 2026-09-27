<script setup lang="ts">
import { cn } from '@/lib/utils'
import type { Component } from 'vue'

/**
 * Baris field kompak & konsisten untuk kartu detail:
 * - icon kecil muted (kiri, sejajar label), label muted di atas value.
 * - Tinggi baris stabil agar kartu dengan height tetap tidak bergeser
 *   antar pelanggan.
 * - Menerima `class` untuk keperluan grid (mis. `col-span-2`).
 */
const props = defineProps<{
  icon: Component
  label: string
  class?: string
}>()
</script>

<template>
  <div :class="cn('flex min-w-0 items-start gap-2.5', props.class)">
    <component :is="icon" aria-hidden="true" class="mt-px size-4 shrink-0 text-muted-foreground" />
    <div class="min-w-0 flex-1">
      <p class="text-[11px] leading-[13px] text-muted-foreground">{{ label }}</p>
      <div class="mt-px min-w-0 text-[13px] leading-[18px]">
        <slot />
      </div>
    </div>
  </div>
</template>