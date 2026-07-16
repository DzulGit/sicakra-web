<script setup lang="ts">
import { RouterLink } from 'vue-router'

const navigasi = [
  { label: 'Paket Internet', to: '/paket-internet' },
  { label: 'Tentang Kami', to: '/tentang-kami' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Kontak', to: '/kontak' },
]
</script>

<template>
  <footer class="bg-landing-ink text-landing-mist">
    <div class="mx-auto max-w-6xl px-6 py-16">
      <div class="grid gap-10 md:grid-cols-3">
        <div>
          <p class="font-display text-xl italic tracking-tight">Sicakra</p>
          <p class="mt-3 max-w-xs text-sm text-landing-mist/60">
            Internet fiber untuk rumah dan usaha — dipasang, dijaga, dan diperbaiki oleh tim yang
            benar-benar datang ke lokasi kamu.
          </p>
        </div>

        <div>
          <p class="font-landing-mono text-xs uppercase tracking-[0.15em] text-landing-mist/40">Navigasi</p>
          <nav class="mt-4 flex flex-col gap-2">
            <RouterLink
              v-for="item in navigasi"
              :key="item.to"
              :to="item.to"
              class="text-sm text-landing-mist/70 hover:text-landing-mist"
            >
              {{ item.label }}
            </RouterLink>
          </nav>
        </div>

        <div>
          <p class="font-landing-mono text-xs uppercase tracking-[0.15em] text-landing-mist/40">Kontak</p>
          <p class="mt-4 text-sm text-landing-mist/70">halo@sicakra.id</p>
          <p class="mt-1 text-sm text-landing-mist/70">0800-1-SICAKRA</p>
        </div>
      </div>

      <div class="mt-12 flex flex-col gap-2 border-t border-landing-mist/10 pt-6 font-landing-mono text-[11px] text-landing-mist/40 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {{ new Date().getFullYear() }} SICAKRA — DISELENGGARAKAN OLEH PT AQRAPANA JAYA MANDIRI</p>
        <p class="flex items-center gap-2">
          <span class="inline-block size-1.5 rounded-full bg-landing-signal" />
          SEMUA LAYANAN BEROPERASI NORMAL
        </p>
      </div>
    </div>
  </footer>
</template>
