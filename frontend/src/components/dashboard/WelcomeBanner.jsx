import { Shield } from "lucide-react";

function WelcomeBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
            <Shield className="size-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Welcome back</p>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              HoneyNetX Security Operations Center
            </h1>
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground leading-relaxed">
          Monitor, analyse and investigate honeypot attacks from one centralized platform.
        </p>
      </div>
      <div className="absolute -right-20 -top-20 size-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 size-40 rounded-full bg-primary/5 blur-2xl" />
    </div>
  );
}

export default WelcomeBanner;
