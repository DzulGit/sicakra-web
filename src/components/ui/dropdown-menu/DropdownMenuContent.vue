<script setup lang="ts">
import { computed } from 'vue'
import { DropdownMenuContent, DropdownMenuPortal, type DropdownMenuContentProps, useForwardProps } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<DropdownMenuContentProps & { class?: string }>(), {
  sideOffset: 4,
})

const delegatedProps = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { class: _, ...delegated } = props
  return delegated
})

const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <DropdownMenuPortal>
    <DropdownMenuContent
      v-bind="forwarded"
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