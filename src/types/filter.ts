export interface FilterOption {
  label: string
  value: string
}

export interface FilterFieldConfig {
  key: string
  label: string
  placeholder?: string
  options: FilterOption[]
}