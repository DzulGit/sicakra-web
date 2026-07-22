<script setup lang="ts">
/**
 * Placeholder sementara untuk route yang halamannya belum dibangun
 * (menyusul di Fase 5-10 roadmap frontend). Dipakai supaya struktur routing
 * & navigation guard bisa langsung diverifikasi jalan di Fase 0, tanpa
 * menunggu semua halaman selesai.
 */
defineProps<{
  judul?: string
}>()
</script>

<template>
  <div class="flex min-h-[50vh] flex-col items-center justify-center gap-2 p-8 text-center">
    <p class="text-sm text-muted-foreground">Halaman dalam pengembangan</p>
    <h1 class="text-xl font-semibold">{{ judul ?? 'Menyusul' }}</h1>
  </div>
</template>
