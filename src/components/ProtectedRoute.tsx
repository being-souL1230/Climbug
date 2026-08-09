import { Navigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, sessionChecked } = useAuth();

  // Still checking session with backend — show nothing yet
  if (!sessionChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08080d]">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-violet-400" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="text-sm text-zinc-500">Checking session...</span>
        </div>
      </div>
    );
  }

  // Not signed in — redirect to login
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
