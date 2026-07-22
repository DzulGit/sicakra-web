<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'
import type { Component } from 'vue'

withDefaults(
  defineProps<{ judul?: string; deskripsi?: string; icon?: Component }>(),
  { judul: 'Belum ada data', icon: () => Inbox },
)
</script>
<template>
  <div class="flex flex-col items-center justify-center gap-2 py-16 text-center">
    <component :is="icon" class="size-10 text-muted-foreground/40" />
    <p class="text-sm font-medium">{{ judul }}</p>
    <p v-if="deskripsi" class="max-w-xs text-sm text-muted-foreground">{{ deskripsi }}</p>
    <div v-if="$slots.aksi" class="mt-2"><slot name="aksi" /></div>
  </div>
</template>