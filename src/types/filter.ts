export interface FilterOption {
  label: string
  value: string
}

export interface FilterFieldConfig {
  key: string
  label: string
  placeholder?: string
  /** 'select' (default) menampilkan dropdown, 'text' menampilkan input pencarian. */
  type?: 'select' | 'text'
  options?: FilterOption[]
}