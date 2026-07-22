<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Menu, X } from 'lucide-vue-next'

const menuTerbuka = ref(false)

const tautan = [
  { label: 'Beranda', to: '/' },
  { label: 'Paket Internet', to: '/paket-internet' },
  { label: 'Tentang Kami', to: '/tentang-kami' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Kontak', to: '/kontak' },
]
</script>

<template>
  <header class="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-8xl items-center justify-between px-6">
      <RouterLink to="/" class="text-lg font-semibold tracking-tight">
        <img src="/public/logo-sicakra.png" alt="Logo" class="h-13 w-auto mt-[-10]" />
      </RouterLink>

      <nav class="hidden items-center gap-8 md:flex">
        <RouterLink
          v-for="item in tautan"
          :key="item.to"
          :to="item.to"
          class="text-sm text-landing-ink/70 transition-colors hover:text-landing-ink"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="hidden items-center gap-3 md:flex">
        <RouterLink to="/admin/masuk" class="text-sm text-landing-ink/70 hover:text-landing-ink">
          Masuk
        </RouterLink>
        <RouterLink
          to="/daftar"
          class="rounded-full bg-landing-ink px-5 py-2 text-sm font-medium text-landing-mist transition-colors hover:bg-landing-teal-deep"
        >
          Daftar Berlangganan
        </RouterLink>
      </div>

      <button
        class="text-landing-ink md:hidden"
        aria-label="Buka menu"
        @click="menuTerbuka = !menuTerbuka"
      >
        <component :is="menuTerbuka ? X : Menu" class="size-5" />
      </button>
    </div>

    <!-- Menu mobile -->
    <div v-if="menuTerbuka" class="border-t border-landing-ink/10 bg-landing-paper md:hidden">
      <nav class="flex flex-col gap-1 p-4">
        <RouterLink
          v-for="item in tautan"
          :key="item.to"
          :to="item.to"
          class="rounded-md px-3 py-2 text-sm text-landing-ink hover:bg-landing-mist"
          @click="menuTerbuka = false"
        >
          {{ item.label }}
        </RouterLink>
        <div class="mt-2 flex flex-col gap-2 border-t border-landing-ink/10 pt-4">
          <RouterLink
            to="/admin/masuk"
            class="rounded-full border border-landing-ink/20 px-5 py-2 text-center text-sm text-landing-ink"
          >
            Masuk
          </RouterLink>
          <RouterLink
            to="/daftar"
            class="rounded-full bg-landing-ink px-5 py-2 text-center text-sm font-medium text-landing-mist"
          >
            Daftar Berlangganan
          </RouterLink>
        </div>
      </nav>
    </div>
  </header>
</template>
