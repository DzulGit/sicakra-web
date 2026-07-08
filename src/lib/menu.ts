import type { Component } from 'vue'
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Wrench,
  Receipt,
  Users,
  Wifi,
  MessageSquareWarning,
  UserCircle,
} from 'lucide-vue-next'
import type { PeranAdmin, TipePengguna } from '@/stores/auth.store'

export interface MenuItem {
  label: string
  to: string
  icon: Component
}

export interface MenuGroup {
  /** Kosongkan kalau grup tidak butuh judul (mis. menu pelanggan yang flat). */
  label?: string
  items: MenuItem[]
}

const menuOperasional: MenuItem[] = [
  { label: 'Permohonan Layanan', to: '/admin/operasional/permohonan-layanan', icon: FileText },
  { label: 'Laporan Kendala', to: '/admin/operasional/laporan-kendala', icon: MessageSquareWarning },
]

const menuTeknisi: MenuItem[] = [
  { label: 'Jadwal Survey', to: '/admin/teknisi/jadwal-survey', icon: Calendar },
  { label: 'Jadwal Pemasangan', to: '/admin/teknisi/jadwal-pemasangan', icon: Wrench },
  { label: 'Laporan Kendala', to: '/admin/teknisi/laporan-kendala', icon: MessageSquareWarning },
]

const menuKeuangan: MenuItem[] = [{ label: 'Tagihan', to: '/admin/keuangan/tagihan', icon: Receipt }]

const menuSuperAdmin: MenuItem[] = [{ label: 'Kelola Admin', to: '/admin/super-admin/admin', icon: Users }]

const menuPelanggan: MenuItem[] = [
  { label: 'Dashboard', to: '/pelanggan/dashboard', icon: LayoutDashboard },
  { label: 'Layanan Saya', to: '/pelanggan/layanan', icon: Wifi },
  { label: 'Tagihan Saya', to: '/pelanggan/tagihan', icon: Receipt },
  { label: 'Laporan Kendala', to: '/pelanggan/laporan-kendala', icon: MessageSquareWarning },
  { label: 'Profil', to: '/pelanggan/profil', icon: UserCircle },
]

/**
 * Sumber kebenaran TUNGGAL untuk isi sidebar. Komponen AppSidebar tidak
 * boleh hardcode menu — semua lewat fungsi ini, supaya nambah/hapus item
 * menu cukup ubah 1 file ini.
 *
 * Super Admin sengaja dapat SEMUA grup (mengikuti backend: middleware
 * `peran:operasional,super_admin` dst selalu menyertakan super_admin —
 * artinya Super Admin memang berhak akses semua area fungsional, bukan
 * cuma Kelola Admin).
 */
export function getMenuGroups(tipe: TipePengguna | null, peran: PeranAdmin | null): MenuGroup[] {
  if (tipe === 'pelanggan') {
    return [{ items: menuPelanggan }]
  }

  if (tipe === 'admin') {
    if (peran === 'super_admin') {
      return [
        { label: 'Operasional', items: menuOperasional },
        { label: 'Teknisi', items: menuTeknisi },
        { label: 'Keuangan', items: menuKeuangan },
        { label: 'Administrasi', items: menuSuperAdmin },
      ]
    }
    if (peran === 'operasional') return [{ items: menuOperasional }]
    if (peran === 'teknisi') return [{ items: menuTeknisi }]
    if (peran === 'keuangan') return [{ items: menuKeuangan }]
  }

  return []
}
