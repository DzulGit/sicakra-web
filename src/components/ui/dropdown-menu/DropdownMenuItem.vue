<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { DropdownMenuItem, useForwardProps, type DropdownMenuItemProps } from 'reka-ui'

const props = defineProps<
  DropdownMenuItemProps & { class?: string; inset?: boolean; variant?: 'default' | 'destructive' }
>()

const delegatedProps = computed(() => {
  const delegated: Record<string, unknown> = { ...props }
  delete delegated.class
  delete delegated.inset
  delete delegated.variant
  return delegated
})
const forwardedProps = useForwardProps(delegatedProps)
</script>
<template>
  <DropdownMenuItem
    v-bind="forwardedProps"
    :class="
      cn(
        'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
        props.inset && 'pl-8',
        props.variant === 'destructive' && 'text-destructive focus:bg-destructive/10 focus:text-destructive',
        props.class,
      )
    "
  >
    <slot />
  </DropdownMenuItem>
</template>
