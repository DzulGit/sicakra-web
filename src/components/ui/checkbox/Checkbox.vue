<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-vue-next'
import { CheckboxRoot, CheckboxIndicator } from 'reka-ui'

defineOptions({ inheritAttrs: false })

interface Props {
  checked?: boolean | 'indeterminate'
  modelValue?: boolean
  disabled?: boolean
  required?: boolean
  name?: string
  value?: string
  id?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), { checked: false })

const emit = defineEmits<{
  'update:checked': [value: boolean]
  'update:model-value': [value: boolean]
}>()

const modelValue = computed(() => props.modelValue ?? props.checked ?? false)

function handleUpdate(val: boolean | 'indeterminate') {
  if (val === 'indeterminate') return
  emit('update:checked', val)
  emit('update:model-value', val)
}
</script>
<template>
  <CheckboxRoot
    :model-value="modelValue"
    :disabled="disabled"
    :required="required"
    :name="name"
    :value="value"
    :id="id"
    v-bind="$attrs"
    :class="
      cn(
        'flex size-4 shrink-0 items-center justify-center rounded-sm border border-input shadow-xs data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
    @update:model-value="handleUpdate"
  >
    <CheckboxIndicator class="flex items-center justify-center">
      <Check class="size-3.5" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
