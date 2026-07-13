<script setup lang="ts">
import { cn } from '@/lib/utils'
import { TabsTrigger, type TabsTriggerProps } from 'reka-ui'
const props = defineProps<TabsTriggerProps & { class?: string }>()
</script>
<template>
  <TabsTrigger
    v-bind="props"
    :class="
      cn(
        'inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-colors data-[state=active]:bg-background data-[state=active]:shadow-sm',
        props.class,
      )
    "
  >
    <slot />
  </TabsTrigger>
</template>
