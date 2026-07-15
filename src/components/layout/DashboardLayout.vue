<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import AppTopbar from './AppTopbar.vue'
import type { BreadcrumbItem } from './AppBreadcrumb.vue'
import BottomNavigation from "./BottomNavigation.vue";
import { usePlatform } from "@/composables/usePlatform";

/**
 * Layout bersama Dashboard Admin & Pelanggan — satu komponen, menu beda
 * (lihat AppSidebar + lib/menu.ts), kerangka visual sama. Lihat
 * docs/frontend/arsitektur/architecture.md bagian Layout System.
 *
 * Breadcrumb default cuma 1 level (judul halaman dari route.meta.judul).
 * Halaman detail yang butuh breadcrumb lebih dalam (mis. "Permohonan >
 * Detail #123") bisa override lewat prop `breadcrumbTambahan` nanti kalau
 * sudah ada kasus nyata — sengaja tidak dibangun sebelum ada pemakainya.
 */
const props = defineProps<{
  breadcrumbTambahan?: BreadcrumbItem[]
}>()

const route = useRoute()

const breadcrumb = computed<BreadcrumbItem[]>(() => [
  { label: String(route.meta.judul ?? '') },
  ...(props.breadcrumbTambahan ?? []),
])

const { isNative } = usePlatform();

</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <AppSidebar v-if="!isNative" />
    <div class="flex flex-1 flex-col overflow-hidden">
      <AppTopbar :breadcrumb="breadcrumb" />
      <main class="flex-1 overflow-y-auto p-6" :class="{'pb-32': isNative}">
        <slot />
      </main>
    </div>
    <BottomNavigation v-if="isNative" />
  </div>
</template>
