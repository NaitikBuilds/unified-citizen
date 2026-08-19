import { Outlet, Link } from "react-router-dom";
import {
  Brain,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

export default function AuthLayout() {
  return (
    <div className="min-h-screen text-white font-sans selection:bg-white selection:text-black flex flex-col justify-between relative overflow-x-hidden antialiased" style={{ background: '#000' }}>
      {/* Full-page fixed grid overlay */}
      <div className="page-grid-bg" />

      {/* Background grid pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true" />

      {/* Top Bar with Home navigation */}
      <header className="relative z-20 px-6 py-5 max-w-7xl w-full mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold hover:text-white transition px-3 py-1.5 rounded-full"
          style={{ color: '#888', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-medium" style={{ color: '#666' }}>Governance Portal Online</span>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Form Outlet */}
          <div className="lg:col-span-7">
            <Outlet />
          </div>

          {/* Right Column: CodeSarthi Brand Showcase Card */}
          <div className="lg:col-span-5 hidden lg:flex flex-col gap-4">
            {/* Top Brand Hero Card */}
            <div
              className="p-7 rounded-3xl shadow-2xl relative overflow-hidden transition duration-300"
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
            >
              {/* Corner crosshairs like CodeSarthi */}
              <div className="absolute top-3 left-3 text-white/20 text-xs font-mono select-none">+</div>
              <div className="absolute top-3 right-3 text-white/20 text-xs font-mono select-none">+</div>
              <div className="absolute bottom-3 left-3 text-white/20 text-xs font-mono select-none">+</div>
              <div className="absolute bottom-3 right-3 text-white/20 text-xs font-mono select-none">+</div>

              {/* CIVIX Circular Logo Emblem */}
              <div className="w-full py-8 flex items-center justify-center">
                <div className="relative w-36 h-36 rounded-full flex items-center justify-center shadow-xl overflow-hidden" style={{ background: '#1a1a1a', border: '2px solid rgba(255,255,255,0.15)' }}>
                  <img src="/civix-logo.png" alt="CIVIX" className="w-full h-full object-cover rounded-full" />
                </div>
              </div>

              {/* Brand Title */}
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                CIVIX
              </h2>

              <div className="mt-5 grid grid-cols-2 gap-3 text-xs" style={{ color: '#aaa' }}>
                {["Submit. Track. Resolve.", "Empowering Citizens.", "Real-Time SLA Engine.", "Public Transparency."].map(t => (
                  <div key={t} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#555' }} />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Spotlight Mini Cards */}
            <div className="space-y-3">
              {[
                { Icon: Clock, title: "Real-Time SLA & Escalation Layer", desc: "Automated tracking, alerts, and escalation in one space" },
                { Icon: Brain, title: "AI-Powered Grievance Classifier", desc: "Neural triage, urgency scoring, and smart routing" },
                { Icon: CheckCircle2, title: "Verified Field Resolution Proof", desc: "Geotagged photographic proof before closure" },
              ].map(({ Icon, title, desc }) => (
                <div
                  key={title}
                  className="p-4 rounded-2xl flex items-center justify-between group transition"
                  style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <Icon className="w-5 h-5" style={{ color: '#aaa' }} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{title}</h4>
                      <p className="text-[11px]" style={{ color: '#555' }}>{desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" style={{ color: '#444' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 py-5 px-6 max-w-7xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: '#444', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span>© 2026 – CIVIX Governance Platform</span>
        <div className="flex gap-6">
          <Link to="/" className="hover:text-white transition">Privacy Policy</Link>
          <Link to="/" className="hover:text-white transition">Terms of Governance</Link>
          <Link to="/" className="hover:text-white transition">Help Desk</Link>
        </div>
      </footer>
    </div>
  );
}
