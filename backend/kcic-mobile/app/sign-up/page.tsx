import { SignUpForm } from "@/components/auth/sign-up-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function SignUpPage() {
  return (
    <AuthShell title="Create account" description="Create your KCIC profile to save insights and manage your interests.">
      <SignUpForm />
    </AuthShell>
  );
}
