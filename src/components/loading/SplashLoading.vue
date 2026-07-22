<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isLoading = ref(true)

// Optional: Auto dismiss (sesuaikan dengan logic aplikasi kamu)
onMounted(() => {
  setTimeout(() => { isLoading.value = false }, 9999900000)
})

onUnmounted(() => {
  // cleanup
})
</script>

<template>
  <div 
    v-if="isLoading"
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950 overflow-hidden"
  >
    <!-- Background grid -->
    <div class="absolute inset-0 bg-[radial-gradient(#334155_0.8px,transparent_1px)] [background-size:30px_30px] opacity-40"></div>
    
    <!-- Ambient glow -->
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="w-[620px] h-[620px] bg-cyan-500/10 rounded-full blur-[130px]"></div>
    </div>

    <div class="relative flex flex-col items-center z-10 px-6 text-center">
      <!-- Logo -->
      <div class="relative mb-8">
        <img 
          src="/logo-sicakra.png" 
          class="w-28 md:w-32 drop-shadow-[0_0_35px_rgb(103,232,249)]" 
          alt="Sicakra" 
        />
        <div class="absolute inset-0 -m-10 rounded-full border border-cyan-400/20 animate-[ping_3s_ease-in-out_infinite]"></div>
      </div>

      <!-- Title -->
      <h1 class="text-5xl md:text-6xl font-bold tracking-[0.5em] bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent mb-3">
        SICAKRA
      </h1>

      <p class="text-sky-400/80 text-lg md:text-xl tracking-widest font-light mb-10">
        Mempersiapkan layanan...
      </p>

      <!-- Enhanced Network Animation -->
      <div class="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center">
        <svg width="340" height="340" viewBox="0 0 340 340" class="drop-shadow-2xl" aria-hidden="true">
          <!-- Connection Lines -->
          <g class="stroke-sky-400/50" stroke-width="1.5" fill="none">
            <line x1="70" y1="100" x2="170" y2="65" stroke-dasharray="10 6" class="animate-[dash_2.8s_linear_infinite]" />
            <line x1="170" y1="65" x2="270" y2="110" stroke-dasharray="10 6" class="animate-[dash_2.8s_linear_infinite]" style="animation-delay: 0.4s" />
            <line x1="80" y1="230" x2="175" y2="185" stroke-dasharray="12 7" class="animate-[dash_3.2s_linear_infinite]" style="animation-delay: 0.9s" />
            <line x1="175" y1="185" x2="260" y2="245" stroke-dasharray="10 6" class="animate-[dash_2.5s_linear_infinite]" style="animation-delay: 1.6s" />
            <line x1="95" y1="130" x2="245" y2="210" stroke-dasharray="14 8" class="animate-[dash_4s_linear_infinite]" style="animation-delay: 0.7s" />
          </g>

          <!-- Central Node -->
          <g>
            <circle cx="170" cy="165" r="26" class="fill-slate-950 stroke-cyan-400 stroke-[7] animate-[pulse_1.8s_ease-in-out_infinite]" />
            <circle cx="170" cy="165" r="14" class="fill-cyan-400 animate-[ping_2.2s_ease-in-out_infinite]" />
          </g>

          <!-- Peripheral Nodes -->
          <circle cx="70" cy="100" r="10" class="fill-slate-900 stroke-sky-300 stroke-2 animate-pulse" style="animation-delay: 0.1s" />
          <circle cx="270" cy="110" r="10" class="fill-slate-900 stroke-sky-300 stroke-2 animate-pulse" style="animation-delay: 0.6s" />
          <circle cx="80" cy="230" r="10" class="fill-slate-900 stroke-sky-300 stroke-2 animate-pulse" style="animation-delay: 1.1s" />
          <circle cx="260" cy="245" r="10" class="fill-slate-900 stroke-sky-300 stroke-2 animate-pulse" style="animation-delay: 1.7s" />
          <circle cx="100" cy="70" r="8" class="fill-slate-900 stroke-cyan-400 stroke-2 animate-pulse" style="animation-delay: 0.3s" />
          <circle cx="250" cy="260" r="8" class="fill-slate-900 stroke-cyan-400 stroke-2 animate-pulse" style="animation-delay: 1.4s" />
          <circle cx="200" cy="55" r="9" class="fill-slate-900 stroke-sky-400 stroke-2 animate-pulse" style="animation-delay: 0.8s" />
          <circle cx="120" cy="270" r="8" class="fill-slate-900 stroke-cyan-300 stroke-2 animate-pulse" style="animation-delay: 2s" />

          <!-- More Dynamic Data Packets -->
          <circle cx="70" cy="100" r="3.5" fill="#67e8f9" class="animate-[movePacket1_2.4s_linear_infinite]" />
          <circle cx="170" cy="65" r="3" fill="#22d3ee" class="animate-[movePacket2_2.1s_linear_infinite]" />
          <circle cx="270" cy="110" r="3.5" fill="#67e8f9" class="animate-[movePacket3_2.7s_linear_infinite]" />
          <circle cx="80" cy="230" r="3" fill="#22d3ee" class="animate-[movePacket4_2.9s_linear_infinite]" />
          <circle cx="170" cy="165" r="2.5" fill="#a5f3fc" class="animate-[orbitCenter_3s_linear_infinite]" />
        </svg>
      </div>

      <!-- Status -->
      <div class="mt-8 flex items-center gap-3 text-xs uppercase tracking-[0.125em] text-sky-500/70 font-mono">
        <div class="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
        <span>SYNCING NODES • ENCRYPTING CHANNEL</span>
      </div>
    </div>

    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 font-mono tracking-widest">
      SICAKRA NETWORK • INITIALIZING
    </div>
  </div>
</template>

<style scoped>
@keyframes dash {
  to { stroke-dashoffset: -36; }
}

@keyframes movePacket1 {
  0% { transform: translate(0, 0); }
  100% { transform: translate(100px, -35px); }
}

@keyframes movePacket2 {
  0% { transform: translate(0, 0); }
  100% { transform: translate(100px, 45px); }
}

@keyframes movePacket3 {
  0% { transform: translate(0, 0); }
  100% { transform: translate(-100px, 135px); }
}

@keyframes movePacket4 {
  0% { transform: translate(0, 0); }
  100% { transform: translate(160px, -40px); }
}

/* Small orbit around center */
@keyframes orbitCenter {
  0% { transform: rotate(0deg) translate(28px) rotate(0deg); }
  100% { transform: rotate(360deg) translate(28px) rotate(-360deg); }
}
</style>