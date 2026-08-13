import { z } from 'zod'

/**
 * Terjemahan default Zod (bahasa Inggris) ke bahasa Indonesia baku.
 * Berlaku hanya untuk rule yang TIDAK punya message eksplisit — message
 * custom dari schema tetap menang.
 */
export function pasangZodErrorMap() {
  z.setErrorMap((issue, ctx) => {
    const minimal = (issue as any).minimum
    const maksimal = (issue as any).maximum
    const tipe = (issue as any).type
    const fallback = issue.message || ctx.defaultError

    switch (issue.code) {
      case 'invalid_type':
        if (issue.received === 'undefined') return { message: 'Wajib diisi' }
        if (issue.expected === 'string') return { message: 'Harus berupa teks' }
        if (issue.expected === 'number' || issue.expected === 'integer') {
          return { message: 'Harus berupa angka bulat' }
        }
        return { message: 'Format data tidak sesuai' }

      case 'invalid_string':
        return { message: issue.validation === 'email' ? 'Format email tidak valid' : 'Format tidak valid' }

      case 'too_small':
        switch (tipe) {
          case 'string': return { message: minimal === 1 ? 'Wajib diisi' : `Minimal ${minimal} karakter` }
          case 'number': return { message: `Minimal ${minimal}` }
          case 'array': return { message: `Pilih minimal ${minimal} item` }
          default: return { message: fallback }
        }

      case 'too_big':
        switch (tipe) {
          case 'string': return { message: `Maksimal ${maksimal} karakter` }
          case 'number': return { message: `Maksimal ${maksimal}` }
          case 'array': return { message: `Maksimal ${maksimal} item` }
          default: return { message: fallback }
        }

      case 'invalid_enum_value': return { message: 'Pilihan tidak valid' }
      case 'invalid_date': return { message: 'Tanggal tidak valid' }
      case 'invalid_literal': return { message: 'Nilai tidak sesuai' }
      case 'not_multiple_of': return { message: `Nilai harus kelipatan ${issue.multipleOf}` }
      default: return { message: fallback }
    }
  })
}