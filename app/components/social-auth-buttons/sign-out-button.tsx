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
      <Button onPress={onSignOutButtonPress} maxWidth="40%">
        Sign out
      </Button>
    </>
  );
}
