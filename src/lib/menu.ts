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
  Globe,
  UserCircle,
  Contact,
  Wallet,
  Bell,
  ClipboardCheck,
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
  { label: 'Overview', to: '/admin/operasional/overview', icon: LayoutDashboard },
  { label: 'Permohonan Layanan', to: '/admin/operasional/permohonan-layanan', icon: FileText },
  { label: 'Pelanggan', to: '/admin/operasional/pelanggan', icon: Contact },
  { label: 'Paket Internet', to: '/admin/operasional/paket-internet', icon: Globe },
  { label: 'Laporan Kendala', to: '/admin/operasional/laporan-kendala', icon: MessageSquareWarning },
  { label: 'Tim Teknisi', to: '/admin/operasional/tim-teknisi', icon: UsersRound },
  { label: 'Notifikasi', to: '/admin/notifikasi', icon: Bell },
]

const menuTeknisi: MenuItem[] = [
  { label: 'Overview', to: '/admin/teknisi/overview', icon: LayoutDashboard },
  { label: 'Jadwal Kerja', to: '/admin/teknisi/jadwal-kerja', icon: Calendar },
  { label: 'Laporan Kendala', to: '/admin/teknisi/laporan-kendala', icon: MessageSquareWarning },
  { label: 'Notifikasi', to: '/admin/notifikasi', icon: Bell },
  { label: 'Antrean Pengecekan', to: '/admin/teknisi/antrean-pengecekan', icon: ClipboardCheck }
]

const menuKeuangan: MenuItem[] = [
  { label: 'Overview', to: '/admin/keuangan/overview', icon: LayoutDashboard },
  { label: 'Tagihan', to: '/admin/keuangan/tagihan', icon: Receipt },
  { label: 'Pendapatan', to: '/admin/keuangan/pendapatan', icon: Wallet },
  { label: 'Pelanggan', to: '/admin/operasional/pelanggan', icon: Contact },
  { label: 'Notifikasi', to: '/admin/notifikasi', icon: Bell },
]

const menuSuperAdmin: MenuItem[] = [
  { label: 'Kelola Admin', to: '/admin/super-admin/admin', icon: Users },
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
      return [{ label: 'Administrasi', items: menuSuperAdmin }]
    }
    if (peran === 'operasional') return [{ items: menuOperasional }]
    if (peran === 'teknisi') return [{ items: menuTeknisi }]
    if (peran === 'keuangan') return [{ items: menuKeuangan }]
  }

  return []
}