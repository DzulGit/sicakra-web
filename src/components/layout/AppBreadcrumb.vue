<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

export interface BreadcrumbItem {
  label: string
  to?: string // kosongkan untuk item terakhir (halaman saat ini, tidak bisa diklik)
}

defineProps<{ items: BreadcrumbItem[] }>()
</script>

<template>
  <nav class="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
    <template v-for="(item, i) in items" :key="i">
      <ChevronRight v-if="i > 0" class="size-3.5 shrink-0" />
      <RouterLink v-if="item.to" :to="item.to" class="hover:text-foreground">
        {{ item.label }}
      </RouterLink>
      <span v-else class="font-medium text-foreground">{{ item.label }}</span>
    </template>
  </nav>
</template>
