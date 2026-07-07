<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { Toaster } from 'vue-sonner'

/**
 * Layout pembungkus (Landing/Auth/Dashboard) menyusul di Fase 2 roadmap.
 * Untuk sekarang, App.vue cukup pasang <RouterView/> + judul halaman dinamis
 * + Toaster global, supaya seluruh mekanisme routing & provider bisa diverifikasi.
 */
const route = useRoute()

useHead({
  title: computed(() => route.meta.judul ?? 'Sicakra'),
  meta: [
    { name: 'description', content: 'Sicakra — Layanan internet oleh PT Aqrapana Jaya Mandiri' },
  ],
})
</script>

<template>
  <RouterView />
  <Toaster richColors position="top-right" />
</template>
