import { httpClient } from '@/app/providers/httpClient'
import { useAuthStore } from '@/stores/auth.store'

export interface Notifikasi {
  id: string
  title: string
  message: string
  type: string
  action_url: string | null
  read_at: string | null
  created_at: string
}

export interface NotifikasiResponse {
  data: Notifikasi[]
  meta: {
    unread_count: number
  }
}

function basePath() {
  const authStore = useAuthStore()
  return `${authStore.tipePengguna === 'pelanggan' ? '/pelanggan' : '/admin'}/notifikasi`
}

export function getNotifikasiList() {
  return httpClient.get<NotifikasiResponse>(basePath())
}

export function tandaiDibaca(id: string) {
  return httpClient.patch(`${basePath()}/${id}/dibaca`)
}

export function tandaiSemuaDibaca() {
  return httpClient.post(`${basePath()}/dibaca-semua`)
}