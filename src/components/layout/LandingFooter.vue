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
  <footer class="border-t bg-background">
    <div class="mx-auto max-w-6xl px-6 py-16">
      <div class="grid gap-10 md:grid-cols-3">
        <div>
          <p class="text-lg font-semibold tracking-tight">Sicakra</p>
          <p class="mt-2 max-w-xs text-sm text-muted-foreground">
            Layanan internet cepat dan andal untuk rumah dan usaha kamu.
          </p>
        </div>

        <div>
          <p class="text-xs font-medium uppercase tracking-widest text-muted-foreground">Navigasi</p>
          <nav class="mt-3 flex flex-col gap-2">
            <RouterLink
              v-for="item in navigasi"
              :key="item.to"
              :to="item.to"
              class="text-sm text-muted-foreground hover:text-foreground"
            >
              {{ item.label }}
            </RouterLink>
          </nav>
        </div>

        <div>
          <p class="text-xs font-medium uppercase tracking-widest text-muted-foreground">Kontak</p>
          <p class="mt-3 text-sm text-muted-foreground">halo@sicakra.id</p>
        </div>
      </div>

      <div class="mt-12 border-t pt-6 text-xs text-muted-foreground">
        <p>&copy; {{ new Date().getFullYear() }} Sicakra. Diselenggarakan oleh PT Aqrapana Jaya Mandiri.</p>
      </div>
    </div>
  </footer>
</template>
