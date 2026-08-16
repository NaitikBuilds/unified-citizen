import { Spinner } from './Spinner'

export interface PageLoaderProps {
  label?: string
}

export function PageLoader({ label = 'Loading…' }: PageLoaderProps) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner size="lg" label={label} />
    </div>
  )
}
