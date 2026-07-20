<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import {
  House,
  Receipt,
  Wallet,
  TriangleAlert,
  UserRound,
} from "lucide-vue-next";

const router = useRouter();
const route = useRoute();

const menus = [
  {
    title: "Home",
    icon: House,
    to: "/pelanggan/dashboard",
  },
  {
    title: "Riwayat",
    icon: Receipt,
    to: "/pelanggan/tagihan",
  },
  {
    title: "Bayar",
    icon: Wallet,
    to: "/pelanggan/tagihan",
    center: true,
  },
  {
    title: "Bantuan",
    icon: TriangleAlert,
    to: "/pelanggan/laporan-kendala",
  },
  {
    title: "Akun",
    icon: UserRound,
    to: "/pelanggan/profil",
  },
];

const isActive = (menu: (typeof menus)[number]) => {
  return route.path.startsWith(menu.to);
};
</script>

<template>
  <nav
    class="fixed bottom-4 left-4 right-4 z-50 rounded-[28px] bg-white shadow-[0_10px_35px_rgba(0,0,0,.15)]"
  >
    <div class="flex h-20 items-center justify-between px-2">

      <template v-for="menu in menus" :key="menu.title">

        <!-- Tombol Tengah -->
        <button
          v-if="menu.center"
          @click="router.push(menu.to)"
          class="relative -mt-10 flex w-20 flex-col items-center"
        >
          <div
            class="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <component
              :is="menu.icon"
              class="h-7 w-7 text-white"
            />
          </div>

          <span
            class="mt-2 text-xs font-medium text-blue-600"
          >
            {{ menu.title }}
          </span>
        </button>

        <!-- Tombol Biasa -->
        <button
          v-else
          @click="router.push(menu.to)"
          class="flex w-16 flex-col items-center justify-center transition-all duration-300"
        >
          <div
            class="rounded-full p-2 transition-all duration-300"
            :class="{
              'bg-blue-50 text-blue-600': isActive(menu),
              'text-gray-400': !isActive(menu),
            }"
          >
            <component
              :is="menu.icon"
              class="h-6 w-6"
            />
          </div>

          <span
            class="mt-1 text-[11px] font-medium"
            :class="{
              'text-blue-600': isActive(menu),
              'text-gray-500': !isActive(menu),
            }"
          >
            {{ menu.title }}
          </span>
        </button>

      </template>

    </div>
  </nav>
</template>