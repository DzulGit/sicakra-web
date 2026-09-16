import { httpClient } from '@/app/providers/httpClient'
import type { ApiResponse } from '@/types/api'
import type { SaldoKreditInfo } from '@/types/models'

/**
 * Api saldo kredit (deposit) lintas scope. `base` menentukan portal:
 * admin keuangan = '/admin/keuangan', portal reseller = '/reseller'.
 * Kontrak backend identik (PembayaranController + ResellerPembayaranController,
 * keduanya hanya menyisakan endpoint saldo-kredit/{pelanggan}).
 */
export function buatSaldoKreditApi(base: string) {
  return {
    saldoKredit(pelangganId: number | string) {
      return httpClient.get<ApiResponse<SaldoKreditInfo>>(`${base}/saldo-kredit/${pelangganId}`)
    },
  }
}

export const saldoKreditAdminApi = buatSaldoKreditApi('/admin/keuangan')
export const saldoKreditResellerApi = buatSaldoKreditApi('/reseller')