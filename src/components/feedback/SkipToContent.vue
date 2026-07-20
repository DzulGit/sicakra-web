<script setup lang="ts">
/**
 * Link "lewati ke konten" untuk pengguna keyboard/screen reader — tersembunyi
 * secara visual sampai di-focus (Tab pertama kali di halaman). Wajib ada di
 * setiap layout, dipasang PALING ATAS sebelum elemen lain yang bisa di-focus.
 */
defineProps<{
  target?: string
}>()
</script>

<template>
  <a
    :href="target ?? '#konten-utama'"
    class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-background"
  >
    Lewati ke konten utama
  </a>
</template>
