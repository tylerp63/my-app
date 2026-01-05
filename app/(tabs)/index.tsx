import { Text, Theme, View } from "tamagui";
import SignOutButton from "../components/social-auth-buttons/sign-out-button";
import { useAuthContext } from "../hooks/use-auth-context";
export default function HomeScreen() {
  const { profile } = useAuthContext();
  return (
    <Theme name="light">
      <View
        flex={1}
        backgroundColor="white"
        justifyContent="center"
        alignItems="center"
        gap="$9"
      >
        <Text fontSize="$10">Let&apos;s study!</Text>
        <Text fontSize="$10"></Text>
        <Text>signed in as: {profile?.email}</Text>

        <SignOutButton />
      </View>
    </Theme>
  );
}
