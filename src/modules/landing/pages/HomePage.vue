<script setup lang="ts">
import { ArrowRight, ArrowUpRight, MessageCircle } from 'lucide-vue-next'
import StatusStrip from '@/components/landing/StatusStrip.vue'
import heroUtama from '@/assets/landing/hero-utama.png'
import paketRumahan from '@/assets/landing/paket-rumahan.png'
import paketBisnis from '@/assets/landing/paket-bisnis.png'
import tentangKantor from '@/assets/landing/tentang-kantor.png'
import tentangKami from '@/assets/landing/tentang-kami.png'

const langkahPemasangan = [
  {
    nomor: '01',
    judul: 'Daftar',
    deskripsi: 'Isi formulir online — data diri, alamat, dan pilihan paket. Lima menit, selesai.',
  },
  {
    nomor: '02',
    judul: 'Verifikasi',
    deskripsi: 'Tim kami cek kelengkapan data dan jangkauan lokasi kamu, biasanya dalam 1x24 jam.',
  },
  {
    nomor: '03',
    judul: 'Survey & Pemasangan',
    deskripsi: 'Teknisi datang langsung ke lokasi — cek jalur kabel, lalu pasang perangkat.',
  },
  {
    nomor: '04',
    judul: 'Aktif',
    deskripsi: 'Internet langsung menyala. Kamu terima nomor pelanggan untuk akses dashboard.',
  },
]
</script>

<template>
  <div>
    <!-- ============ HERO ============ -->
    <section class="bg-landing-ink text-landing-mist">
      <div class="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
        <div>
          <p class="flex items-center gap-2 font-landing-mono text-xs uppercase tracking-[0.2em] text-landing-signal">
            <span class="inline-block size-1.5 rounded-full bg-landing-signal" />
            Internet Fiber Regional
          </p>
          <h1 class="mt-6 font-display text-4xl leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Koneksi yang <em class="italic text-landing-signal">selalu menyala</em> saat kamu
            membutuhkannya.
          </h1>
          <p class="mt-6 max-w-md text-base text-landing-mist/70">
            Sicakra memasang, menjaga, dan memperbaiki jaringan fiber kamu sendiri — bukan lewat
            call center di kota lain. Kalau mati, kami yang datang.
          </p>
          <div class="mt-8 flex flex-wrap items-center gap-4">
            <RouterLink
              to="/daftar"
              class="inline-flex items-center gap-2 rounded-full bg-landing-signal px-6 py-3 text-sm font-medium text-landing-ink transition-transform hover:-translate-y-0.5"
            >
              Daftar Berlangganan
              <ArrowRight class="size-4" />
            </RouterLink>
            <RouterLink
              to="/paket-internet"
              class="inline-flex items-center gap-2 rounded-full border border-landing-mist/25 px-6 py-3 text-sm font-medium text-landing-mist transition-colors hover:border-landing-mist/60"
            >
              Lihat Paket
            </RouterLink>
          </div>
        </div>

        <div class="relative">
          <div class="absolute -inset-3 -z-10 rounded-2xl border border-landing-signal/30 lg:-inset-5" />
          <img
            :src="heroUtama"
            alt="Teknisi Sicakra memasang jaringan fiber optic"
            class="aspect-[4/3] w-full rounded-2xl object-cover"
          />
        </div>
      </div>
    </section>

    <StatusStrip
      :items="['12 Kecamatan Terhubung', 'Uptime 99.7%', 'Respon Teknisi Kurang Dari 24 Jam']"
    />

    <!-- ============ PAKET ============ -->
    <section class="bg-landing-mist">
      <div class="mx-auto max-w-6xl px-6 py-20">
        <div class="max-w-xl">
          <p class="font-landing-mono text-xs uppercase tracking-[0.2em] text-landing-teal">Paket Internet</p>
          <h2 class="mt-3 font-display text-3xl tracking-tight text-landing-ink sm:text-4xl">
            Pilih sesuai kebutuhan — atau ngobrol dulu sama kami.
          </h2>
        </div>

        <div class="mt-12 grid gap-6 lg:grid-cols-3">
          <!-- Rumahan -->
          <RouterLink
            to="/paket-internet"
            class="group overflow-hidden rounded-2xl bg-landing-paper transition-shadow hover:shadow-xl"
          >
            <div class="aspect-[4/3] overflow-hidden">
              <img
                :src="paketRumahan"
                alt="Internet untuk rumah"
                class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div class="p-6">
              <p class="font-landing-mono text-xs uppercase tracking-wider text-landing-teal">
                20—50 Mbps · Mulai Rp150rb/bln
              </p>
              <h3 class="mt-2 font-display text-2xl text-landing-ink">Rumahan</h3>
              <p class="mt-2 text-sm text-landing-ink/60">
                Streaming, kerja dari rumah, dan gadget sekeluarga — tanpa buffering di jam ramai.
              </p>
              <span class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-landing-ink">
                Lihat Detail
                <ArrowUpRight class="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </RouterLink>

          <!-- Bisnis -->
          <RouterLink
            to="/paket-internet"
            class="group overflow-hidden rounded-2xl bg-landing-paper transition-shadow hover:shadow-xl"
          >
            <div class="aspect-[4/3] overflow-hidden">
              <img
                :src="paketBisnis"
                alt="Internet untuk usaha"
                class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div class="p-6">
              <p class="font-landing-mono text-xs uppercase tracking-wider text-landing-teal">
                50—100 Mbps · Mulai Rp400rb/bln
              </p>
              <h3 class="mt-2 font-display text-2xl text-landing-ink">Bisnis</h3>
              <p class="mt-2 text-sm text-landing-ink/60">
                Untuk toko, kantor kecil, dan co-working — stabil buat transaksi dan video call.
              </p>
              <span class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-landing-ink">
                Lihat Detail
                <ArrowUpRight class="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </RouterLink>

          <!-- Custom — sengaja beda treatment, bukan produk jadi -->
          <RouterLink
            to="/kontak"
            class="group flex flex-col justify-between overflow-hidden rounded-2xl bg-landing-ink p-6 text-landing-mist transition-shadow hover:shadow-xl"
          >
            <div>
              <span class="inline-flex size-10 items-center justify-center rounded-full bg-landing-signal/15">
                <MessageCircle class="size-5 text-landing-signal" />
              </span>
              <p class="mt-4 font-landing-mono text-xs uppercase tracking-wider text-landing-signal">
                Kebutuhan Khusus?
              </p>
              <h3 class="mt-2 font-display text-2xl">Custom</h3>
              <p class="mt-2 text-sm text-landing-mist/60">
                Kecepatan atau instalasi di luar paket standar? Ceritakan kebutuhan kamu, kami hitungkan
                penawarannya langsung.
              </p>
            </div>
            <span class="mt-6 inline-flex items-center gap-1 text-sm font-medium text-landing-signal">
              Konsultasi Gratis
              <ArrowUpRight class="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- ============ PROSES PEMASANGAN ============ -->
    <section class="bg-landing-ink text-landing-mist">
      <div class="mx-auto max-w-6xl px-6 py-20">
        <div class="max-w-xl">
          <p class="font-landing-mono text-xs uppercase tracking-[0.2em] text-landing-signal">Cara Kerja</p>
          <h2 class="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
            Dari daftar sampai menyala, empat langkah.
          </h2>
        </div>

        <ol class="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <li v-for="langkah in langkahPemasangan" :key="langkah.nomor" class="border-t border-landing-mist/15 pt-5">
            <span class="font-landing-mono text-sm text-landing-signal">{{ langkah.nomor }}</span>
            <h3 class="mt-3 font-display text-xl">{{ langkah.judul }}</h3>
            <p class="mt-2 text-sm text-landing-mist/60">{{ langkah.deskripsi }}</p>
          </li>
        </ol>
      </div>
    </section>

    <StatusStrip
      :items="['Proses Rata-Rata 3-5 Hari', 'Tim Lokal, Bukan Call Center Jauh', 'Garansi Pemasangan']"
    />

    <!-- ============ TENTANG KAMI (preview) ============ -->
    <section class="bg-landing-mist">
      <div class="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
        <div class="relative">
          <img
            :src="tentangKantor"
            alt="Kantor Sicakra"
            class="aspect-[4/3] w-full rounded-2xl object-cover"
          />
          <img
            :src="tentangKami"
            alt="Tim Sicakra"
            class="absolute -bottom-8 -right-6 hidden aspect-[4/5] w-40 rounded-xl border-4 border-landing-mist object-cover shadow-lg sm:block lg:w-48"
          />
        </div>

        <div>
          <p class="font-landing-mono text-xs uppercase tracking-[0.2em] text-landing-teal">Tentang Kami</p>
          <blockquote class="mt-4 font-display text-2xl italic leading-snug text-landing-ink sm:text-3xl">
            "Internet yang baik bukan cuma soal angka kecepatan di brosur — tapi soal ada yang bisa
            dihubungi saat koneksi mati jam 11 malam."
          </blockquote>
          <p class="mt-6 font-landing-mono text-xs uppercase tracking-wider text-landing-ink/50">
            Berdiri Sejak 2019 · Melayani 12 Kecamatan · 3.200+ Pelanggan Aktif
          </p>
          <RouterLink
            to="/tentang-kami"
            class="mt-6 inline-flex items-center gap-1 text-sm font-medium text-landing-ink hover:text-landing-teal"
          >
            Kenalan lebih jauh
            <ArrowRight class="size-4" />
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- ============ CTA BAND ============ -->
    <section class="bg-landing-ink text-landing-mist">
      <div class="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 class="font-display text-3xl tracking-tight sm:text-5xl">Siap terhubung?</h2>
        <p class="mx-auto mt-4 max-w-md text-landing-mist/60">
          Daftar hari ini, tim kami hubungi kamu untuk jadwal survey dalam 1x24 jam.
        </p>
        <RouterLink
          to="/daftar"
          class="mt-8 inline-flex items-center gap-2 rounded-full bg-landing-signal px-8 py-3.5 text-sm font-medium text-landing-ink transition-transform hover:-translate-y-0.5"
        >
          Daftar Berlangganan Sekarang
          <ArrowRight class="size-4" />
        </RouterLink>
      </div>
    </section>
  </div>
</template>
