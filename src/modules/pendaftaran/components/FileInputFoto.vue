<script setup lang="ts">
import { computed } from 'vue'
import { Upload, CheckCircle2 } from 'lucide-vue-next'
import { Label } from '@/components/ui/label'

const props = defineProps<{
  modelValue: File | null
  label: string
  hint?: string
  error?: string
}>()
const emit = defineEmits<{ (e: 'update:modelValue', file: File | null): void }>()

const namaFile = computed(() => props.modelValue?.name)

function handleChange(event: Event) {
  const input = event.target as HTMLInputElement
  emit('update:modelValue', input.files?.[0] ?? null)
}
</script>

<template>
  <div class="space-y-2">
    <Label>{{ label }}</Label>
    <label
      class="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-input px-4 py-3 text-sm transition-colors hover:bg-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2"
      :class="{ 'border-destructive': error }"
    >
      <CheckCircle2 v-if="namaFile" class="size-4 shrink-0 text-success" />
      <Upload v-else class="size-4 shrink-0 text-muted-foreground" />
      <span class="truncate" :class="namaFile ? 'text-foreground' : 'text-muted-foreground'">
        {{ namaFile ?? 'Pilih file gambar (maks. 2MB)' }}
      </span>
      <input type="file" accept="image/*" class="sr-only" @change="handleChange" />
    </label>
    <p v-if="hint" class="text-xs text-muted-foreground">{{ hint }}</p>
    <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
  </div>
</template>
