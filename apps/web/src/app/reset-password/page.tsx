"use client";

import { KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { FormField } from "@/components/form-field";
import { Notice } from "@/components/notice";
import { resetPassword } from "@/lib/api";
import { createSupabaseBrowserClient } from "@/lib/supabase";

function getRecoveryAccessToken(): string {
  const queryParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  return queryParams.get("access_token") ?? hashParams.get("access_token") ?? "";
}

export default function ResetPasswordPage(): ReactNode {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadAccessToken(): Promise<void> {
      const tokenFromUrl = getRecoveryAccessToken();

      if (tokenFromUrl) {
        setAccessToken(tokenFromUrl);
        return;
      }

      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        return;
      }

      const { data } = await supabase.auth.getSession();
      setAccessToken(data.session?.access_token ?? "");
    }

    void loadAccessToken();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      if (!accessToken) {
        throw new Error("Token de recuperacao ausente.");
      }

      await resetPassword({ accessToken, password });
      setSuccess("Senha redefinida. Redirecionando para o login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível redefinir a senha.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Nova senha"
      title="Defina uma credencial nova"
      subtitle="Use uma senha forte para manter sua conta e seus projetos protegidos."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-heading">
          <h2>Redefinir senha</h2>
          <p>O link recebido por email traz o token necessario para confirmar a troca.</p>
        </div>

        <div className="form-stack">
          {error ? <Notice tone="error">{error}</Notice> : null}
          {success ? <Notice tone="success">{success}</Notice> : null}

          <FormField
            id="password"
            label="Nova senha"
            autoComplete="new-password"
            minLength={8}
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button className="primary-button" disabled={isSubmitting} type="submit">
            <KeyRound className="button-icon" aria-hidden="true" />
            {isSubmitting ? "Salvando..." : "Salvar senha"}
          </button>
        </div>

        <p className="form-footer">
          Ja redefiniu? <Link href="/login">Entrar</Link>
        </p>
      </form>
    </AuthShell>
  );
}
