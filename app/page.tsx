import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-5 text-center">
      <h1 className="text-4xl font-bold">Critique</h1>
      <p className="text-muted-foreground max-w-md">
        Track your habits and tasks. Every check-in and every done task gives
        you XP. Keep your streaks and level up.
      </p>
      {!hasEnvVars ? (
        <EnvVarWarning />
      ) : (
        <Suspense>
          <AuthButton />
        </Suspense>
      )}
    </main>
  );
}
