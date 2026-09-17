<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { X } from 'lucide-vue-next'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { FilterFieldConfig } from '@/types/filter'

const props = defineProps<{ fields: FilterFieldConfig[] }>()
const route = useRoute()
const router = useRouter()

function nilaiFilter(key: string): string | undefined {
  const nilai = route.query[key]
  return typeof nilai === 'string' ? nilai : undefined
}

function setFilter(key: string, nilai: string | null) {
  const query: Record<string, string> = {}
  const kunciDikenal = new Set([...props.fields.map((f) => f.key), 'page', 'per_page'])
  for (const [k, v] of Object.entries(route.query)) {
    if (typeof v === 'string' && kunciDikenal.has(k)) query[k] = v
  }
  if (nilai) query[key] = nilai
  else delete query[key]
  router.push({ query })
}

function resetSemua() {
  router.push({ query: {} })
}

const adaFilterAktif = computed(() => props.fields.some((f) => !!nilaiFilter(f.key)))

// Untuk field text: nilai lokal + debounce sebelum di-commit ke query-string,
// supaya tidak membanjiri history/router setiap keystroke.
const teksLokal = ref<Record<string, string>>({})
let timer: ReturnType<typeof setTimeout> | undefined
function onNilaiText(key: string, nilai: string) {
  teksLokal.value[key] = nilai
  clearTimeout(timer)
  timer = setTimeout(() => setFilter(key, nilai.trim() || null), 300)
}
watch(
  () => route.fullPath,
  () => {
    for (const f of props.fields) {
      if (f.type === 'text' && teksLokal.value[f.key] !== (nilaiFilter(f.key) ?? '')) {
        teksLokal.value[f.key] = nilaiFilter(f.key) ?? ''
      }
    }
  },
)
</script>
<template>
  <div class="flex flex-wrap items-center gap-2">
    <template v-for="field in fields" :key="field.key">
      <Select
        v-if="(field.type ?? 'select') === 'select'"
        :model-value="nilaiFilter(field.key)"
        @update:model-value="(nilai) => setFilter(field.key, nilai as string)"
      >
        <SelectTrigger class="w-44"><SelectValue :placeholder="field.placeholder ?? field.label" /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="opt in field.options ?? []" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
        </SelectContent>
      </Select>
      <Input
        v-else
        :model-value="teksLokal[field.key] ?? nilaiFilter(field.key) ?? ''"
        :placeholder="field.placeholder ?? `Cari ${field.label}...`"
        class="w-56"
        @update:model-value="(nilai) => onNilaiText(field.key, String(nilai))"
      />
    </template>
    <Button v-if="adaFilterAktif" variant="ghost" size="sm" @click="resetSemua">
      <X class="size-4" />
      Reset Filter
    </Button>
  </div>
</template>