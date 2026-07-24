<script setup lang="ts">
import { ref, watch } from 'vue'
import { Wifi, Receipt, MessageSquareWarning } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'
import { useProfilPelanggan } from '../../auth/pelanggan/composables/usePelangganAuth'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

const authStore = useAuthStore()

// TODO: endpoint GET /pelanggan/me diasumsikan ada — lihat catatan di
// pelangganAuth.api.ts. Kalau path/bentuk response beda, sesuaikan di situ.
const { data: profil } = useProfilPelanggan()

// Popup ini opsional dan tidak memaksa: cukup ditutup sekali per sesi,
// tidak dipaksa muncul lagi selama pelanggan belum reload/login ulang.
const showPopupGantiPassword = ref(false)
const sudahDitutupManual = ref(false)

watch(
  profil,
  (data) => {
    if (!data) return
    if (data.password_sudah_dibuat === false && !sudahDitutupManual.value) {
      showPopupGantiPassword.value = true
    }
  },
  { immediate: true },
)

function tutupPopup() {
  showPopupGantiPassword.value = false
  sudahDitutupManual.value = true
}

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

    <Dialog v-model:open="showPopupGantiPassword">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Amankan akun kamu</DialogTitle>
          <DialogDescription>
            Kamu belum pernah mengganti password sejak akun dibuat. Yuk buat password baru
            supaya akun kamu lebih aman. Langkah ini opsional dan bisa dilakukan nanti.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2 sm:gap-0">
          <Button variant="outline" @click="tutupPopup">Nanti Saja</Button>
          <Button as="RouterLink" to="/pelanggan/ganti-password" @click="tutupPopup">
            Ganti Sekarang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>