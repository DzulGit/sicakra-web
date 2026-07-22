<script setup lang="ts">
import { cn } from '@/lib/utils'
import { TabsContent, type TabsContentProps } from 'reka-ui'
const props = defineProps<TabsContentProps & { class?: string }>()
</script>
<template>
  <TabsContent v-bind="props" :class="cn('mt-4', props.class)">
    <slot />
  </TabsContent>
</template>
