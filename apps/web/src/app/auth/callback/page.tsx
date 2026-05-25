"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Notice } from "@/components/notice";
import { syncAuthSession } from "@/lib/api";
import { saveSession } from "@/lib/session";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function AuthCallbackPage(): ReactNode {
  const router = useRouter();
  const [message, setMessage] = useState("Finalizando autenticacao...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function syncSession(): Promise<void> {
      try {
        const supabase = createSupabaseBrowserClient();

        if (!supabase) {
          setError("Supabase não está configurado no web.");
          return;
        }

        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          setError(sessionError.message);
          return;
        }

        if (!data.session?.access_token) {
          setError("Sessão OAuth não encontrada.");
          return;
        }

        saveSession({
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresIn: data.session.expires_in,
          tokenType: data.session.token_type,
        });
        await syncAuthSession(data.session.access_token);
        setMessage("Autenticado com sucesso. Redirecionando...");
        router.push("/dashboard");
      } catch (syncError) {
        setError(
          syncError instanceof Error
            ? syncError.message
            : "Não foi possível finalizar a autenticação.",
        );
      }
    }

    void syncSession();
  }, [router]);

  return (
    <AuthShell
      eyebrow="OAuth"
      title="Acesso conectado"
      subtitle="A autenticacao por provedor externo fica pronta para sincronizar o perfil logado."
    >
      <section className="auth-form">
        <div className="form-heading">
          <h2>Google</h2>
          <p>Validando retorno do provedor.</p>
        </div>

        <div className="form-stack">
          {error ? (
            <Notice tone="error">{error}</Notice>
          ) : (
            <Notice tone="success">{message}</Notice>
          )}

          <Link className="primary-button" href="/login">
            <CheckCircle2 className="button-icon" aria-hidden="true" />
            Voltar ao login
          </Link>
        </div>
      </section>
    </AuthShell>
  );
}
