<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Bell, LogOut, UserCircle } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'
import { useLogoutAdmin } from '@/modules/auth/admin/composables/useAdminAuth'
import { useLogoutPelanggan } from '@/modules/auth/pelanggan/composables/usePelangganAuth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import AppBreadcrumb, { type BreadcrumbItem } from './AppBreadcrumb.vue'
import { usePlatform } from '@/composables/usePlatform'

defineProps<{ breadcrumb: BreadcrumbItem[] }>()

const authStore = useAuthStore()
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

function logout() {
  const tipe = authStore.tipePengguna
  const mutasiLogout = tipe === 'pelanggan' ? logoutPelanggan : logoutAdmin

  // Bersihkan sesi lokal & redirect SEGERA (jangan tunggu response server) —
  // pengalaman logout harus terasa instan. Kalau call API gagal (mis. token
  // sudah invalid duluan), tidak masalah, tujuan akhirnya sama: keluar.
  mutasiLogout(undefined, { onSettled: () => {} })
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
    <AppBreadcrumb :items="breadcrumb" />

    <div class="flex items-center gap-2">
      <Button variant="ghost" size="icon" aria-label="Notifikasi">
        <Bell class="size-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger as-child :disabled="isNative && authStore.tipePengguna === 'pelanggan'">
          <button type="button" class="flex items-center gap-2 rounded-md p-1 hover:bg-accent" @click="bukaProfil">
            <Avatar class="size-8">
              <AvatarFallback>{{
                inisial(authStore.pengguna?.nama_lengkap ?? '?')
              }}</AvatarFallback>
            </Avatar>
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
