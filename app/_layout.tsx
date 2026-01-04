import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { SplashScreenController } from "./components/splash-screen-controller";

import { defaultConfig } from "@tamagui/config/v4";
import { createTamagui, TamaguiProvider } from "tamagui";
import { useAuthContext } from "./hooks/use-auth-context";
import AuthProvider from "./providers/auth-provider";

const config = createTamagui(defaultConfig);
// Separate RootNavigator so we can access the AuthContext
function RootNavigator() {
  const { isLoggedIn } = useAuthContext();

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: "#FFFFFF",
        },
      }}
    >
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Screen name="results" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <TamaguiProvider config={config}>
      <AuthProvider>
        <SplashScreenController />
        <RootNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    </TamaguiProvider>
  );
}
