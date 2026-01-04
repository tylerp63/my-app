import { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../utils/supabase";

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

      const { data, error } = await supabase
        .from("users")
        .select("email")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!isMounted) return;

      // If the table / policy isn't set up, don't break the UI; we still have auth email.
      if (error) {
        console.log("getProfile users.email error:", error);
        setError(error.message);
        setLoading(false);
        return;
      }

      // Only override if your table has an email value
      if (data?.email) {
        setEmail(data.email);
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
