<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import type { EnumMap } from '@/lib/enums'

/**
 * Satu-satunya cara menampilkan status di seluruh app — JANGAN pakai <Badge>
 * langsung untuk enum status, selalu lewat komponen ini supaya warna/label
 * konsisten dan terpusat (lihat src/lib/enums.ts).
 *
 * Contoh: <StatusBadge :value="permohonan.status" :map="statusPermohonanEnum" />
 */
const props = defineProps<{
  value: string
  map: EnumMap
}>()

const meta = computed(() => props.map[props.value] ?? { label: props.value, badgeVariant: 'outline' as const })
</script>

<template>
  <Badge :variant="meta.badgeVariant">{{ meta.label }}</Badge>
</template>
