<script setup lang="ts">
import { Wifi, Receipt, MessageSquareWarning } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const authStore = useAuthStore()

const tautan = [
  {
    judul: 'Layanan Saya',
    deskripsi: 'Lihat status & detail layanan internet kamu',
    to: '/pelanggan/layanan',
    icon: Wifi,
  },
  {
    judul: 'Tagihan Saya',
    deskripsi: 'Cek tagihan dan lakukan pembayaran',
    to: '/pelanggan/tagihan',
    icon: Receipt,
  },
  {
    judul: 'Laporan Kendala',
    deskripsi: 'Laporkan gangguan pada layanan kamu',
    to: '/pelanggan/laporan-kendala',
    icon: MessageSquareWarning,
  },
]
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl font-semibold">Halo, {{ authStore.pengguna?.nama_lengkap }} 👋</h1>
      <p class="text-sm text-muted-foreground">Selamat datang di Dashboard Sicakra.</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <Card v-for="item in tautan" :key="item.to">
        <CardHeader>
          <component :is="item.icon" class="mb-2 size-6 text-primary" />
          <CardTitle class="text-base">{{ item.judul }}</CardTitle>
          <CardDescription>{{ item.deskripsi }}</CardDescription>
        </CardHeader>
        <div class="px-6 pb-6">
          <Button as="RouterLink" :to="item.to" variant="outline" size="sm">Buka</Button>
        </div>
      </Card>
    </div>
  </div>
</template>
