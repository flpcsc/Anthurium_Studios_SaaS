"use client";

import { Save, User } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { FormField } from "@/components/form-field";
import { Notice } from "@/components/notice";
import { updateCurrentUser } from "@/lib/api";
import { readSession } from "@/lib/session";
import { useAuth } from "@/lib/use-auth";

export default function SettingsPage(): ReactNode {
  const { user, organization, role, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializa os campos quando os dados do user chegam
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  if (!user) {
    return null; // Layout já gerencia loading/auth redirect
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const session = readSession();

    if (!session?.accessToken) {
      setError("Sessão expirada. Faça login novamente.");
      setIsSubmitting(false);
      return;
    }

    try {
      await updateCurrentUser(session.accessToken, {
        name: name || undefined,
        avatarUrl: avatarUrl || undefined,
      });

      setSuccess("Perfil atualizado com sucesso!");
      await refreshUser(); // Atualiza dados no header/sidebar
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível atualizar o perfil.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="settings-container">
      <div className="settings-card">
        <div className="card-header">
          <User className="card-header-icon" />
          <div>
            <h3>Perfil do Usuário</h3>
            <p>Gerencie suas informações de identificação na plataforma.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="settings-form">
          {error ? <Notice tone="error">{error}</Notice> : null}
          {success ? <Notice tone="success">{success}</Notice> : null}

          <div className="form-grid">
            <div className="form-column">
              <FormField
                id="email"
                label="Email (Não editável)"
                disabled
                type="email"
                value={user.email}
              />

              <FormField
                id="name"
                label="Nome Completo"
                placeholder="Seu nome"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <FormField
                id="avatarUrl"
                label="URL do Avatar"
                placeholder="https://exemplo.com/sua-imagem.png"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
            </div>

            <div className="form-column workspace-info-box">
              <h4>Informações do Workspace</h4>
              <div className="info-row">
                <span className="info-label">Workspace Ativo:</span>
                <span className="info-val">{organization?.name || "Nenhum"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Seu Papel:</span>
                <span className="info-val role-tag">{role || "MEMBER"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">ID da Organização:</span>
                <span className="info-val code-text">{organization?.id || "N/A"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Slug de API:</span>
                <span className="info-val code-text">{organization?.slug || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="card-footer">
            <button className="primary-button submit-button" disabled={isSubmitting} type="submit">
              <Save className="button-icon" />
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
