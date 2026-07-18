"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface Session {
  user: User;
}

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const res = await fetch("/api/authenticated/session", {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
      } else {
        setSession(null);
      }
    } catch (err) {
      console.error("Failed to refresh session:", err);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}