<script setup lang="ts">
import { cn } from '@/lib/utils'
import { AvatarRoot, type AvatarRootProps } from 'reka-ui'
const props = defineProps<AvatarRootProps & { class?: string }>()
</script>
<template>
  <AvatarRoot
    v-bind="props"
    :class="cn('relative flex size-9 shrink-0 overflow-hidden rounded-full', props.class)"
  >
    <slot />
  </AvatarRoot>
</template>
