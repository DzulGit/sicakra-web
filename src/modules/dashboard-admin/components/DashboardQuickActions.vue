<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Component } from 'vue'
import { FileText, UserPlus, Wifi, MessageSquareWarning, UsersRound, Calendar, Receipt, DollarSign, Activity } from 'lucide-vue-next'

const authStore = useAuthStore()

interface Action {
  label: string
  to: string
  icon: Component
  variant: 'default' | 'outline'
}

const roleActions: Record<string, Action[]> = {
  operasional: [
    { label: 'Permohonan', to: '/admin/operasional/permohonan-layanan', icon: FileText, variant: 'default' },
    { label: 'Pendaftar Baru', to: '/admin/operasional/pelanggan', icon: UserPlus, variant: 'outline' },
    { label: 'Paket Internet', to: '/admin/operasional/paket-internet', icon: Wifi, variant: 'outline' },
    { label: 'Laporan Kendala', to: '/admin/operasional/laporan-kendala', icon: MessageSquareWarning, variant: 'outline' },
    { label: 'Tim Teknisi', to: '/admin/operasional/tim-teknisi', icon: UsersRound, variant: 'outline' },
    { label: 'Pelanggan', to: '/admin/operasional/pelanggan', icon: UserPlus, variant: 'outline' },
  ],
  keuangan: [
    { label: 'Tagihan', to: '/admin/keuangan/tagihan', icon: Receipt, variant: 'default' },
    { label: 'Pendapatan', to: '/admin/keuangan/tagihan', icon: DollarSign, variant: 'outline' },
  ],
  teknisi: [
    { label: 'Jadwal Kerja', to: '/admin/teknisi/jadwal-kerja', icon: Calendar, variant: 'default' },
    { label: 'Laporan Kendala', to: '/admin/teknisi/laporan-kendala', icon: MessageSquareWarning, variant: 'outline' },
  ],
  super_admin: [
    { label: 'Kelola Admin', to: '/admin/super-admin/admin', icon: UsersRound, variant: 'default' },
    { label: 'Permohonan', to: '/admin/operasional/permohonan-layanan', icon: FileText, variant: 'outline' },
    { label: 'Pelanggan', to: '/admin/operasional/pelanggan', icon: UserPlus, variant: 'outline' },
    { label: 'Tagihan', to: '/admin/keuangan/tagihan', icon: Receipt, variant: 'outline' },
    { label: 'Laporan Kendala', to: '/admin/operasional/laporan-kendala', icon: MessageSquareWarning, variant: 'outline' },
    { label: 'Jadwal Kerja', to: '/admin/teknisi/jadwal-kerja', icon: Calendar, variant: 'outline' },
  ],
}

const actions = computed(() => roleActions[authStore.peranAdmin ?? 'operasional'] ?? roleActions.operasional)
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-sm font-medium">
        <Activity class="size-4 text-muted-foreground" />
        Akses Cepat
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Button
          v-for="action in actions"
          :key="action.to"
          as="RouterLink"
          :to="action.to"
          :variant="action.variant"
          class="justify-start gap-2 h-auto py-2.5 px-3 text-xs"
        >
          <component :is="action.icon" class="size-3.5 shrink-0" />
          <span class="truncate">{{ action.label }}</span>
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
