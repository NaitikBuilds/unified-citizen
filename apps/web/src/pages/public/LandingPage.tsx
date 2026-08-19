import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  Shield,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ArrowRight,
  BarChart3,
  Users,
  MapPin,
  FileCheck,
  Building2,
  Activity,
} from "lucide-react";
import Logo from "../../components/Logo";

export default function LandingPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const workflowSteps = [
    {
      step: "01",
      title: "Citizen Submits Grievance",
      badge: "Citizen Portal",
      desc: "Citizens submit grievances via web, mobile, or 24/7 AI chat with photo attachments and automatic GPS location tagging.",
      details: [
        "AI-assisted natural language description",
        "Geotagged location pin & photo evidence",
        "Instant unique tracking ID generated",
      ],
      mockupData: {
        id: "GRV-2026-8942",
        category: "Water Supply & Drainage",
        status: "Submitted",
        time: "Just now",
        location: "Ward 12, Sector 4, Civic Center",
      },
    },
    {
      step: "02",
      title: "AI Neural Triaging & Routing",
      badge: "AI Engine",
      desc: "Our AI engine analyzes the complaint text, determines urgency, predicts category, and routes to the exact department in seconds.",
      details: [
        "Semantic department & category matching",
        "Urgency & priority scoring (High / Medium / Low)",
        "Duplicate grievance auto-detection",
      ],
      mockupData: {
        id: "GRV-2026-8942",
        category: "Water Works Department",
        status: "AI Classified (98.4% Confidence)",
        priority: "High Urgency",
        sla: "48 Hours Target",
      },
    },
    {
      step: "03",
      title: "Officer Action & Proof of Work",
      badge: "Officer Dashboard",
      desc: "Assigned field officers receive notifications, inspect the issue on ground, update status, and upload mandatory resolution photos.",
      details: [
        "Mobile-friendly officer dispatch view",
        "Mandatory geo-tagged proof of resolution",
        "Internal team notes and progress milestones",
      ],
      mockupData: {
        id: "GRV-2026-8942",
        assignedTo: "Officer Rajesh Kumar (Water Div)",
        status: "In Progress -> Resolved",
        proof: "Repair_Work_Verified_GPS.jpg",
      },
    },
    {
      step: "04",
      title: "Verification & Citizen Sign-Off",
      badge: "Closed & Audited",
      desc: "The citizen is notified with resolution photos. If satisfied, the ticket closes; if unsatisfied, the issue can be reopened or escalated.",
      details: [
        "Citizen satisfaction rating (1-5 Stars)",
        "Automated supervisory escalation if SLA breached",
        "Immutable audit log entry created",
      ],
      mockupData: {
        id: "GRV-2026-8942",
        status: "Verified & Closed",
        citizenRating: "⭐⭐⭐⭐⭐ (5.0)",
        slaCompliance: "Completed in 18h (Ahead of 48h SLA)",
      },
    },
  ];

  const faqs = [
    {
      q: "How does the AI assist in grievance handling?",
      a: "The AI platform automatically reads the citizen's complaint, detects the underlying issue, assigns an urgency score, detects duplicate reports, and automatically routes the ticket to the correct municipal or state department without human bottleneck.",
    },
    {
      q: "What happens if a department fails to resolve a grievance on time?",
      a: "Every grievance is backed by an automated Service Level Agreement (SLA) clock. If the deadline approaches or breaches, the platform automatically escalates the ticket to higher department administrators and the Super Admin dashboard.",
    },
    {
      q: "Can citizens track the progress of their complaints in real time?",
      a: "Yes! Citizens can track the complete chronological lifecycle of their grievances with live status badges, officer assignment details, and timestamped resolution proof photos.",
    },
    {
      q: "Which user roles are supported in the system?",
      a: "The platform provides tailored role-based access for Citizens, Field Officers, Department Administrators, and Super Administrators with strict security and audit logging.",
    },
    {
      q: "Is citizen personal data kept secure and private?",
      a: "All personal information, location coordinates, and complaint data are encrypted, protected by role-based access control, and compliant with data privacy standards.",
    },
  ];

  return (
    <div
      className="min-h-screen text-white font-sans antialiased selection:bg-white selection:text-black"
      style={{ background: "#000" }}
    >
      {/* Full-page fixed grid overlay */}
      <div className="page-grid-bg" />

      {/* Subtle ambient radial top glow */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden z-0"
        aria-hidden="true"
      >
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full animate-pulse-slow"
          style={{ background: "radial-gradient(ellipse, rgba(255,255,255,0.05) 0%, transparent 70%)" }}
        />
      </div>

      {/* ─── NAVBAR ─────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ background: "rgba(0,0,0,0.85)", borderColor: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div
              className="p-2 rounded-xl border transition"
              style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}
            >
              <Logo size="sm" showText={false} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white">Unified Citizen</span>
              <span className="text-[10px] tracking-wider uppercase font-semibold" style={{ color: "#888" }}>
                Governance Platform
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: "#aaa" }}>
            <a href="#features" className="hover:text-white transition flex items-center gap-1.5">
              Features <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </a>
            <a href="#workflow" className="hover:text-white transition flex items-center gap-1.5">
              How It Works <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </a>
            <a href="#impact" className="hover:text-white transition">Impact & Metrics</a>
            <a href="#portals" className="hover:text-white transition">Portals</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium rounded-full transition"
              style={{ color: "#ccc", border: "1px solid rgba(255,255,255,0.12)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "#ccc")}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 text-sm font-bold text-black bg-white rounded-full hover:bg-gray-100 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO ───────────────────────────────────────────── */}
      <main className="relative z-10">
        <section className="pt-16 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          {/* Badge pill */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-8"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#ccc" }}
          >
            <Sparkles className="w-4 h-4" style={{ color: "#fff" }} />
            AI-Powered Citizen Grievance & Governance Ecosystem
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
            Unified Citizen is an Ecosystem designed for{" "}
            <span style={{ color: "#aaa" }}>Transparent Governance.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl max-w-3xl mx-auto font-normal leading-relaxed" style={{ color: "#888" }}>
            Submit, automate, track, and resolve citizen grievances with AI neural classification,
            intelligent department routing, and automated SLA accountability.
          </p>

          {/* CTA */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-full text-base font-bold text-black bg-white hover:bg-gray-100 transition flex items-center gap-2"
            >
              Submit a Grievance <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 rounded-full text-base font-medium text-white transition flex items-center gap-2"
              style={{ border: "1px solid rgba(255,255,255,0.18)" }}
            >
              About Unified Citizen
            </Link>
          </div>

          {/* ── Dashboard Mockup ── */}
          <div
            className="mt-16 max-w-6xl mx-auto rounded-3xl p-[1px]"
            style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)" }}
          >
            <div
              className="rounded-[22px] overflow-hidden text-left"
              style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {/* Window chrome */}
              <div
                className="px-6 py-4 flex items-center justify-between border-b"
                style={{ background: "#111", borderColor: "rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,95,87,0.8)" }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,189,46,0.8)" }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: "rgba(40,200,64,0.8)" }} />
                  </div>
                  <span className="text-xs font-medium ml-2" style={{ color: "#666" }}>
                    Unified Citizen Command Center • AI Engine v2.4 Active
                  </span>
                </div>
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: "rgba(40,200,64,0.08)", color: "#4ade80", border: "1px solid rgba(40,200,64,0.2)" }}
                >
                  ● Live Telemetry
                </span>
              </div>

              {/* Mockup Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left card */}
                <div className="p-5 rounded-2xl flex flex-col justify-between" style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#555" }}>Today's Focus</span>
                      <span className="text-xs font-medium" style={{ color: "#888" }}>3 of 3 Active</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { dot: "#f59e0b", label: "Ward 4 Water Leakage", badge: "SLA: 4h left", badgeBg: "rgba(245,158,11,0.1)", badgeColor: "#f59e0b" },
                        { dot: "#4ade80", label: "Streetlight Sector 9", badge: "Resolved", badgeBg: "rgba(74,222,128,0.1)", badgeColor: "#4ade80" },
                        { dot: "#f87171", label: "Drainage Blockage", badge: "Escalated L2", badgeBg: "rgba(248,113,113,0.1)", badgeColor: "#f87171" },
                      ].map((item) => (
                        <div key={item.label} className="p-3 rounded-xl flex items-center justify-between" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                          <div className="flex items-center gap-2.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: item.dot }} />
                            <span className="text-xs font-medium" style={{ color: "#ddd" }}>{item.label}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded font-medium" style={{ background: item.badgeBg, color: item.badgeColor }}>
                            {item.badge}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 flex items-center justify-between text-xs" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", color: "#555" }}>
                    <span>Department: Municipal Works</span>
                    <span className="font-semibold" style={{ color: "#bbb" }}>98.5% Accuracy</span>
                  </div>
                </div>

                {/* Center card */}
                <div className="p-5 rounded-2xl" style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#555" }}>Live AI Grievance Stream</span>
                    <Sparkles className="w-3.5 h-3.5" style={{ color: "#888" }} />
                  </div>
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <div className="flex items-center justify-between text-[11px] mb-1" style={{ color: "#888" }}>
                        <span className="font-mono" style={{ color: "#ccc" }}>#GRV-8942</span>
                        <span style={{ color: "#4ade80" }} className="font-semibold">Auto-Routed</span>
                      </div>
                      <p className="text-xs text-white font-medium line-clamp-1">
                        "Severe water pipeline rupture on Main Market Road..."
                      </p>
                      <div className="mt-2 flex gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.07)", color: "#ccc" }}>Water Dept</span>
                        <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(248,113,113,0.1)", color: "#f87171" }}>High Urgency</span>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl" style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <div className="flex items-center justify-between text-[11px] mb-1" style={{ color: "#666" }}>
                        <span className="font-mono">#GRV-8943</span>
                        <span>Assigned Officer</span>
                      </div>
                      <p className="text-xs line-clamp-1" style={{ color: "#aaa" }}>
                        "Pothole causing traffic congestion near Metro Gate 3"
                      </p>
                      <div className="mt-2 flex gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)", color: "#888" }}>Public Works</span>
                        <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>Medium</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right card */}
                <div className="p-5 rounded-2xl flex flex-col justify-between" style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#555" }}>Performance & Coverage</span>
                    <div className="mt-4 flex items-center justify-center py-2">
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path strokeWidth="3.5" stroke="rgba(255,255,255,0.08)" fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path strokeDasharray="94, 100" strokeWidth="3.5" strokeLinecap="round"
                            stroke="rgba(255,255,255,0.7)" fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-xl font-bold text-white">99.2%</span>
                          <span className="block text-[9px]" style={{ color: "#666" }}>SLA Met</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center mt-2">
                    <div className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <span className="text-[10px] block" style={{ color: "#555" }}>Avg Response</span>
                      <span className="text-xs font-bold text-white">2.4 Hours</span>
                    </div>
                    <div className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <span className="text-[10px] block" style={{ color: "#555" }}>Active Officers</span>
                      <span className="text-xs font-bold" style={{ color: "#ccc" }}>450+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── MARQUEE / RIBBON ───────────────────────────── */}
        <section
          className="py-8 border-y overflow-hidden"
          style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs sm:text-sm font-medium" style={{ color: "#666" }}>
            {[
              { Icon: Brain, label: "AI Neural Classification", color: "#bbb" },
              { Icon: Shield, label: "Immutable Audit Trail", color: "#bbb" },
              { Icon: Clock, label: "Automated SLA Escalations", color: "#bbb" },
              { Icon: MapPin, label: "GPS Geotagged Evidence", color: "#bbb" },
              { Icon: Building2, label: "Inter-Department Routing", color: "#bbb" },
              { Icon: Activity, label: "Real-Time Status Telemetry", color: "#bbb" },
            ].map(({ Icon, label, color }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="w-4 h-4" style={{ color }} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FEATURES BENTO ─────────────────────────────── */}
        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Next-Generation Governance Features
            </h2>
            <p className="mt-4 text-base sm:text-lg" style={{ color: "#666" }}>
              Built from the ground up to replace slow bureaucratic procedures with automated, transparent, and intelligent workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "AI Grievance Classifier", desc: "Automatic category prediction, urgency scoring, and duplicate grievance detection in real time.", Icon: Brain, sub: "Neural Categorization", tag: "98.7% Accuracy on Department Assignment" },
              { title: "Smart SLA Escalation", desc: "Automated deadline tracking with automated escalations to supervisors if resolution delays occur.", Icon: Clock, sub: "Zero Tolerance For Delays", tag: "Automated Tier-2 & Tier-3 Escalations" },
              { title: "Resolution Proof & GPS", desc: "Mandatory geotagged photos and officer inspection proof before a grievance can be marked resolved.", Icon: FileCheck, sub: "Verified Field Proofs", tag: "Tamper-proof Geotagged Evidence" },
              { title: "Multi-Role Portals", desc: "Dedicated workflows for Citizens, Field Officers, Department Admins, and Super Administrators.", Icon: Users, sub: "Role-Based Access", tag: "Granular Permissions & Audit Logging" },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-3xl p-6 flex flex-col justify-between group transition"
                style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
              >
                <div>
                  <h3 className="text-xl font-bold text-white">{f.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed" style={{ color: "#666" }}>{f.desc}</p>
                </div>
                <div className="mt-8 rounded-2xl bg-white p-6 min-h-[200px] flex flex-col items-center justify-center text-center text-black">
                  <f.Icon className="w-16 h-16 text-black mb-3" />
                  <span className="text-sm font-bold">{f.sub}</span>
                  <span className="text-xs mt-1" style={{ color: "#555" }}>{f.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SCALING GOVERNANCE BENTO ───────────────────── */}
        <section id="impact" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Scaling Accountable Governance
            </h2>
            <p className="mt-3 text-base" style={{ color: "#666" }}>
              Engineered to handle high-volume public administration with maximum transparency and speed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Light card 1 */}
            <div className="rounded-3xl p-8 sm:p-10 relative overflow-hidden" style={{ background: "#f4f4f4", color: "#000" }}>
              <div className="w-full bg-grid-pattern-light rounded-2xl py-12 px-6 text-center mb-8" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.08)" }}>
                <div className="text-5xl sm:text-6xl font-extrabold tracking-tight text-black">100+</div>
                <div className="text-sm font-medium mt-1" style={{ color: "#555" }}>Government Departments Integrated</div>
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Keep Departments Synchronized</h3>
              <div className="grid grid-cols-2 gap-3 text-sm font-medium" style={{ color: "#444" }}>
                {["Unified inter-agency routing.", "Zero duplicate tickets.", "Standardized resolution SOPs.", "Real-time officer dispatch."].map(t => (
                  <div key={t} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black" /><span>{t}</span></div>
                ))}
              </div>
            </div>

            {/* Dark card 1 */}
            <div className="rounded-3xl p-8 sm:p-10" style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="rounded-2xl py-12 px-6 flex items-center justify-center mb-8" style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.06)" }}>
                <Shield className="w-24 h-24" style={{ color: "rgba(255,255,255,0.7)" }} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Eliminate Red Tape & Delays</h3>
              <div className="grid grid-cols-2 gap-3 text-sm font-medium" style={{ color: "#888" }}>
                {["Self-managed SLA timelines.", "Real-time visibility into bottlenecks.", "Instant citizen updates via SMS/Web.", "Identify breach risks before delays."].map(t => (
                  <div key={t} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full" style={{ background: "#555" }} /><span>{t}</span></div>
                ))}
              </div>
            </div>

            {/* Dark card 2 */}
            <div className="rounded-3xl p-8 sm:p-10" style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="rounded-2xl py-12 px-6 flex items-center justify-center mb-8" style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.06)" }}>
                <Building2 className="w-24 h-24" style={{ color: "rgba(255,255,255,0.55)" }} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Citizen-Centric Transparency</h3>
              <div className="grid grid-cols-2 gap-3 text-sm font-medium" style={{ color: "#888" }}>
                {["24/7 AI conversational chatbot.", "Complete grievance status timeline.", "Direct citizen feedback & star ratings.", "Reopen unresolved complaints easily."].map(t => (
                  <div key={t} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full" style={{ background: "#555" }} /><span>{t}</span></div>
                ))}
              </div>
            </div>

            {/* Light card 2 */}
            <div className="rounded-3xl p-8 sm:p-10" style={{ background: "#f4f4f4", color: "#000" }}>
              <div className="w-full bg-grid-pattern-light rounded-2xl py-12 px-6 text-center mb-8" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.08)" }}>
                <div className="text-5xl sm:text-6xl font-extrabold tracking-tight text-black">99.2%</div>
                <div className="text-sm font-medium mt-1" style={{ color: "#555" }}>SLA Compliance & Resolution Accuracy</div>
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Time is Precious in Governance</h3>
              <div className="grid grid-cols-2 gap-3 text-sm font-medium" style={{ color: "#444" }}>
                {["Under 24h average resolution time.", "Automated escalation cascades.", "Real-time supervisory dashboards.", "Data-driven policy insights."].map(t => (
                  <div key={t} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-black" /><span>{t}</span></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── WORKFLOW VISUALIZER ─────────────────────────── */}
        <section id="workflow" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#888" }}>End-To-End Lifecycle</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">How Unified Citizen Works</h2>
            <p className="mt-4 text-base" style={{ color: "#666" }}>
              Follow a grievance as it progresses from citizen submission through AI triaging to field verification.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto mb-10">
            {workflowSteps.map((step, idx) => (
              <button
                key={step.step}
                onClick={() => setActiveStep(idx)}
                className="p-4 rounded-2xl border text-left transition"
                style={{
                  background: activeStep === idx ? "#1a1a1a" : "#0d0d0d",
                  borderColor: activeStep === idx ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.07)",
                  color: activeStep === idx ? "#fff" : "#666",
                }}
              >
                <span className="text-xs font-mono block mb-1" style={{ color: activeStep === idx ? "#bbb" : "#444" }}>Step {step.step}</span>
                <span className="text-sm font-semibold block leading-tight">{step.badge}</span>
              </button>
            ))}
          </div>

          <div className="max-w-4xl mx-auto rounded-3xl p-6 sm:p-10" style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
                  style={{ background: "rgba(255,255,255,0.07)", color: "#ccc", border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  {workflowSteps[activeStep].badge}
                </span>
                <h3 className="text-2xl font-bold text-white">{workflowSteps[activeStep].title}</h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "#666" }}>{workflowSteps[activeStep].desc}</p>
                <div className="mt-6 space-y-2.5">
                  {workflowSteps[activeStep].details.map((detail) => (
                    <div key={detail} className="flex items-center gap-2 text-xs sm:text-sm" style={{ color: "#aaa" }}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#4ade80" }} />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl font-mono text-xs space-y-3" style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.07)", color: "#666" }}>
                <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span>Live Snapshot</span>
                  <span className="font-bold" style={{ color: "#ccc" }}>{workflowSteps[activeStep].mockupData.id}</span>
                </div>
                {Object.entries(workflowSteps[activeStep].mockupData).map(([key, val]) => {
                  if (key === "id") return null;
                  return (
                    <div key={key} className="flex justify-between items-center py-1">
                      <span className="capitalize" style={{ color: "#444" }}>{key}:</span>
                      <span className="font-medium text-white">{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ─── ROLE PORTALS ───────────────────────────────── */}
        <section id="portals" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Tailored Portals for Every Stakeholder
            </h2>
            <p className="mt-4 text-base" style={{ color: "#666" }}>Secure, role-based workflows designed for maximum speed and accountability.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, title: "Citizen Portal", desc: "Submit grievances, upload photos, chat with AI assistant, and track real-time status updates.", link: "/register", cta: "Register Citizen Account" },
              { icon: Shield, title: "Officer Portal", desc: "View assigned field tasks, update progress milestones, upload resolution proofs, and manage SLAs.", link: "/login", cta: "Officer Sign In" },
              { icon: Building2, title: "Department Admin", desc: "Manage department officers, assign work queues, monitor SLA compliance, and analyze performance.", link: "/login", cta: "Dept Admin Login" },
              { icon: BarChart3, title: "Super Admin", desc: "System-wide analytics, manage departments, monitor escalations, review audit logs, and AI settings.", link: "/login", cta: "Executive Command" },
            ].map((p) => (
              <div
                key={p.title}
                className="p-6 rounded-3xl flex flex-col justify-between transition"
                style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <p.icon className="w-6 h-6" style={{ color: "#aaa" }} />
                  </div>
                  <h3 className="text-lg font-bold text-white">{p.title}</h3>
                  <p className="text-xs mt-2" style={{ color: "#555" }}>{p.desc}</p>
                </div>
                <Link to={p.link} className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:opacity-70 transition">
                  {p.cta} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FAQ ─────────────────────────────────────────── */}
        <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Frequently Asked Questions</h2>
            <p className="mt-4 text-base" style={{ color: "#666" }}>Everything you need to know about the AI Unified Citizen Governance Platform.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={faq.q} className="rounded-2xl overflow-hidden transition" style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-semibold text-base text-white hover:opacity-80 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-200 ${openFaq === idx ? "rotate-180" : ""}`}
                    style={{ color: "#666" }}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-sm leading-relaxed pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", color: "#777" }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ─── CTA BANNER ─────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div
            className="rounded-3xl p-8 sm:p-16 text-center relative overflow-hidden"
            style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(255,255,255,0.05) 0%, transparent 70%)" }} />
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight relative z-10">
              Ready to Experience Transparent Governance?
            </h2>
            <p className="mt-4 text-base sm:text-lg max-w-2xl mx-auto relative z-10" style={{ color: "#888" }}>
              Join thousands of citizens, officers, and administrators building an accountable public system powered by AI.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 relative z-10">
              <Link to="/register" className="px-8 py-3.5 rounded-full text-base font-bold text-black bg-white hover:bg-gray-100 transition">
                Get Started Free
              </Link>
              <Link to="/login" className="px-8 py-3.5 rounded-full text-base font-medium text-white transition" style={{ border: "1px solid rgba(255,255,255,0.18)" }}>
                Sign In to Portal
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t py-12 px-4 sm:px-6 lg:px-8" style={{ background: "#000", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={false} />
            <div>
              <span className="font-bold text-white text-base">Unified Citizen</span>
              <p className="text-xs" style={{ color: "#555" }}>AI-Powered Governance & Grievance Platform</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs" style={{ color: "#555" }}>
            {["#features", "#workflow", "#impact", "#faq"].map(href => (
              <a key={href} href={href} className="hover:text-white transition capitalize">{href.replace("#", "")}</a>
            ))}
            <Link to="/login" className="hover:text-white transition">Login</Link>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: "#444" }}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>All Services Operational • 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
