"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { UserProfile } from "./api";
import { getCurrentUser, logout as requestLogout } from "./api";
import { clearSession, readSession } from "./session";

export interface OrganizationInfo {
  id: string;
  name: string;
  slug: string;
}

export interface UseAuthResult {
  user: UserProfile | null;
  organization: OrganizationInfo | null;
  role: string | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

type UserMembership = NonNullable<UserProfile["memberships"]>[number];

function getPrimaryMembership(user: UserProfile): UserMembership | null {
  return user.memberships?.[0] ?? null;
}

export function useAuth(): UseAuthResult {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<OrganizationInfo | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchUser(): Promise<void> {
      const session = readSession();

      if (!session?.accessToken) {
        if (active) {
          setLoading(false);
          router.replace("/login");
        }
        return;
      }

      try {
        const response = await getCurrentUser(session.accessToken);

        if (!active) return;

        const fetchedUser = response.data.user;
        const primaryMembership = getPrimaryMembership(fetchedUser);

        setUser(fetchedUser);
        setOrganization(primaryMembership?.organization ?? null);
        setRole(primaryMembership?.role ?? null);

        setLoading(false);
      } catch (err) {
        if (!active) return;
        console.error("Auth fetch failed:", err);
        setError("Não foi possível carregar a sessão.");
        clearSession();
        setLoading(false);
        router.replace("/login");
      }
    }

    void fetchUser();

    return () => {
      active = false;
    };
  }, [router]);

  async function logout(): Promise<void> {
    const session = readSession();

    if (session?.accessToken) {
      try {
        await requestLogout(session.accessToken);
      } catch (err) {
        console.error("Logout request failed:", err);
      }
    }

    clearSession();
    router.replace("/login");
  }

  return {
    user,
    organization,
    role,
    loading,
    error,
    logout,
    refreshUser: async (): Promise<void> => {
      const session = readSession();
      if (!session?.accessToken) return;
      try {
        const response = await getCurrentUser(session.accessToken);
        const fetchedUser = response.data.user;
        const primaryMembership = getPrimaryMembership(fetchedUser);

        setUser(fetchedUser);
        setOrganization(primaryMembership?.organization ?? null);
        setRole(primaryMembership?.role ?? null);
      } catch (err) {
        console.error("Failed to refresh user profile:", err);
      }
    },
  };
}
