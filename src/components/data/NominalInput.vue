<script setup lang="ts">
const props = withDefaults(defineProps<{ modelValue: number | null }>(), { modelValue: null })

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

function formatRupiah(v: number | null) {
  if (v === null || !Number.isFinite(v) || v <= 0) return ''
  return 'Rp' + new Intl.NumberFormat('id-ID').format(v)
}

function onInput(e: Event) {
  const digits = (e.target as HTMLInputElement).value.replace(/\D+/g, '')
  const nilai = digits === '' ? null : Number(digits)
  ;(e.target as HTMLInputElement).value = formatRupiah(nilai)
  emit('update:modelValue', nilai)
}
</script>

<template>
  <input
    type="text"
    inputmode="numeric"
    :value="formatRupiah(props.modelValue)"
    class="h-8 w-36 rounded-md border border-input bg-transparent px-3 py-1 text-right text-xs tabular-nums shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    placeholder="Rp0"
    aria-label="Nominal tagihan"
    @input="onInput"
  />
</template>
