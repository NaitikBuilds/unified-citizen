import { cn } from '../../utils/cn'
import { Reveal } from './Reveal'

export interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}

/** Consistent editorial section heading used across public inner pages. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: SectionHeaderProps) {
  const centered = align === 'center'
  return (
    <Reveal className={className}>
      <div className={cn('section-head', centered && 'is-centered')}>
        {eyebrow && (
          <p className={cn('eyebrow text-ucg-blue', centered && 'justify-center')}>
            {eyebrow}
          </p>
        )}
        <h2>{title}</h2>
        {description && <p className="section-desc">{description}</p>}
      </div>
    </Reveal>
  )
}
