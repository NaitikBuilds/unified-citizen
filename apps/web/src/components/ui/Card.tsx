import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-ucg-fog bg-white shadow-[0_1px_2px_rgba(9,12,18,0.04),0_4px_16px_-4px_rgba(9,12,18,0.08)]',
        className,
      )}
      {...rest}
    />
  )
}

export function CardHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col gap-1 border-b border-ucg-fog px-5 py-4', className)}
      {...rest}
    />
  )
}

export function CardTitle({
  className,
  ...rest
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('font-editorial text-base font-semibold text-ucg-ink', className)}
      {...rest}
    />
  )
}

export function CardDescription({
  className,
  ...rest
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-slate-500', className)} {...rest} />
  )
}

export function CardContent({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4', className)} {...rest} />
}

export function CardFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 border-t border-ucg-fog px-5 py-3',
        className,
      )}
      {...rest}
    />
  )
}

export interface CardSectionProps {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

/** Convenience wrapper: Card with header and content in one. */
export function CardSection({
  title,
  description,
  action,
  children,
  className,
}: CardSectionProps) {
  return (
    <Card className={className}>
      {(title || description || action) && (
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {action}
          </div>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  )
}
