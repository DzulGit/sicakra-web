<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = defineProps<{
  title?: string
  description?: string
  class?: string
}>()
</script>

<template>
  <section :class="cn('', props.class)">
    <div v-if="title || description" class="mb-4">
      <h2 v-if="title" class="text-base font-semibold tracking-tight">{{ title }}</h2>
      <p v-if="description" class="mt-0.5 text-sm text-muted-foreground">{{ description }}</p>
    </div>
    <slot />
  </section>
</template>
