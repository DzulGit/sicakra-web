<script setup lang="ts">
import { SelectRoot, type SelectRootEmits, type SelectRootProps, useForwardPropsEmits } from 'reka-ui'

const props = defineProps<SelectRootProps>()
const emits = defineEmits<SelectRootEmits>()

// Wajib pakai ini buat nge-sync state dari Vue ke Reka UI
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <SelectRoot v-bind="forwarded">
    <slot />
  </SelectRoot>
</template>