import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { supabase } from "../utils/supabase";

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Always show the auth email first (works even without a `users` row)
    setEmail(session?.user?.email ?? "");

    // Optionally hydrate from your public `users` table if you store email there too
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error } = await supabase
        .from("users")
        .select("email")
        .eq("id", session.user.id)
        .maybeSingle();

      // If the table / policy isn't set up, don't break the UI; we still have auth email.
      if (error) {
        console.log("getProfile users.email error:", error);
        return;
      }

      // Only override if your table has an email value
      if (data?.email) {
        setEmail(data.email);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <View style={[styles.container, { justifyContent: "flex-end" }]}>
        <Text style={{ fontSize: 20, color: "#c6c6c6ff" }}>Signed in as:</Text>
        <Text style={{ fontSize: 18, color: "#c6c6c6ff" }}>
          {email || "(no email found)"}
        </Text>
      </View>
      <View style={styles.container}>
        <Pressable onPress={() => supabase.auth.signOut()}>
          <Text style={styles.button}>Sign Out</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
    minWidth: 500,
  },
  text: {
    color: "#000000",
  },
  timerText: {
    fontSize: 130,
    color: "#000000",
  },
  button: {
    fontSize: 15,
    color: "#000000ff",
    backgroundColor: "#F4F4F4",
    textAlign: "center",
    minWidth: 260,
    margin: 8,
    padding: 20,
    borderRadius: 50,
  },
  completeButton: {
    fontSize: 15,
    color: "#000000ff",
    backgroundColor: "#D9D9D9",
    textAlign: "center",
    minWidth: 260,
    margin: 8,
    padding: 20,
    borderRadius: 50,
  },
});
