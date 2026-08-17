import { Landmark } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ucg-ink text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-ucg-blue">
              <Landmark className="size-4 text-white" aria-hidden="true" />
            </span>
            <span className="font-editorial text-base font-semibold text-ucg-white">
              Unified Citizen
            </span>
          </div>
          <p className="label-mono-sm text-slate-500">
            CITIZEN · CITY · GOVERNMENT · RESOLUTION
          </p>
        </div>
        <div className="flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Connecting citizens with their government through transparent grievance management.</p>
          <p>© {new Date().getFullYear()} City Governance Portal</p>
        </div>
      </div>
    </footer>
  )
}
