<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, CheckCheck, Inbox } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  useNotifikasiList,
  useTandaiDibaca,
  useTandaiSemuaDibaca,
} from '@/modules/notifikasi/composables/useNotifikasi'

const router = useRouter()
const { data: response, isLoading } = useNotifikasiList()
const { mutate: tandaiDibaca } = useTandaiDibaca()
const { mutate: tandaiSemua } = useTandaiSemuaDibaca()

const notifications = computed(() => response.value?.data ?? [])
const unreadCount = computed(() => response.value?.meta.unread_count ?? 0)

function bukaNotifikasi(id: string, actionUrl: string | null) {
  // Baca status terbaru — klik pada notif yang belum dibaca otomatis
  // menandainya sudah dibaca sebelum pindah ke halaman tujuan.
  const item = notifications.value.find((n) => n.id === id)
  if (item && !item.read_at) {
    tandaiDibaca(id)
  }
  if (actionUrl) router.push(actionUrl)
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon" aria-label="Notifikasi" class="relative" :disabled="isLoading">
        <Bell class="size-4" />
        <span
          v-if="unreadCount > 0"
          class="pointer-events-none absolute -right-1 -top-1 rounded-full bg-destructive px-1 text-[10px] font-bold leading-4 text-white"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" class="w-80 p-0">
      <div class="flex items-center justify-between px-3 py-2">
        <DropdownMenuLabel class="px-0 py-0 font-semibold">Notifikasi</DropdownMenuLabel>
        <button
          v-if="unreadCount > 0"
          type="button"
          class="flex items-center gap-1 text-xs text-primary hover:underline"
          @click="tandaiSemua()"
        >
          <CheckCheck class="size-3.5" />
          Tandai semua dibaca
        </button>
      </div>
      <DropdownMenuSeparator />

      <div class="max-h-80 overflow-y-auto">
        <div v-if="notifications.length === 0" class="px-4 py-8 text-center text-sm text-muted-foreground">
          <Inbox class="mx-auto mb-2 size-6 opacity-50" />
          Tidak ada notifikasi.
        </div>

        <DropdownMenuItem
          v-for="notif in notifications"
          :key="notif.id"
          class="cursor-pointer items-start gap-2 !rounded-none px-3 py-3"
          :class="notif.read_at ? '' : 'bg-accent/50'"
          @click="bukaNotifikasi(notif.id, notif.action_url)"
        >
          <span
            class="mt-1.5 size-2 shrink-0 rounded-full"
            :class="notif.read_at ? 'bg-transparent' : 'bg-destructive'"
            data-testid="unread-dot"
          />
          <span class="flex-1">
            <span class="block text-sm font-semibold text-foreground">
              {{ notif.title }}
            </span>
            <span class="mt-0.5 block text-xs text-muted-foreground">{{ notif.message }}</span>
            <span class="mt-1 block text-[11px] text-muted-foreground/70">{{ notif.created_at }}</span>
          </span>
        </DropdownMenuItem>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>