import Link from "next/link";
import type { ReactNode } from "react";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthShell({ eyebrow, title, subtitle, children }: AuthShellProps): ReactNode {
  return (
    <main className="auth-page">
      <section className="auth-copy" aria-label="Anthurium Studios">
        <Link className="brand-lockup" href="/login">
          <span className="brand-mark" aria-hidden="true" />
          <span>Anthurium Studios</span>
        </Link>

        <div className="auth-positioning">
          <p>{eyebrow}</p>
          <h1>{title}</h1>
          <span>{subtitle}</span>
        </div>
      </section>

      <section className="auth-panel" aria-label={title}>
        {children}
      </section>
    </main>
  );
}
