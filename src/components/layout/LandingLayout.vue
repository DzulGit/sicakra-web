<script setup lang="ts">
import LandingNavbar from './LandingNavbar.vue'
import LandingFooter from './LandingFooter.vue'
import SkipToContent from '@/components/feedback/SkipToContent.vue'
</script>

<template>
  <SkipToContent />
  <div class="flex min-h-screen flex-col">
    <LandingNavbar />
    <main id="konten-utama" class="flex-1">
      <slot />
    </main>
    <LandingFooter />
  </div>
</template>
