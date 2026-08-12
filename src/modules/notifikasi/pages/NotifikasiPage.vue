<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Component } from 'vue'
import {
  Bell,
  CheckCheck,
  FileText,
  MessageSquareWarning,
  Receipt,
  ShieldCheck,
  UserPlus,
  Wallet,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useNotifikasiList,
  useTandaiDibaca,
  useTandaiSemuaDibaca,
} from '@/modules/notifikasi/composables/useNotifikasi'
import type { Notifikasi } from '@/modules/notifikasi/api/notifikasi.api'

const router = useRouter()
const { data: response, isLoading } = useNotifikasiList()
const { mutate: tandaiDibaca } = useTandaiDibaca()
const { mutate: tandaiSemua } = useTandaiSemuaDibaca()

const notifikasi = computed(() => response.value?.data ?? [])
const unreadCount = computed(() => response.value?.meta.unread_count ?? 0)

const IKON_TIPE: Record<string, { icon: Component; kelas: string }> = {
  tagihan: { icon: Receipt, kelas: 'bg-blue-100 text-blue-600' },
  pembayaran: { icon: Wallet, kelas: 'bg-emerald-100 text-emerald-600' },
  pendaftaran: { icon: UserPlus, kelas: 'bg-violet-100 text-violet-600' },
  permohonan: { icon: FileText, kelas: 'bg-indigo-100 text-indigo-600' },
  laporan_kendala: { icon: MessageSquareWarning, kelas: 'bg-amber-100 text-amber-600' },
  akun: { icon: ShieldCheck, kelas: 'bg-slate-100 text-slate-600' },
}

function tipeInfo(notif: Notifikasi) {
  return IKON_TIPE[notif.type] ?? { icon: Bell, kelas: 'bg-slate-100 text-slate-600' }
}

function bukaNotifikasi(notif: Notifikasi) {
  // Klik notif yang belum dibaca = otomatis tandai sudah dibaca.
  if (!notif.read_at) tandaiDibaca(notif.id)
  if (notif.action_url) router.push(notif.action_url)
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-4 pb-4">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold">Notifikasi</h1>
        <p v-if="notifikasi.length > 0" class="text-sm text-muted-foreground">
          {{ unreadCount }} belum dibaca &middot; {{ notifikasi.length }} total
        </p>
      </div>
      <Button v-if="unreadCount > 0" variant="outline" size="sm" @click="tandaiSemua()">
        <CheckCheck class="size-4" />
        Tandai semua dibaca
      </Button>
    </div>

    <div v-if="isLoading" class="space-y-3">
      <Skeleton v-for="i in 5" :key="i" class="h-20 w-full" />
    </div>

    <div v-else-if="notifikasi.length === 0" class="flex flex-col items-center gap-2 py-16 text-center">
      <Bell class="size-10 text-muted-foreground/40" />
      <p class="text-sm font-medium">Belum ada notifikasi</p>
      <p class="max-w-xs text-sm text-muted-foreground">Notifikasi tagihan, layanan, dan laporan kendala akan muncul di sini.</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="notif in notifikasi"
        :key="notif.id"
        role="button"
        tabindex="0"
        class="flex cursor-pointer items-start gap-4 rounded-xl border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:border-primary/40"
        :class="{ 'border-l-4 border-l-primary bg-accent/40': !notif.read_at }"
        @click="bukaNotifikasi(notif)"
        @keydown.enter="bukaNotifikasi(notif)"
      >
        <span
          class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full"
          :class="tipeInfo(notif).kelas"
        >
          <component :is="tipeInfo(notif).icon" class="size-4" />
        </span>

        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-2">
            <p class="font-semibold text-foreground">{{ notif.title }}</p>
            <span
              v-if="!notif.read_at"
              class="size-2 shrink-0 rounded-full bg-destructive"
              data-testid="unread-dot"
            />
          </div>
          <p class="mt-0.5 whitespace-pre-line text-sm text-muted-foreground">{{ notif.message }}</p>
          <p class="mt-1 text-xs text-muted-foreground/70">{{ notif.created_at }}</p>
        </div>
      </div>
    </div>
  </div>
</template>