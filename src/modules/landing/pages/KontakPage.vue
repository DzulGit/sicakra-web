<script setup lang="ts">
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-vue-next'

const kanal = [
  {
    icon: MessageCircle,
    judul: 'WhatsApp',
    nilai: '0800-1-SICAKRA',
    deskripsi: 'Respon tercepat untuk pertanyaan paket & kendala teknis.',
    href: 'https://wa.me/6280015555555',
  },
  {
    icon: Mail,
    judul: 'Email',
    nilai: 'halo@sicakra.id',
    deskripsi: 'Untuk kerja sama, pertanyaan formal, atau kebutuhan custom.',
    href: 'mailto:halo@sicakra.id',
  },
  {
    icon: Phone,
    judul: 'Telepon',
    nilai: '(0274) 123-456',
    deskripsi: 'Jam operasional Senin–Sabtu, 08.00–20.00 WIB.',
    href: 'tel:0274123456',
  },
]
</script>

<template>
  <div>
    <!-- ============ HEADER ============ -->
    <section class="bg-landing-ink text-landing-mist">
      <div class="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <p class="font-landing-mono text-xs uppercase tracking-[0.2em] text-landing-signal">Kontak</p>
        <h1 class="mt-3 max-w-xl font-display text-4xl tracking-tight sm:text-5xl">
          Ada pertanyaan? Kami di sini, bukan di kota lain.
        </h1>
      </div>
    </section>

    <!-- ============ KANAL KONTAK ============ -->
    <section class="bg-landing-mist">
      <div class="mx-auto max-w-6xl px-6 py-16">
        <div class="grid gap-6 sm:grid-cols-3">
          <a
            v-for="item in kanal"
            :key="item.judul"
            :href="item.href"
            target="_blank"
            rel="noopener noreferrer"
            class="group rounded-2xl bg-landing-paper p-6 transition-shadow hover:shadow-xl"
          >
            <span class="inline-flex size-11 items-center justify-center rounded-full bg-landing-teal/10">
              <component :is="item.icon" class="size-5 text-landing-teal" />
            </span>
            <p class="mt-4 font-landing-mono text-xs uppercase tracking-wider text-landing-ink/50">
              {{ item.judul }}
            </p>
            <p class="mt-1 font-display text-xl text-landing-ink">{{ item.nilai }}</p>
            <p class="mt-2 text-sm text-landing-ink/60">{{ item.deskripsi }}</p>
          </a>
        </div>

        <div class="mt-12 flex items-start gap-4 rounded-2xl bg-landing-paper p-6">
          <span class="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-landing-teal/10">
            <MapPin class="size-5 text-landing-teal" />
          </span>
          <div>
            <p class="font-landing-mono text-xs uppercase tracking-wider text-landing-ink/50">Kantor Pusat</p>
            <p class="mt-1 text-sm text-landing-ink/80">
              Jl. Raya Contoh No. 88, Kecamatan Sicakra, Kabupaten Contoh, 55000
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
