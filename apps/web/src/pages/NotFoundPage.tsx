import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Card, CardContent } from '../components/ui'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <Card>
        <CardContent className="flex flex-col items-center py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-slate-100">
            <Compass className="size-6 text-slate-400" aria-hidden="true" />
          </span>
          <p className="mt-4 text-4xl font-bold text-slate-900">404</p>
          <h1 className="mt-1 text-lg font-semibold text-slate-900">Page not found</h1>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Back to home
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
