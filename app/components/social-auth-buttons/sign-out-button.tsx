import { supabase } from "@/app/utils/supabase";
import React from "react";
import { Button } from "tamagui";

async function onSignOutButtonPress() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error signing out:", error);
  }
}

export default function SignOutButton() {
  return (
    <>
      <Button
        boxShadow={"0 4px 8px rgba(0, 0, 0, 0.1)"}
        onPress={onSignOutButtonPress}
        maxWidth="40%"
      >
        Sign out
      </Button>
    </>
  );
}
