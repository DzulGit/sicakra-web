<script setup lang="ts">
import { cn } from '@/lib/utils'
import { TabsList, type TabsListProps } from 'reka-ui'
const props = defineProps<TabsListProps & { class?: string }>()
</script>
<template>
  <TabsList
    v-bind="props"
    :class="cn('inline-flex h-9 w-full items-center justify-center rounded-lg bg-muted p-1', props.class)"
  >
    <slot />
  </TabsList>
</template>
