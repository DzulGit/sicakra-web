<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import {
  House,
  Receipt,
  Wifi,
  TriangleAlert,
  UserRound,
} from "lucide-vue-next";

const router = useRouter();
const route = useRoute();

const menus = [
  {
    title: "Dashboard",
    icon: House,
    to: "/pelanggan/dashboard",
  },
  {
    title: "Tagihan",
    icon: Receipt,
    to: "/pelanggan/tagihan",
  },
  {
    title: "Layanan",
    icon: Wifi,
    to: "/pelanggan/layanan",
  },
  {
    title: "Bantuan",
    icon: TriangleAlert,
    to: "/pelanggan/laporan-kendala",
  },
  {
    title: "Profil",
    icon: UserRound,
    to: "/pelanggan/profil",
  },
];

const isActive = (menu: (typeof menus)[number]) => {
  return route.path.startsWith(menu.to);
};
</script>

<template>
  <nav class="fixed bottom-4 left-4 right-4 z-50 rounded-[24px] bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
    <div class="flex h-16 items-center justify-around px-2">
      <template v-for="menu in menus" :key="menu.title">
        <button
          @click="router.push(menu.to)"
          class="flex w-14 flex-col items-center justify-center transition-all duration-300"
        >
          <div
            class="rounded-full p-1.5 transition-all duration-300"
            :class="{
              'bg-emerald-50 text-emerald-600': isActive(menu),
              'text-gray-400': !isActive(menu),
            }"
          >
            <component :is="menu.icon" class="h-5 w-5" />
          </div>

          <span
            class="mt-1 text-[10px] font-medium"
            :class="{
              'text-emerald-600': isActive(menu),
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