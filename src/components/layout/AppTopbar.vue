<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Menu, LogOut, UserCircle, ChevronDown } from 'lucide-vue-next'
import { useUiStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/auth.store'
import { useLogoutAdmin } from '@/modules/auth/admin/composables/useAdminAuth'
import { useLogoutPelanggan } from '@/modules/auth/pelanggan/composables/usePelangganAuth'
import NotificationBell from '@/modules/notifikasi/components/NotificationBell.vue'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu' // <-- Pake jalur lokal lagi
import AppBreadcrumb, { type BreadcrumbItem } from './AppBreadcrumb.vue'
import { usePlatform } from '@/composables/usePlatform'

defineProps<{ breadcrumb: BreadcrumbItem[] }>()

const authStore = useAuthStore()
const uiStore = useUiStore()
const router = useRouter()
const { mutate: logoutAdmin } = useLogoutAdmin()
const { mutate: logoutPelanggan } = useLogoutPelanggan()
const { isNative } = usePlatform()

function inisial(nama: string) {
  return nama
    .split(' ')
    .map((kata) => kata[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function getFotoUrl(foto?: string | null) {
  if (!foto) return ''
  return foto.startsWith('http')
    ? foto
    : `https://hrwyxwwtbpmtrxhdlvud.supabase.co/storage/v1/object/public/wifi-storage/${foto}`
}

function logout() {
  const tipe = authStore.tipePengguna
  const mutasiLogout = tipe === 'pelanggan' ? logoutPelanggan : logoutAdmin

  // Bersihkan sesi lokal & redirect SEGERA (jangan tunggu response server) —
  // pengalaman logout harus terasa instan. Kalau call API gagal (mis. token
  // sudah invalid duluan), tidak masalah, tujuan akhirnya sama: keluar.
  mutasiLogout(undefined, { onSettled: () => { } })
  authStore.bersihkanSesi()
  router.push(tipe === 'pelanggan' ? '/pelanggan/masuk' : '/admin/masuk')
}

function bukaProfil() {
  if (isNative && authStore.tipePengguna === 'pelanggan') {
    router.push('/pelanggan/profil')
  }
}
</script>

<template>
  <header class="flex h-14 items-center justify-between border-b bg-background px-4">
    <div class="flex items-center gap-2">
      <Button v-if="!isNative" variant="ghost" size="icon" class="md:hidden mr-1" @click="uiStore.toggleSidebar">
        <Menu class="size-5" />
      </Button>
      <AppBreadcrumb :items="breadcrumb" />
    </div>

    <div class="flex items-center gap-2">
      <NotificationBell />

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button type="button" class="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent" @click="bukaProfil">
            <Avatar class="size-8 overflow-hidden">
              <img v-if="authStore.pengguna?.foto_profil" :src="getFotoUrl(authStore.pengguna.foto_profil)"
                alt="Foto Profil" class="h-full w-full object-cover" />
              <AvatarFallback v-else>{{
                inisial(authStore.pengguna?.nama_lengkap ?? '?')
                }}</AvatarFallback>
            </Avatar>
            <span class="text-sm font-medium hidden md:inline-block">
              {{ authStore.pengguna?.nama_lengkap }}
            </span>
            <ChevronDown class="size-4 text-muted-foreground hidden md:inline-block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-56">
          <DropdownMenuLabel>
            <p class="truncate font-medium">{{ authStore.pengguna?.nama_lengkap }}</p>
            <p class="truncate text-xs font-normal text-muted-foreground">
              {{ authStore.peranAdmin ?? 'Pelanggan' }}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem v-if="authStore.tipePengguna === 'pelanggan'" as-child>
            <RouterLink to="/pelanggan/profil">
              <UserCircle class="size-4" />
              Profil Saya
            </RouterLink>
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" @click="logout">
            <LogOut class="size-4" />
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
</template>
