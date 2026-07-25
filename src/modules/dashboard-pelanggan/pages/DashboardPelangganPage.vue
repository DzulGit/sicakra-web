<script setup lang="ts">
import { ref, watch } from 'vue'
import { Wifi, Receipt, MessageSquareWarning, X, ShieldAlert } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'
import { useProfil } from '@/modules/profil/composables/useProfil'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const authStore = useAuthStore()

// Sumber kebenaran status password_sudah_dibuat: data profil pelanggan
// (GET /pelanggan/profil), bukan dari response login.
const { data: profil } = useProfil()

// Banner ini opsional dan tidak memaksa: cukup ditutup sekali per sesi,
// tidak dipaksa muncul lagi selama pelanggan belum reload/login ulang.
const showBannerGantiKredensial = ref(false)
const sudahDitutupManual = ref(false)

watch(
  profil,
  (data) => {
    if (!data) return
    if (data.password_sudah_dibuat === false && !sudahDitutupManual.value) {
      showBannerGantiKredensial.value = true
    }
  },
  { immediate: true },
)

function tutupBanner() {
  showBannerGantiKredensial.value = false
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
    <div
      v-if="showBannerGantiKredensial"
      class="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900"
    >
      <ShieldAlert class="mt-0.5 size-5 shrink-0 text-amber-600" />
      <div class="flex-1 text-sm">
        <p class="font-medium">Amankan akun kamu</p>
        <p class="mt-0.5 text-amber-800/80">
          Kamu masih pakai username & password default (nomor pelanggan). Yuk ganti supaya akun
          kamu lebih aman — langkah ini opsional, bisa dilakukan kapan saja lewat halaman Profil.
        </p>
        <Button
          as="RouterLink"
          to="/pelanggan/profil"
          size="sm"
          variant="outline"
          class="mt-3 border-amber-300 bg-white hover:bg-amber-100"
          @click="tutupBanner"
        >
          Ganti di Profil
        </Button>
      </div>
      <button
        type="button"
        class="shrink-0 text-amber-500 hover:text-amber-700"
        aria-label="Tutup"
        @click="tutupBanner"
      >
        <X class="size-4" />
      </button>
    </div>

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