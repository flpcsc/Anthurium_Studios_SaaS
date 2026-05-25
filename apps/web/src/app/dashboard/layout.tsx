"use client";

import { Building, Key, LogOut, Settings, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/use-auth";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps): ReactNode {
  const pathname = usePathname();
  const { user, organization, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-container">
          <div className="spinner" />
          <p>Carregando seu workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; //useAuth cuidara do redirecionamento
  }

  const navItems = [
    {
      label: "Vídeos",
      href: "/dashboard/videos",
      icon: Video,
    },
    {
      label: "Chaves de API",
      href: "/dashboard/api-keys",
      icon: Key,
    },
    {
      label: "Configurações",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const breadcrumbLabels: Record<string, string> = {
    "/dashboard/videos": "Vídeos",
    "/dashboard/api-keys": "Chaves de API",
    "/dashboard/settings": "Configurações",
  };

  const currentLabel = breadcrumbLabels[pathname] ?? pathname.split("/").pop() ?? "Dashboard";

  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-top">
          <Link href="/dashboard/settings" className="brand-lockup">
            <span className="brand-mark" />
            <span style={{ color: "#fffaf1" }}>Anthurium</span>
          </Link>

          {organization ? (
            <div className="workspace-badge">
              <Building className="badge-icon" />
              <span className="badge-text" title={organization.name}>
                {organization.name}
              </span>
            </div>
          ) : null}

          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${isActive ? "active" : ""}`}
                >
                  <Icon className="nav-icon" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="user-profile-summary">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name || "Avatar"}
                width={40}
                height={40}
                className="user-avatar"
                unoptimized
              />
            ) : (
              <div className="user-avatar-placeholder">{userInitials}</div>
            )}
            <div className="user-info">
              <span className="user-name" title={user.name || "Sem nome"}>
                {user.name || "Usuario"}
              </span>
              <span className="user-email" title={user.email}>
                {user.email}
              </span>
            </div>
          </div>

          <button onClick={logout} className="logout-button">
            <LogOut className="logout-icon" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-breadcrumbs">
            <span className="breadcrumb-parent">Dashboard</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{currentLabel}</span>
          </div>
        </header>

        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
}
