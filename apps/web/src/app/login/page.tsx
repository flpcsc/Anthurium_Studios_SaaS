"use client";

import { ExternalLink, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { FormField } from "@/components/form-field";
import { Notice } from "@/components/notice";
import { login } from "@/lib/api";
import { saveSession } from "@/lib/session";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function LoginPage(): ReactNode {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await login({ email, password });

      if (!response.data.session.accessToken) {
        setSuccess("Login aceito. Confirme sua sessão pelo email, se necessário.");
        return;
      }

      saveSession({
        accessToken: response.data.session.accessToken,
        refreshToken: response.data.session.refreshToken,
        expiresIn: response.data.session.expiresIn,
        tokenType: response.data.session.tokenType,
      });
      setSuccess("Sessão iniciada. Redirecionando...");
      router.push("/dashboard");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível entrar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin(): Promise<void> {
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        setError("Configure as variáveis públicas do Supabase para usar Google.");
        return;
      }

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
      }
    } catch (oauthRequestError) {
      setError(
        oauthRequestError instanceof Error
          ? oauthRequestError.message
          : "Não foi possível iniciar login com Google.",
      );
    }
  }

  return (
    <AuthShell
      eyebrow="Acesso"
      title="Entre no seu workspace"
      subtitle="Gerencie credenciais, projetos e geracao de videos a partir de uma conta Anthurium."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-heading">
          <h2>Login</h2>
          <p>Use seu email de trabalho para continuar.</p>
        </div>

        <div className="form-stack">
          {error ? <Notice tone="error">{error}</Notice> : null}
          {success ? <Notice tone="success">{success}</Notice> : null}

          <FormField
            id="email"
            label="Email"
            autoComplete="email"
            inputMode="email"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <FormField
            id="password"
            label="Senha"
            autoComplete="current-password"
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <div className="form-row">
            <span />
            <Link className="inline-link" href="/forgot-password">
              Esqueci minha senha
            </Link>
          </div>

          <button className="primary-button" disabled={isSubmitting} type="submit">
            <LogIn className="button-icon" aria-hidden="true" />
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>

          <div className="form-divider">ou</div>

          <button className="secondary-button" type="button" onClick={handleGoogleLogin}>
            <ExternalLink className="button-icon" aria-hidden="true" />
            Continuar com Google
          </button>
        </div>

        <p className="form-footer">
          Ainda nao tem conta? <Link href="/signup">Criar conta</Link>
        </p>
      </form>
    </AuthShell>
  );
}
