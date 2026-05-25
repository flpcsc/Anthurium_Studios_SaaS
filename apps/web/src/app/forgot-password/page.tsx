"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { FormField } from "@/components/form-field";
import { Notice } from "@/components/notice";
import { requestPasswordReset } from "@/lib/api";

export default function ForgotPasswordPage(): ReactNode {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await requestPasswordReset(email);
      setSuccess("Email de recuperacao solicitado.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível solicitar a recuperação.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Recuperacao"
      title="Retome acesso com seguranca"
      subtitle="O fluxo usa Supabase Auth para enviar o link de redefinicao ao email da conta."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-heading">
          <h2>Recuperar senha</h2>
          <p>Informe o email vinculado ao seu workspace.</p>
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

          <button className="primary-button" disabled={isSubmitting} type="submit">
            <Mail className="button-icon" aria-hidden="true" />
            {isSubmitting ? "Enviando..." : "Enviar link"}
          </button>
        </div>

        <p className="form-footer">
          Lembrou sua senha? <Link href="/login">Voltar ao login</Link>
        </p>
      </form>
    </AuthShell>
  );
}
