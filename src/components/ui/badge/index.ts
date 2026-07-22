import { cva, type VariantProps } from 'class-variance-authority'

export { default as Badge } from './Badge.vue'

/**
 * Varian warna dirancang mengikuti sistem status backend — lihat
 * docs/frontend/design-system/enums-and-status.md untuk mapping lengkap
 * tiap value enum ke varian ini. JANGAN pakai warna custom di luar varian
 * ini untuk badge status, supaya makna warna konsisten di seluruh app.
 */
export const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap gap-1',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-input text-foreground',
        destructive: 'border-transparent bg-destructive text-white',
        success: 'border-transparent bg-success text-success-foreground',
        warning: 'border-transparent bg-warning text-warning-foreground',
        info: 'border-transparent bg-info text-info-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type BadgeVariants = VariantProps<typeof badgeVariants>
