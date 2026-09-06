<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useRoute } from 'vue-router'
import { computed, ref, onMounted } from 'vue'
import { Toaster } from '@/components/ui/sonner'
import LandingLayout from '@/components/layout/LandingLayout.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import SplashLoading from "@/components/loading/SplashLoading.vue";
import { SplashScreen } from "@capacitor/splash-screen";

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
  await new Promise(resolve => setTimeout(resolve, 1500));
  await SplashScreen.hide();
  loading.value = false;
});
</script>

<template>
  <Transition name="splash">
    <SplashLoading v-if="loading" />
  </Transition>
  <Transition name="content" appear>
    <component v-if="!loading" :is="layoutAktif">
      <RouterView />
    </component>
  </Transition>
  <Toaster position="top-center" richColors />
</template>

<style>
.splash-leave-active {
  animation: splashExit 0.7s ease-in-out forwards;
}
.splash-leave-to {
  opacity: 0;
}

.content-enter-active {
  transition: opacity 0.6s ease 0.1s;
}
.content-enter-to {
  opacity: 1;
}
.content-enter-from {
  opacity: 0;
}

@keyframes splashExit {
  0%   { transform: scale(1); opacity: 1; }
  40%  { transform: scale(1.06); opacity: 1; }
  65%  { transform: scale(0.94); opacity: 0.85; }
  100% { transform: scale(1); opacity: 0; }
}
</style>
