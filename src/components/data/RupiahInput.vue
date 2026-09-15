<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { formatRupiah } from '@/lib/currency'

const props = withDefaults(
  defineProps<{
    modelValue: number | null
    id?: string
    placeholder?: string
    disabled?: boolean
  }>(),
  { modelValue: null, placeholder: 'Rp0' },
)

const emit = defineEmits<{
  'update:modelValue': [number | null]
}>()

const el = ref<HTMLInputElement | null>(null)
const angka = ref(props.modelValue != null ? String(props.modelValue) : '')

function tampil(raw: string) {
  return raw ? formatRupiah(Number(raw)) : ''
}

function setCaret(input: HTMLInputElement, digitsBefore: number, formatted: string) {
  if (!formatted) { input.setSelectionRange(0, 0); return }
  if (digitsBefore === 0) { input.setSelectionRange(0, 0); return }
  let count = 0
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) count++
    if (count >= digitsBefore) { input.setSelectionRange(i + 1, i + 1); return }
  }
  input.setSelectionRange(formatted.length, formatted.length)
}

function onFocus(e: Event) {
  const input = e.target as HTMLInputElement
  input.setSelectionRange(input.value.length, input.value.length)
}

function onInput(event: Event) {
  const input = event.target as HTMLInputElement
  const raw = input.value
  const cursorPos = input.selectionStart ?? raw.length
  const digitsBefore = (raw.slice(0, cursorPos).match(/\d/g) ?? []).length

  const digits = raw.replace(/\D/g, '')
  angka.value = digits
  emit('update:modelValue', digits === '' ? null : Number(digits))

  const formatted = tampil(digits)
  input.value = formatted
  setCaret(input, digitsBefore, formatted)
}

watch(
  () => props.modelValue,
  (v) => {
    const target = v != null ? String(v) : ''
    if (target === angka.value) return
    angka.value = target
    nextTick(() => {
      if (el.value) el.value.value = tampil(target)
    })
  },
)

onMounted(() => {
  if (el.value && angka.value) el.value.value = tampil(angka.value)
})
</script>

<template>
  <input
    ref="el"
    :id="id"
    type="text"
    inputmode="numeric"
    autocomplete="off"
    :placeholder="placeholder"
    :disabled="disabled"
    class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-right text-sm tabular-nums shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
    @focus="onFocus"
    @input="onInput"
  />
</template>