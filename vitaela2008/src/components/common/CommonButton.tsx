import { memo, type ReactNode, type MouseEventHandler } from 'react'
import type { VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { Button, type buttonVariants } from '../ui/button'

type ButtonVariant = VariantProps<typeof buttonVariants>['variant']
type ButtonSize = VariantProps<typeof buttonVariants>['size']

interface CommonButtonProps {
  children?: ReactNode
  onClick?: MouseEventHandler<HTMLButtonElement>
  className?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'center' | 'right'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  size?: ButtonSize
  variant?: ButtonVariant
  loading?: boolean
  loadingText?: string
  /** Renders as the single child passed in (e.g. an `<a>`) instead of a `<button>`. Not composable with `icon`/`loading`. */
  asChild?: boolean
}

export default memo(function CommonButton({
  children,
  onClick,
  className = '',
  icon,
  iconPosition = 'left',
  disabled = false,
  type = 'button',
  size,
  variant,
  loading = false,
  loadingText,
  asChild = false,
}: CommonButtonProps) {
  if (asChild) {
    return (
      <Button asChild variant={variant} size={size} className={className}>
        {children}
      </Button>
    )
  }

  return (
    <Button
      onClick={onClick}
      className={`gap-2 ${loading ? 'pointer-events-none opacity-80' : ''} ${className}`}
      disabled={disabled || loading}
      type={type}
      size={size}
      variant={variant}
    >
      {loading && <Loader2 className="animate-spin" size={16} />}
      {!loading && iconPosition === 'center' ? (
        <span>{icon}</span>
      ) : (
        <>
          {!loading && icon && iconPosition === 'left' && <span>{icon}</span>}
          <span>{loading && loadingText ? loadingText : children}</span>
          {!loading && icon && iconPosition === 'right' && <span>{icon}</span>}
        </>
      )}
    </Button>
  )
})
