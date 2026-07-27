<script setup lang="ts">
import type { Component } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    icon: Component
    label: string
    value: number | string
    subtitle?: string
    trend?: { value: number; positif: boolean } | null
    loading?: boolean
    class?: string
  }>(),
  { loading: false, trend: null },
)
</script>

<template>
  <Card :class="cn('', props.class)">
    <CardContent class="p-5">
      <div class="flex items-start justify-between">
        <div class="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <component :is="icon" class="size-5 text-primary" />
        </div>
        <div v-if="trend" class="flex items-center gap-0.5 text-xs font-medium" :class="trend.positif ? 'text-success' : 'text-destructive'">
          <svg v-if="trend.positif" class="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
          <svg v-else class="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          {{ trend.value }}%
        </div>
      </div>
      <div class="mt-3">
        <Skeleton v-if="loading" class="h-7 w-20" />
        <p v-else class="text-2xl font-semibold tracking-tight">{{ value }}</p>
        <p class="mt-0.5 text-xs text-muted-foreground">{{ label }}</p>
        <p v-if="subtitle" class="mt-0.5 text-xs text-muted-foreground/70">{{ subtitle }}</p>
      </div>
    </CardContent>
  </Card>
</template>
