<script setup lang="ts">
import { cn } from '@/lib/utils'
import { DropdownMenuLabel, type DropdownMenuLabelProps } from 'reka-ui'
const props = defineProps<DropdownMenuLabelProps & { class?: string }>()
</script>
<template>
  <DropdownMenuLabel v-bind="props" :class="cn('px-2 py-1.5 text-sm font-medium', props.class)">
    <slot />
  </DropdownMenuLabel>
</template>
