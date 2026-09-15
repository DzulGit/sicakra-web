<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Input } from '@/components/ui/input'
import { formatAngka } from '@/lib/currency'

const props = defineProps<{
  modelValue: number | null
  id?: string
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [number | null]
}>()

const angka = ref(props.modelValue ?? '')

watch(
  () => props.modelValue,
  (v) => {
    const target = v ? String(v) : ''
    if (target !== String(angka.value)) angka.value = target
  },
)

const tampil = computed(() => {
  if (angka.value === '' || angka.value === null) return ''
  return formatAngka(Number(angka.value))
})

function onInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value
  angka.value = raw.replace(/\D/g, '')
  emit('update:modelValue', angka.value === '' ? null : Number(angka.value))
}
</script>

<template>
  <!-- ponytail: caret reset ke akhir saat mengetik; pas untuk nominal di bawah ~7 digit -->
  <Input
    :id="id"
    :value="tampil"
    :placeholder="placeholder"
    :disabled="disabled"
    inputmode="numeric"
    autocomplete="off"
    class="text-right tabular-nums"
    @input="onInput"
  />
</template>