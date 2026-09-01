<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, CheckCheck, Inbox } from 'lucide-vue-next'
import {
  useNotifikasiList,
  useTandaiDibaca,
  useTandaiSemuaDibaca,
} from '@/modules/notifikasi/composables/useNotifikasi'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const router = useRouter()
const { data: response, isLoading } = useNotifikasiList()
const { mutate: tandaiDibaca, isPending: sedangTandai } = useTandaiDibaca()
const { mutate: tandaiSemua, isPending: sedangTandaiSemua } = useTandaiSemuaDibaca()

const notifications = computed(() => response.value?.data ?? [])
const unreadCount = computed(() => response.value?.meta.unread_count ?? 0)

function bukaNotifikasi(id: string, actionUrl: string | null, sudahDibaca: boolean) {
  if (!sudahDibaca && !sedangTandai) {
    tandaiDibaca(id)
  }
  if (actionUrl) router.push(actionUrl)
}

function relativeTime(dateStr: string) {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)

  if (diff < 60) return 'Baru saja'
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h1 class="text-xl font-semibold">Notifikasi</h1>
        <span
          v-if="unreadCount > 0"
          class="rounded-full bg-destructive px-2 py-0.5 text-xs font-bold text-white"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </div>
      <Button
        v-if="unreadCount > 0"
        variant="outline"
        size="sm"
        :disabled="sedangTandaiSemua"
        @click="tandaiSemua()"
      >
        <CheckCheck class="size-4 mr-1" />
        Tandai semua dibaca
      </Button>
    </div>

    <div v-if="isLoading" class="space-y-3">
      <Skeleton v-for="i in 5" :key="i" class="h-20 rounded-xl" />
    </div>

    <Card v-else-if="notifications.length === 0" class="rounded-xl border shadow-none">
      <CardContent class="flex flex-col items-center justify-center py-12">
        <Inbox class="mb-3 size-10 text-muted-foreground/50" />
        <p class="text-sm text-muted-foreground">Tidak ada notifikasi.</p>
      </CardContent>
    </Card>

    <div v-else class="space-y-2">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        class="flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors hover:bg-accent/50"
        :class="notif.read_at ? '' : 'border-l-2 border-l-primary bg-accent/30'"
      >
        <div
          class="mt-1 size-2 shrink-0 rounded-full"
          :class="notif.read_at ? 'bg-transparent' : 'bg-primary'"
        />
        <div class="min-w-0 flex-1">
          <button
            type="button"
            class="text-left"
            @click="bukaNotifikasi(notif.id, notif.action_url, !!notif.read_at)"
          >
            <p class="text-sm font-semibold text-foreground">{{ notif.title }}</p>
            <p class="mt-0.5 text-sm text-muted-foreground">{{ notif.message }}</p>
            <p class="mt-1 text-xs text-muted-foreground/70">{{ relativeTime(notif.created_at) }}</p>
          </button>
        </div>
        <button
          v-if="!notif.read_at"
          type="button"
          class="mt-0.5 shrink-0 text-xs font-medium text-primary hover:underline"
          :disabled="sedangTandai"
          @click.stop="tandaiDibaca(notif.id)"
        >
          Tandai sudah dibaca
        </button>
      </div>
    </div>
  </div>
</template>
