export interface FilterOption {
  label: string
  value: string
}

export interface FilterFieldConfig {
  /** HARUS sama persis dengan nama query param yang dikenali QueryFilter backend (mis. 'status', 'jenis_permohonan'). */
  key: string
  label: string
  placeholder?: string
  options: FilterOption[]
}
