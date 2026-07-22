<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-vue-next'
import { CheckboxRoot, CheckboxIndicator, useForwardPropsEmits, type CheckboxRootProps, type CheckboxRootEmits } from 'reka-ui'

const props = defineProps<CheckboxRootProps & { class?: string }>()
const emits = defineEmits<CheckboxRootEmits>()

const delegatedProps = computed(() => {
  const delegated: Record<string, unknown> = { ...props }
  delete delegated.class
  return delegated
})
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>
<template>
  <CheckboxRoot
    v-bind="forwarded"
    :class="
      cn(
        'flex size-4 shrink-0 items-center justify-center rounded-sm border border-input shadow-xs data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
  >
    <CheckboxIndicator class="flex items-center justify-center">
      <Check class="size-3.5" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>