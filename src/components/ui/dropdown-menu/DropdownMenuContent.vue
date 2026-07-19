<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { DropdownMenuContent, DropdownMenuPortal, useForwardProps, type DropdownMenuContentProps } from 'reka-ui'

const props = withDefaults(defineProps<DropdownMenuContentProps & { class?: string }>(), {
  sideOffset: 4,
})

const delegatedProps = computed(() => {
  const delegated = { ...props }
  delete delegated.class
  return delegated
})
const forwardedProps = useForwardProps(delegatedProps)
</script>
<template>
  <DropdownMenuPortal>
    <DropdownMenuContent
      v-bind="forwardedProps"
      :class="
        cn(
          'z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          props.class,
        )
      "
    >
      <slot />
    </DropdownMenuContent>
  </DropdownMenuPortal>
</template>
