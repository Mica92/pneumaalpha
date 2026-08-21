import { useEffect, useState, createContext, useContext, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
};

const AuthCtx = createContext<AuthState>({ user: null, session: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, session: null, loading: true });

  useEffect(() => {
    let cancelled = false;

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setState({ user: session?.user ?? null, session, loading: event !== "SIGNED_OUT" && !session });
      // After signing out of Google the visitor keeps browsing: hand them back
      // an anonymous session so conversations still persist.
      if (event === "SIGNED_OUT") {
        void supabase.auth.signInAnonymously();
      }
    });

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session) {
        setState({ user: session.user, session, loading: false });
        return;
      }
      // No login screen: every visitor gets a silent session so their
      // conversations persist without asking for credentials.
      const { data, error } = await supabase.auth.signInAnonymously();
      if (cancelled) return;
      if (error) {
        setState({ user: null, session: null, loading: false });
        return;
      }
      setState({ user: data.user ?? null, session: data.session ?? null, loading: false });
    })();

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <AuthCtx.Provider value={state}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
