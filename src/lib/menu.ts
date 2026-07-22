import type { Component } from 'vue'
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Receipt,
  Users,
  UsersRound,
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
  label?: string
  items: MenuItem[]
}

const menuOperasional: MenuItem[] = [
  { label: 'Permohonan Layanan', to: '/admin/operasional/permohonan-layanan', icon: FileText },
  { label: 'Laporan Kendala', to: '/admin/operasional/laporan-kendala', icon: MessageSquareWarning },
]

const menuTeknisi: MenuItem[] = [
  { label: 'Jadwal Kerja', to: '/admin/teknisi/jadwal-kerja', icon: Calendar },
  { label: 'Laporan Kendala', to: '/admin/teknisi/laporan-kendala', icon: MessageSquareWarning },
]

const menuKeuangan: MenuItem[] = [{ label: 'Tagihan', to: '/admin/keuangan/tagihan', icon: Receipt }]

const menuSuperAdmin: MenuItem[] = [
  { label: 'Kelola Admin', to: '/admin/super-admin/admin', icon: Users },
  { label: 'Tim Teknisi', to: '/admin/super-admin/tim-teknisi', icon: UsersRound },
]

const menuPelanggan: MenuItem[] = [
  { label: 'Dashboard', to: '/pelanggan/dashboard', icon: LayoutDashboard },
  { label: 'Layanan Saya', to: '/pelanggan/layanan', icon: Wifi },
  { label: 'Tagihan Saya', to: '/pelanggan/tagihan', icon: Receipt },
  { label: 'Laporan Kendala', to: '/pelanggan/laporan-kendala', icon: MessageSquareWarning },
  { label: 'Profil', to: '/pelanggan/profil', icon: UserCircle },
]

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