import { Link } from "react-router-dom";
import { Shield, Brain, MessageSquare, BarChart3, Users, CheckCircle } from "lucide-react";
import Logo from "../../components/Logo";

const features = [
  { icon: Brain, title: "AI Classification", desc: "Automatic grievance categorization, priority detection, and department routing using AI." },
  { icon: Shield, title: "Secure & Transparent", desc: "Role-based access control, audit logging, and end-to-end encryption." },
  { icon: MessageSquare, title: "AI Chatbot", desc: "24/7 AI-powered assistant to help citizens track and submit grievances." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Real-time insights into grievance trends, SLA compliance, and department performance." },
  { icon: Users, title: "Multi-Role System", desc: "Citizens, Officers, Department Admins, and Super Admins — each with tailored workflows." },
  { icon: CheckCircle, title: "SLA Management", desc: "Automated deadline tracking, escalation, and breach notifications." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-base-100/80 backdrop-blur-md border-b border-base-300">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn btn-ghost btn-sm">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 sm:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="badge badge-primary badge-lg mb-6">AI-Powered Governance</div>
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight">
            Your Voice, <span className="text-primary">Amplified</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-base-content/70 max-w-2xl mx-auto">
            Submit, track, and resolve government grievances with AI-powered classification, 
            smart routing, and real-time status updates.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn btn-primary btn-lg">
              Submit a Grievance
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-base-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card bg-base-100 shadow-md border border-base-300 hover:shadow-lg transition">
                <div className="card-body">
                  <f.icon className="h-8 w-8 text-primary mb-2" />
                  <h3 className="card-title text-lg">{f.title}</h3>
                  <p className="text-sm text-base-content/70">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: "10K+", label: "Grievances Resolved" },
            { value: "99%", label: "SLA Compliance" },
            { value: "24/7", label: "AI Support" },
            { value: "50+", label: "Departments" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl sm:text-4xl font-extrabold text-primary">{s.value}</div>
              <div className="text-sm text-base-content/60 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary text-primary-content">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to Make a Difference?</h2>
          <p className="mt-4 text-lg opacity-90">
            Join thousands of citizens using AI-powered governance to resolve issues faster.
          </p>
          <Link to="/register" className="btn btn-lg mt-8 bg-white text-primary border-white hover:bg-gray-100">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-base-200 border-t border-base-300">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" showText={false} />
          <p className="text-sm text-base-content/60">
            &copy; 2026 Unified Citizen Governance Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
