import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

/**
 * Hook to get the current Supabase user with loading status.
 * - Returns `{ user, loading }`
 * - Updates automatically on login/logout
 */
export function useSupabaseUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  return { user, loading };
}
