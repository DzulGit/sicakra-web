<script setup lang="ts">
/**
 * Elemen signature Landing Page — bar tipis gaya "readout" jaringan yang
 * jadi pembatas antar section. Terinspirasi status bar router/ONT (nyala
 * = terhubung), bukan divider dekoratif biasa. SELALU ink+mist supaya
 * konsisten dikenali di mana pun muncul, terlepas warna section sekitarnya.
 */
defineProps<{
  items: string[]
}>()
</script>

<template>
  <div class="bg-landing-ink py-3">
    <div
      class="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-2 px-6 font-landing-mono text-[11px] uppercase tracking-[0.15em] text-landing-mist/70"
    >
      <span v-for="(item, i) in items" :key="i" class="flex items-center gap-2 whitespace-nowrap">
        <span class="inline-block size-1.5 shrink-0 rounded-full bg-landing-signal" />
        {{ item }}
      </span>
    </div>
  </div>
</template>
