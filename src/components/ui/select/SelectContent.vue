<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import {
  SelectContent,
  type SelectContentProps,
  SelectPortal,
  SelectViewport,
  useForwardProps,
} from 'reka-ui'

const props = withDefaults(
  defineProps<SelectContentProps & { class?: string }>(),
  {
    position: 'popper',
  },
)

// Cara baru: copy props dan hapus 'class' biar ESLint nggak marah
const delegatedProps = computed(() => {
  const delegated = { ...props }
  delete delegated.class
  return delegated
})

const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <SelectPortal>
    <SelectContent
      v-bind="forwarded"
      :class="
        cn(
          'relative z-50 max-h-96 min-w-32 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          props.class,
        )
      "
    >
      <SelectViewport class="p-1">
        <slot />
      </SelectViewport>
    </SelectContent>
  </SelectPortal>
</template>