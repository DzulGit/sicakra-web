<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

defineOptions({ name: 'NetworkSplashScreen' })

const statusMessages = [
  'Mempersiapkan layanan...',
  'Menghubungkan ke jaringan...',
  'Menyinkronkan data perangkat...',
  'Mengamankan koneksi...',
]
const statusIndex = ref(0)
const reduceMotion = ref(false)

let statusTimer: ReturnType<typeof setInterval> | undefined
let motionQuery: MediaQueryList | undefined

function handleMotionChange(e: MediaQueryListEvent) {
  reduceMotion.value = e.matches
}

if (typeof window !== 'undefined') {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduceMotion.value = motionQuery.matches
}

onMounted(() => {
  statusTimer = setInterval(() => {
    statusIndex.value = (statusIndex.value + 1) % statusMessages.length
  }, 900)
  motionQuery?.addEventListener('change', handleMotionChange)
})

onUnmounted(() => {
  if (statusTimer) clearInterval(statusTimer)
  motionQuery?.removeEventListener('change', handleMotionChange)
})
</script>

<template>
  <div
    class="animate-bg-smooth font-body fixed inset-0 z-[9999] flex select-none flex-col items-center justify-center overflow-hidden px-6"
    role="status"
    aria-live="polite"
  >
    <div class="pointer-events-none absolute inset-0">
      <div class="bg-grid absolute inset-0" />
      <div
        class="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-landing-signal/10 blur-[110px] sm:h-[560px] sm:w-[560px]"
      />
      <div class="animate-blob-float absolute -left-24 -top-24 h-72 w-72 rounded-full bg-landing-signal/8 blur-[90px]" />
      <div
        class="animate-blob-float absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-landing-ink/20 blur-[100px]"
        style="animation-delay: 2.4s"
      />
    </div>

    <div class="animate-core-enter relative z-10 flex flex-col items-center">
      <div class="relative flex items-center justify-center">
        <svg viewBox="0 0 300 300" class="absolute h-72 w-72 sm:h-80 sm:w-80 md:h-96 md:w-96" aria-hidden="true">
          <defs>
            <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#e7a93e" stop-opacity="0.8" />
              <stop offset="60%" stop-color="#e7a93e" stop-opacity="0.2" />
              <stop offset="100%" stop-color="#e7a93e" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="meshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#e7a93e" stop-opacity="0.08" />
              <stop offset="50%" stop-color="#e7a93e" stop-opacity="0.4" />
              <stop offset="100%" stop-color="#10201d" stop-opacity="0.2" />
            </linearGradient>
          </defs>

          <circle cx="150" cy="150" r="138" fill="none" stroke="#e7a93e" stroke-opacity="0.12" stroke-width="1" stroke-dasharray="2 11">
            <animateTransform v-if="!reduceMotion" attributeName="transform" type="rotate" from="0 150 150" to="360 150 150" dur="20s" repeatCount="indefinite" />
          </circle>
          <circle cx="150" cy="150" r="122" fill="none" stroke="#e7a93e" stroke-opacity="0.1" stroke-width="1" stroke-dasharray="1 7">
            <animateTransform v-if="!reduceMotion" attributeName="transform" type="rotate" from="360 150 150" to="0 150 150" dur="26s" repeatCount="indefinite" />
          </circle>

          <g class="node-glow">
            <circle cx="150" cy="150" r="20" fill="none" stroke="#e7a93e" stroke-width="1.5" stroke-opacity="0.35">
              <animate v-if="!reduceMotion" attributeName="r" values="20;100;20" dur="3s" begin="0s" repeatCount="indefinite" />
              <animate v-if="!reduceMotion" attributeName="stroke-opacity" values="0.55;0;0.55" dur="3s" begin="0s" repeatCount="indefinite" />
            </circle>
            <circle cx="150" cy="150" r="20" fill="none" stroke="#eef2ef" stroke-width="1.5" stroke-opacity="0.25">
              <animate v-if="!reduceMotion" attributeName="r" values="20;100;20" dur="3s" begin="1s" repeatCount="indefinite" />
              <animate v-if="!reduceMotion" attributeName="stroke-opacity" values="0.45;0;0.45" dur="3s" begin="1s" repeatCount="indefinite" />
            </circle>
            <circle cx="150" cy="150" r="20" fill="none" stroke="#e7a93e" stroke-width="1.5" stroke-opacity="0.35">
              <animate v-if="!reduceMotion" attributeName="r" values="20;100;20" dur="3s" begin="2s" repeatCount="indefinite" />
              <animate v-if="!reduceMotion" attributeName="stroke-opacity" values="0.55;0;0.55" dur="3s" begin="2s" repeatCount="indefinite" />
            </circle>
          </g>

          <polygon points="150,45 241,98 241,202 150,255 59,202 59,98" fill="none" stroke="url(#meshGrad)" stroke-width="1" />

          <g stroke="#e7a93e" stroke-width="1" stroke-opacity="0.25">
            <line x1="150" y1="150" x2="150" y2="45" />
            <line x1="150" y1="150" x2="241" y2="98" />
            <line x1="150" y1="150" x2="241" y2="202" />
            <line x1="150" y1="150" x2="150" y2="255" />
            <line x1="150" y1="150" x2="59" y2="202" />
            <line x1="150" y1="150" x2="59" y2="98" />
          </g>

          <g fill="#e7a93e" class="node-glow">
            <circle cx="150" cy="45" r="5">
              <animate v-if="!reduceMotion" attributeName="r" values="4;6;4" dur="2s" begin="0s" repeatCount="indefinite" />
            </circle>
            <circle cx="241" cy="98" r="5">
              <animate v-if="!reduceMotion" attributeName="r" values="4;6;4" dur="2s" begin="0.33s" repeatCount="indefinite" />
            </circle>
            <circle cx="241" cy="202" r="5">
              <animate v-if="!reduceMotion" attributeName="r" values="4;6;4" dur="2s" begin="0.66s" repeatCount="indefinite" />
            </circle>
            <circle cx="150" cy="255" r="5">
              <animate v-if="!reduceMotion" attributeName="r" values="4;6;4" dur="2s" begin="1s" repeatCount="indefinite" />
            </circle>
            <circle cx="59" cy="202" r="5">
              <animate v-if="!reduceMotion" attributeName="r" values="4;6;4" dur="2s" begin="1.33s" repeatCount="indefinite" />
            </circle>
            <circle cx="59" cy="98" r="5">
              <animate v-if="!reduceMotion" attributeName="r" values="4;6;4" dur="2s" begin="1.66s" repeatCount="indefinite" />
            </circle>
          </g>

          <g v-if="!reduceMotion" fill="#eef2ef">
            <circle r="3.2">
              <animateMotion path="M150,45 L150,150" dur="1.8s" begin="0s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.8;1" dur="1.8s" begin="0s" repeatCount="indefinite" />
            </circle>
            <circle r="3.2">
              <animateMotion path="M150,150 L241,98" dur="1.8s" begin="0.3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.8;1" dur="1.8s" begin="0.3s" repeatCount="indefinite" />
            </circle>
            <circle r="3.2">
              <animateMotion path="M241,202 L150,150" dur="1.8s" begin="0.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.8;1" dur="1.8s" begin="0.6s" repeatCount="indefinite" />
            </circle>
            <circle r="3.2">
              <animateMotion path="M150,150 L150,255" dur="1.8s" begin="0.9s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.8;1" dur="1.8s" begin="0.9s" repeatCount="indefinite" />
            </circle>
            <circle r="3.2">
              <animateMotion path="M59,202 L150,150" dur="1.8s" begin="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.8;1" dur="1.8s" begin="1.2s" repeatCount="indefinite" />
            </circle>
            <circle r="3.2">
              <animateMotion path="M150,150 L59,98" dur="1.8s" begin="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.8;1" dur="1.8s" begin="1.5s" repeatCount="indefinite" />
            </circle>
          </g>

          <circle cx="150" cy="150" r="70" fill="url(#hubGlow)" />
        </svg>

        <div class="flex h-36 w-36 items-center justify-center rounded-full border border-landing-signal/20 bg-landing-ink shadow-[0_0_60px_-8px_rgba(231,169,62,0.3)] backdrop-blur-sm sm:h-40 sm:w-40">
          <img
            src="/sicakra.png"
            alt="Sicakra"
            class="h-24 w-24 object-contain sm:h-28 sm:w-28"
          />
        </div>
      </div>

      <h1
        class="animate-enter font-display mt-20 text-3xl font-bold uppercase tracking-[0.3em] sm:mt-24 sm:text-4xl"
        style="animation-delay: 120ms"
      >
        <span class="brand-gradient-text animate-shine bg-[length:200%_auto] bg-gradient-to-r from-landing-signal via-landing-mist to-landing-signal">
          SICAKRA
        </span>
      </h1>

      <p
        class="animate-enter font-body text-landing-mist/70 mt-3 text-xs tracking-wide sm:text-sm"
        style="animation-delay: 260ms"
      >
        {{ statusMessages[statusIndex] }}
      </p>

      <div
        class="animate-enter relative mt-8 h-[3px] w-48 overflow-hidden rounded-full bg-landing-ink/40 sm:w-64"
        style="animation-delay: 400ms"
      >
        <div class="loading-bar absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-landing-signal to-transparent" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-display {
  font-family: 'Chakra Petch', ui-sans-serif, system-ui, sans-serif;
}
.font-body {
  font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif;
}

.brand-gradient-text {
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}

.bg-grid {
  background-image:
    linear-gradient(rgba(231, 169, 62, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(231, 169, 62, 0.06) 1px, transparent 1px);
  background-size: 44px 44px;
  -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 72%);
  mask-image: radial-gradient(ellipse at center, black 0%, transparent 72%);
}

.node-glow {
  filter: drop-shadow(0 0 6px rgba(231, 169, 62, 0.5));
}

@keyframes bgSmoothChange {
  0%   { background-color: #10201d; }
  50%  { background-color: #0f1d17; }
  100% { background-color: #10201d; }
}

.animate-bg-smooth {
  animation: bgSmoothChange 4s ease-in-out infinite;
}

@keyframes blobFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(24px, -28px) scale(1.08); }
}
.animate-blob-float {
  animation: blobFloat 11s ease-in-out infinite;
}

@keyframes shine {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}
.animate-shine {
  animation: shine 5s ease-in-out infinite alternate;
}

@keyframes loadingSlide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(320%); }
}
.loading-bar {
  animation: loadingSlide 1.5s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}

@keyframes enterUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-enter {
  animation: enterUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes coreEnter {
  from { opacity: 0; transform: scale(0.86); }
  to { opacity: 1; transform: scale(1); }
}
.animate-core-enter {
  animation: coreEnter 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@media (prefers-reduced-motion: reduce) {
  .animate-blob-float,
  .animate-shine,
  .loading-bar,
  .animate-enter,
  .animate-core-enter,
  .animate-bg-smooth {
    animation: none !important;
  }
}
</style>
