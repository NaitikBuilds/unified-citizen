export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-center text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left">
        <p>Unified Citizen Governance — connecting citizens with their government.</p>
        <p>© {new Date().getFullYear()} City Governance Portal</p>
      </div>
    </footer>
  )
}
