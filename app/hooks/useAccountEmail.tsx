import { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";

export default function useAccountEmail(session: Session | null) {
  const authEmail = useMemo(() => session?.user?.email ?? "", [session]);
  const [email, setEmail] = useState<string>(authEmail);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Always show auth email immediately (works even without a `users` row)
    setEmail(authEmail);

    const run = async () => {
      setLoading(true);
      setError(null);

      // If no session/user, nothing to hydrate
      if (!session?.user) {
        if (isMounted) setLoading(false);
        return;
      }

      setLoading(false);
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [session, authEmail]);

  return { email, loading, error };
}
