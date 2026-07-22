<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { DropdownMenuLabel, useForwardProps, type DropdownMenuLabelProps } from 'reka-ui'

const props = defineProps<DropdownMenuLabelProps & { class?: string }>()

const delegatedProps = computed(() => {
  const delegated = { ...props }
  delete delegated.class
  return delegated
})
const forwardedProps = useForwardProps(delegatedProps)
</script>
<template>
  <DropdownMenuLabel v-bind="forwardedProps" :class="cn('px-2 py-1.5 text-sm font-medium', props.class)">
    <slot />
  </DropdownMenuLabel>
</template>
