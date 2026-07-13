<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { X } from 'lucide-vue-next'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { FilterFieldConfig } from '@/types/filter'

/**
 * Filter generik berbasis config, sinkron ke query-string. Nama `key` tiap
 * field HARUS sama persis dengan param yang dikenali QueryFilter backend
 * (lihat app/Filters/*.php) — kalau tidak sama, filter tidak akan berefek
 * (backend cuma mengabaikan param yang tidak dikenali, bukan error).
 */
const props = defineProps<{ fields: FilterFieldConfig[] }>()

const route = useRoute()
const router = useRouter()

function nilaiFilter(key: string): string | undefined {
  const nilai = route.query[key]
  return typeof nilai === 'string' ? nilai : undefined
}

function setFilter(key: string, nilai: string | null) {
  const query: Record<string, string> = {}
  for (const [k, v] of Object.entries(route.query)) {
    if (typeof v === 'string' && k !== 'page') query[k] = v
  }
  if (nilai) query[key] = nilai
  else delete query[key]
  router.push({ query }) // reset ke halaman 1 tiap filter berubah (page sengaja tidak ikut dibawa)
}

function resetSemua() {
  router.push({ query: {} })
}

const adaFilterAktif = computed(() => props.fields.some((f) => !!nilaiFilter(f.key)))
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <Select
      v-for="field in fields"
      :key="field.key"
      :model-value="nilaiFilter(field.key)"
      @update:model-value="(nilai) => setFilter(field.key, nilai as string)"
    >
      <SelectTrigger class="w-44">
        <SelectValue :placeholder="field.placeholder ?? field.label" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="opt in field.options" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </SelectItem>
      </SelectContent>
    </Select>

    <Button v-if="adaFilterAktif" variant="ghost" size="sm" @click="resetSemua">
      <X class="size-4" />
      Reset Filter
    </Button>
  </div>
</template>
