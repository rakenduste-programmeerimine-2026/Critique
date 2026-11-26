import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LevelBadge } from "@/components/level-badge";
import { NavLink } from "@/components/nav-link";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-6xl flex justify-between items-center gap-4 p-3 px-5 text-sm">
          <div className="flex gap-5 items-center">
            <Link href="/protected" className="font-bold text-primary">Critique</Link>
            <NavLink href="/protected">Habits</NavLink>
            <NavLink href="/protected/tasks">Tasks</NavLink>
          </div>
          <div className="flex gap-3 items-center">
            <Suspense>
              <LevelBadge />
            </Suspense>
            <ThemeSwitcher />
            {hasEnvVars ? (
              <Suspense>
                <AuthButton />
              </Suspense>
            ) : (
              <EnvVarWarning />
            )}
          </div>
        </div>
      </nav>
      <div className="flex-1 w-full max-w-6xl p-5">
        {!hasEnvVars && (
          <p className="mb-5 rounded-lg border border-primary/40 bg-primary/5 px-3 py-2 text-sm">
            Demo mode: sample data, nothing is saved. Add the Supabase env vars to use your own data.
          </p>
        )}
        <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>{children}</Suspense>
      </div>
    </main>
  );
}
