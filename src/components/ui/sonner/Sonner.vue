<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner"
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon, XIcon } from "@lucide/vue"
import { Toaster as Sonner } from "vue-sonner"
import { cn } from "@/lib/utils"

const props = defineProps<ToasterProps>()
</script>

<template>
  <Sonner
    v-bind="props"
    :class="cn('toaster group fixed top-6 left-1/2 -translate-x-1/2 z-[100] outline-none w-full max-w-md', props.class)"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
    }"
    :toast-options="{
      classes: {
        toast: 'group toast flex items-center gap-3 p-4 w-full group-[.toaster]:bg-background/80 group-[.toaster]:backdrop-blur-lg group-[.toaster]:text-foreground group-[.toaster]:border-border/50 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl transition-all duration-300',
        title: 'font-semibold text-sm',
        description: 'text-sm text-muted-foreground',
        actionButton: 'bg-primary text-primary-foreground font-medium rounded-lg px-4 py-2',
        cancelButton: 'bg-muted text-muted-foreground font-medium rounded-lg px-4 py-2',
        icon: 'shrink-0 mt-0.5',
      }
    }"
  >
    <template #success-icon>
      <CircleCheckIcon class="size-5 text-emerald-500" />
    </template>
    <template #info-icon>
      <InfoIcon class="size-5 text-blue-500" />
    </template>
    <template #warning-icon>
      <TriangleAlertIcon class="size-5 text-amber-500" />
    </template>
    <template #error-icon>
      <OctagonXIcon class="size-5 text-destructive" />
    </template>
    <template #loading-icon>
      <Loader2Icon class="size-5 animate-spin text-primary" />
    </template>
    <template #close-icon>
      <XIcon class="size-4" />
    </template>
  </Sonner>
</template>