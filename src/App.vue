<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { Toaster } from 'vue-sonner'
import LandingLayout from '@/components/layout/LandingLayout.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import SplashLoading from "@/components/loading/SplashLoading.vue";
import { SplashScreen } from "@capacitor/splash-screen";
import { ref, onMounted } from "vue";

const route = useRoute()

useHead({
  title: computed(() => route.meta.judul ?? 'Sicakra'),
  meta: [{ name: 'description', content: 'Sicakra — Layanan internet oleh PT Aqrapana Jaya Mandiri' }],
})

const layoutPerRoute = {
  landing: LandingLayout,
  auth: AuthLayout,
  dashboard: DashboardLayout,
}

const layoutAktif = computed(() => layoutPerRoute[route.meta.layout])



const loading = ref(true);
onMounted(async () => {

  // simulasi startup
  await new Promise(resolve => setTimeout(resolve, 800));

  await SplashScreen.hide();

  loading.value = false;

});
</script>

<template>
  <SplashLoading v-if="loading" />
  <component :is="layoutAktif">
    <RouterView />
  </component>
  <Toaster richColors position="top-right" />
</template>
