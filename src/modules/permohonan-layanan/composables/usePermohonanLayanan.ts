import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import {
  getDaftarTeknisi,
  getPermohonanLayananDetail,
  getPermohonanLayananList,
  jadwalkanKerja,
  verifikasiDanJadwalkan,
  verifikasiPermohonan,
} from '../api/permohonanLayanan.api'
import type { JadwalkanKerjaForm, VerifikasiDanJadwalkanForm, VerifikasiPermohonanForm } from '@/schemas/permohonan-layanan.schema'
import type { PermohonanLayanan } from '@/types/models'
import { jadwalkanSurvey } from '../api/permohonanLayanan.api'

function useFilterParams(forced?: Record<string, string>) {
  const route = useRoute()
  return computed(() => {
    const params: Record<string, string> = { ...forced }
    for (const [key, value] of Object.entries(route.query)) {
      if (typeof value === 'string') params[key] = value
    }
    return params
  })
}

export function usePermohonanLayananList(forcedParams?: Record<string, string>) {
  const params = useFilterParams(forcedParams)

  return useQuery({
    queryKey: ['permohonan-layanan', 'list', params],
    queryFn: () => getPermohonanLayananList(params.value).then((res) => res.data.data),
  })
}

export function usePermohonanLayananDetail(id: MaybeRefOrGetter<number | string>) {
  return useQuery({
    queryKey: ['permohonan-layanan', 'detail', id],
    queryFn: () => getPermohonanLayananDetail(toValue(id)).then((res) => res.data.data),
  })
}

export function useDaftarTeknisi() {
  return useQuery({
    queryKey: ['teknisi', 'daftar'],
    queryFn: () => getDaftarTeknisi().then((res) => res.data.data),
    staleTime: 5 * 60 * 1000,
  })
}

function useInvalidasiPermohonan() {
  const queryClient = useQueryClient()
  return (id: number | string) => {
    queryClient.invalidateQueries({ queryKey: ['permohonan-layanan', 'list'] })
    queryClient.invalidateQueries({ queryKey: ['permohonan-layanan', 'detail', id] })
  }
}

export function useVerifikasiPermohonan() {
  const invalidasi = useInvalidasiPermohonan()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: VerifikasiPermohonanForm }) =>
      verifikasiPermohonan(id, payload),
    onSuccess: (_, { id }) => invalidasi(id),
  })
}

export function useVerifikasiDanJadwalkan() {
  const invalidasi = useInvalidasiPermohonan()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: VerifikasiDanJadwalkanForm }) =>
      verifikasiDanJadwalkan(id, payload),
    onSuccess: (_, { id }) => invalidasi(id),
  })
}

export function useJadwalkanKerja() {
  const invalidasi = useInvalidasiPermohonan()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: JadwalkanKerjaForm }) =>
      jadwalkanKerja(id, payload),
    onSuccess: (_, { id }) => invalidasi(id),
  })
}

export function generateWaMessage(permohonan: PermohonanLayanan): { text: string; waUrl: string } {
  const pelanggan = permohonan.pelanggan
  const namaPelanggan = pelanggan?.nama_lengkap ?? '(nama belum tersedia)'
  const nomorWa = pelanggan?.nomor_hp ?? ''
  const nomorHpBersih = nomorWa.replace(/[^0-9]/g, '')
  const nomorPermohonan = permohonan.nomor_permohonan
  const alamat = `${permohonan.alamat_pemasangan}${permohonan.rt ? `, RT ${permohonan.rt}/RW ${permohonan.rw}` : ''}${permohonan.kode_pos ? `, ${permohonan.kode_pos}` : ''}`
  const jenis = permohonan.jenis_permohonan

  const paketTeks =
    permohonan.tipe_paket === 'reguler'
      ? permohonan.paket_internet?.nama_paket ?? '(paket tidak tersedia)'
      : permohonan.nama_paket_custom ?? '(paket custom)'

  let rincian: string[] = []
  let penutup: string[] = []

  if (jenis === 'ganti_paket') {
    rincian = [
      `📦 *Paket Saat Ini:* ${paketTeks}`,
      `📦 *Paket Baru:* ${permohonan.paket_internet?.nama_paket ?? '(menunggu)'}`,
      `📍 *Alamat:* ${alamat}`,
    ]
    if (permohonan.alasan) rincian.push(`📝 *Alasan:* ${permohonan.alasan}`)
    penutup = [
      'Mohon konfirmasi apakah penggantian paket sudah sesuai.',
      'Setelah konfirmasi, kami akan segera memproses perubahan paket Anda.',
    ]
  } else if (jenis === 'tambah_paket') {
    rincian = [
      `📦 *Paket Tambahan:* ${paketTeks}`,
      `📍 *Alamat Pemasangan:* ${alamat}`,
    ]
    penutup = [
      'Mohon konfirmasi apakah data di atas sudah sesuai.',
      'Apabila sudah benar, kami akan menjadwalkan pemasangan untuk paket tambahan Anda.',
    ]
  } else if (jenis === 'relokasi') {
    rincian = [
      `📦 *Paket Layanan:* ${paketTeks}`,
      `📍 *Alamat Baru:* ${alamat}`,
    ]
    penutup = [
      'Mohon konfirmasi apakah alamat baru sudah sesuai.',
      'Setelah konfirmasi, kami akan menjadwalkan relokasi layanan Anda.',
    ]
  } else {
    rincian = [
      `📦 *Paket Layanan:* ${paketTeks}`,
      `📍 *Alamat Pemasangan:* ${alamat}`,
    ]
    penutup = [
      'Mohon konfirmasi apakah data di atas sudah sesuai.',
      'Apabila data sudah benar, kami ingin mendiskusikan jadwal survey dan pemasangan di lokasi.',
    ]
  }

  const text = [
    `Yth. Bapak/Ibu *${namaPelanggan}*,`,
    '',
    `Perkenalkan kami dari *Tim Operasional Sicakra*. Saat ini kami menerima permohonan dengan nomor *${nomorPermohonan}* atas nama Bapak/Ibu.`,
    '',
    'Berikut rincian permohonan yang kami terima:',
    '',
    ...rincian,
    '',
    ...penutup,
    '',
    'Kami tunggu balasannya, ya.',
    '',
    'Terima kasih.',
    '',
    '*— Tim Operasional Sicakra*',
  ].join('\n')

  const waUrl =
    nomorHpBersih.length > 5
      ? `https://wa.me/62${nomorHpBersih.startsWith('62') ? nomorHpBersih.replace(/^0?62/, '') : nomorHpBersih.startsWith('0') ? nomorHpBersih.slice(1) : nomorHpBersih}?text=${encodeURIComponent(text)}`
      : ''

  return { text, waUrl }
}

export function useJadwalkanSurvey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: any }) =>
      jadwalkanSurvey(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permohonan-layanan'] })
    },
  })
}
