<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/data/EmptyState.vue'
import { UserPlus } from 'lucide-vue-next'
import type { Pelanggan } from '@/types/models'

defineProps<{
  data?: Pelanggan[]
  loading?: boolean
}>()
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-sm font-medium">
        <UserPlus class="size-4 text-muted-foreground" />
        Pelanggan Baru
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Skeleton v-if="loading" class="h-[200px] w-full" />
      <EmptyState
        v-else-if="!data || data.length === 0"
        judul="Belum ada pelanggan baru"
        deskripsi="Pelanggan yang baru mendaftar akan muncul di sini."
      />
      <ul v-else class="space-y-2">
        <li
          v-for="item in data"
          :key="item.id"
          class="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm"
        >
          <div class="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            {{ item.nama_lengkap.charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate font-medium">{{ item.nama_lengkap }}</p>
            <p class="text-xs text-muted-foreground">
              {{ item.nomor_pelanggan ?? '-' }}
              <span v-if="item.created_at" class="before:mx-1 before:content-['·']">
                {{ new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) }}
              </span>
            </p>
          </div>
        </li>
      </ul>
    </CardContent>
  </Card>
</template>
