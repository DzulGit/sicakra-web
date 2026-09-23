<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { httpClient } from '@/app/providers/httpClient'
import { toast } from 'vue-sonner'
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
const router = useRouter()

async function akhiriShadow() {
  try {
    await httpClient.post('/reseller/shadow/selesai')
  } catch {
    // Token shadow sudah mati pun tetap lanjut bersihkan sesi lokal.
  }
  authStore.bersihkanSesi()
  toast.info('Shadow diakhiri.')
  try {
    window.close()
  } catch {
    router.push('/reseller/masuk')
  }
}
</script>

<template>
  <SkipToContent />

  <div class="flex h-screen overflow-hidden">
    <AppSidebar v-if="!isNative && !tanpaSidebar" />
    <div v-if="!isNative && !tanpaSidebar && !uiStore.sidebarCollapsed"
      class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity md:hidden"
      @click="uiStore.sidebarCollapsed = true"></div>
    <div class="flex flex-1 flex-col overflow-hidden">

      <!-- Banner peringatan saat admin sedang mengakses portal reseller via shadow -->
      <div v-if="authStore.isShadow"
        class="flex flex-wrap items-center justify-between gap-2 border-b border-yellow-300 bg-yellow-50 px-4 py-2 text-sm text-yellow-900">
        <p class="flex items-center gap-2">
          <span class="rounded bg-yellow-400 px-1.5 py-0.5 text-xs font-bold uppercase text-yellow-950">Shadow</span>
          Anda memasuki portal sebagai <b>{{ authStore.pengguna?.nama_lengkap }}</b>
          (dibuka oleh {{ authStore.shadowAdmin?.nama_lengkap ?? 'admin' }}).
          Seluruh aktivitas Anda di sini tercatat.
        </p>
        <button class="rounded bg-yellow-600 px-3 py-1 font-medium text-white hover:bg-yellow-700"
          @click="akhiriShadow">
          Akhiri Shadow
        </button>
      </div>

      <AppTopbar :breadcrumb="breadcrumb" />
      <main class="flex-1 overflow-y-auto p-4 sm:p-6" :class="{'pb-24': isNative}">
        <slot />
      </main>
    </div>
    <BottomNavigation v-if="isNative" />
  </div>
</template>
