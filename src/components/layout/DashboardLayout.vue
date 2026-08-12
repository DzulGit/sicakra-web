<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import AppSidebar from './AppSidebar.vue'
import AppTopbar from './AppTopbar.vue'
import SkipToContent from '@/components/feedback/SkipToContent.vue'
import type { BreadcrumbItem } from './AppBreadcrumb.vue'
import BottomNavigation from "./BottomNavigation.vue";
import { usePlatform } from "@/composables/usePlatform";
import { useUiStore } from '@/stores/ui.store'

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
const authStore = useAuthStore();

const tanpaSidebar = computed(() => authStore.peranAdmin === 'super_admin')

const uiStore = useUiStore()
</script>

<template>
  <SkipToContent />
  <div class="flex h-screen overflow-hidden">
    <AppSidebar v-if="!isNative && !tanpaSidebar" />
    <div v-if="!isNative && !tanpaSidebar && !uiStore.sidebarCollapsed"
      class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity md:hidden"
      @click="uiStore.sidebarCollapsed = true"></div>
    <div class="flex flex-1 flex-col overflow-hidden">
      <AppTopbar :breadcrumb="breadcrumb" />
      <main class="flex-1 overflow-y-auto p-4 sm:p-6" :class="{'pb-24': isNative}">
        <slot />
      </main>
    </div>
    <BottomNavigation v-if="isNative" />
  </div>
</template>
