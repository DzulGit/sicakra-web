<script setup lang="ts">
import { cn } from '@/lib/utils'
import { AvatarFallback, type AvatarFallbackProps } from 'reka-ui'
const props = defineProps<AvatarFallbackProps & { class?: string }>()
</script>
<template>
  <AvatarFallback
    v-bind="props"
    :class="cn('flex size-full items-center justify-center rounded-full bg-muted text-sm font-medium', props.class)"
  >
    <slot />
  </AvatarFallback>
</template>
