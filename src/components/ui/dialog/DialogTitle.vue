<script setup lang="ts">
import { cn } from '@/lib/utils'
import { DialogTitle, type DialogTitleProps } from 'reka-ui'
const props = defineProps<DialogTitleProps & { class?: string }>()
</script>
<template>
  <DialogTitle v-bind="props" :class="cn('text-lg font-semibold leading-none', props.class)">
    <slot />
  </DialogTitle>
</template>
