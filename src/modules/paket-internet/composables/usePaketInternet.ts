import { useQuery } from '@tanstack/vue-query'
import { getPaketInternetList } from '../api/paketInternet.api'

export function usePaketInternetList() {
  return useQuery({
    queryKey: ['paket-internet', 'publik', 'list'],
    queryFn: () => getPaketInternetList().then((res) => res.data.data),
    staleTime: 10 * 60 * 1000, // katalog paket jarang berubah
  })
}
