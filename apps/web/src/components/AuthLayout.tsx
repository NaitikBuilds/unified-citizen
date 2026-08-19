import { Outlet } from "react-router-dom";
import Logo from "./Logo";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" />
          <p className="text-base-content/60 mt-2">
            AI-Powered Citizen Governance Platform
          </p>
        </div>
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-6 sm:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
