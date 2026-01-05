import { Session } from "@supabase/supabase-js";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import useAccountEmail from "../hooks/useAccountEmail";
import { supabase } from "../utils/supabase";

export default function Account({ session }: { session: Session }) {
  const { email, loading, error } = useAccountEmail(session ?? null);

  return (
    <>
      <View style={[styles.container, { justifyContent: "flex-end" }]}>
        <Text style={{ fontSize: 20, color: "#c6c6c6ff" }}>Signed in as:</Text>
        <Text style={{ fontSize: 18, color: "#c6c6c6ff" }}>
          {loading ? "Loading…" : email || "(no email found)"}
        </Text>
        {error ? (
          <Text style={{ fontSize: 14, color: "#b91c1c", marginTop: 8 }}>
            {error}
          </Text>
        ) : null}
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
