"use client";

import { UserPlus } from "lucide-react";
import Link from "next/link";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { FormField } from "@/components/form-field";
import { Notice } from "@/components/notice";
import { signUp } from "@/lib/api";
import { saveSession } from "@/lib/session";

export default function SignupPage(): ReactNode {
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
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
      const response = await signUp({
        email,
        password,
        name: name || undefined,
        organizationName: organizationName || undefined,
      });

      if (response.data.session.accessToken) {
        saveSession({
          accessToken: response.data.session.accessToken,
          refreshToken: response.data.session.refreshToken,
          expiresIn: response.data.session.expiresIn,
          tokenType: response.data.session.tokenType,
        });
      }

      setSuccess("Conta criada. O dashboard entra na proxima etapa.");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Nao foi possivel criar a conta.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Cadastro"
      title="Crie sua operacao de video"
      subtitle="Abra um workspace para organizar projetos, API keys e consumo da sua equipe."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-heading">
          <h2>Criar conta</h2>
          <p>Comece com seus dados principais.</p>
        </div>

        <div className="form-stack">
          {error ? <Notice tone="error">{error}</Notice> : null}
          {success ? <Notice tone="success">{success}</Notice> : null}

          <FormField
            id="name"
            label="Nome"
            autoComplete="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <FormField
            id="organizationName"
            label="Workspace"
            autoComplete="organization"
            type="text"
            value={organizationName}
            onChange={(event) => setOrganizationName(event.target.value)}
          />

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
            autoComplete="new-password"
            minLength={8}
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button className="primary-button" disabled={isSubmitting} type="submit">
            <UserPlus className="button-icon" aria-hidden="true" />
            {isSubmitting ? "Criando..." : "Criar conta"}
          </button>
        </div>

        <p className="form-footer">
          Ja tem acesso? <Link href="/login">Entrar</Link>
        </p>
      </form>
    </AuthShell>
  );
}
