// Pemformatan Rupiah terpusat — satu implementasi, dipakai semua nominal.
// (Sebelumnya formatRupiah dipalu salinan-demi-salinan di ~17 komponen.)

const FORMATTER_IDR = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

export function formatRupiah(nilai: string | number | null | undefined): string {
  const n = Number(nilai ?? 0)
  if (!Number.isFinite(n)) return FORMATTER_IDR.format(0)
  return FORMATTER_IDR.format(n)
}

// Rupiah bertanda untuk selisih/sisa: -Rp150.000 / +Rp50.000 / Rp0.
export function formatRupiahBertanda(nilai: string | number | null | undefined): string {
  const n = Number(nilai ?? 0)
  if (!Number.isFinite(n)) return FORMATTER_IDR.format(0)
  if (n < 0) return `-${FORMATTER_IDR.format(Math.abs(n))}`
  if (n > 0) return `+${FORMATTER_IDR.format(n)}`
  return FORMATTER_IDR.format(0)
}

export function formatAngka(nilai: string | number | null | undefined): string {
  const n = Number(nilai ?? 0)
  if (!Number.isFinite(n)) return '0'
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(n)
}

// Ubah teks input Rupiah (boleh berisi 'Rp', '.', spasi) menjadi angka bulat.
export function parseRupiah(teks: string): number {
  const digit = teks.replace(/\D/g, '')
  return digit === '' ? 0 : Number(digit)
}