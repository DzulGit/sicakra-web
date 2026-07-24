<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// Halaman auth default (login admin, buat-password, dst) tetap pakai card
// sempit terpusat seperti semula. Halaman yang butuh layout penuh (mis.
// login pelanggan dengan panel dua kolom) set `meta.fullBleed = true` di
// route-nya untuk lepas dari batasan max-w-sm ini.
const fullBleed = computed(() => !!route.meta.fullBleed)

</script>

<template>
  <div v-if="fullBleed" class="min-h-screen">
    <slot />
  </div>
  <div v-else class="flex min-h-screen items-center justify-center bg-muted/30 px-4">
    <div class="w-full max-w-sm">
      <RouterLink to="/" class="mb-8 flex justify-center text-lg font-semibold tracking-tight">
        Sicakra
      </RouterLink>
      <slot />
    </div>
  </div>
</template>