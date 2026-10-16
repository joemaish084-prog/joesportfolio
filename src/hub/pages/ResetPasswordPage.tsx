import { useNavigate, Link } from "react-router-dom";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useHubAuth } from "../auth/HubAuthProvider";
import { markActive } from "../auth/useIdleSignOut";
import { ChangePasswordForm } from "../components/settings/ChangePassword";

/**
 * Where a password recovery email lands. The link signs you in (Supabase reads
 * it from the URL), then this page lets you choose the new password.
 */
export default function ResetPasswordPage() {
  const { status, session } = useHubAuth();
  const navigate = useNavigate();

  return (
    <div className="hub-root flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-hub-lg">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Set a new password</h1>
          {session?.user.email && <p className="mt-1 text-sm text-muted-foreground">for {session.user.email}</p>}
        </div>
        <div className="hub-card p-6">
          {status === "loading" ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading" />
            </div>
          ) : status === "admin" ? (
            <ChangePasswordForm
              submitLabel="Save and open the hub"
              onDone={() => {
                // A fresh start for the 30-minute idle timer.
                markActive();
                toast.success("Password updated");
                navigate("/hub", { replace: true });
              }}
            />
          ) : (
            <div className="space-y-3 text-center text-sm">
              <p>This reset link has expired or was already used.</p>
              <p className="text-muted-foreground">Request a new one, then open the link within the hour.</p>
              <Link to="/hub/login" className="inline-block font-medium text-primary hover:underline">
                Back to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
