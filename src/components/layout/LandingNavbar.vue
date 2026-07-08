<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Button } from '@/components/ui/button'
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
          class="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="hidden items-center gap-3 md:flex">
        <Button as="RouterLink" to="/admin/masuk" variant="ghost" size="sm">Masuk</Button>
        <Button as="RouterLink" to="/daftar" size="sm">Daftar Berlangganan</Button>
      </div>

      <button class="md:hidden" aria-label="Buka menu" @click="menuTerbuka = !menuTerbuka">
        <component :is="menuTerbuka ? X : Menu" class="size-5" />
      </button>
    </div>

    <!-- Menu mobile -->
    <div v-if="menuTerbuka" class="border-t bg-background md:hidden">
      <nav class="flex flex-col gap-1 p-4">
        <RouterLink
          v-for="item in tautan"
          :key="item.to"
          :to="item.to"
          class="rounded-md px-3 py-2 text-sm hover:bg-accent"
          @click="menuTerbuka = false"
        >
          {{ item.label }}
        </RouterLink>
        <div class="mt-2 flex flex-col gap-2 border-t pt-4">
          <Button as="RouterLink" to="/admin/masuk" variant="outline">Masuk</Button>
          <Button as="RouterLink" to="/daftar">Daftar Berlangganan</Button>
        </div>
      </nav>
    </div>
  </header>
</template>
