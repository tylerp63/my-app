import { StyleSheet, Text, View } from "react-native";
import Sessions from "../components/Sessions";
export default function Index() {
  return (
    <>
      <View style={styles.container}>
        <Text>User: Diddy Cheesler</Text>
      </View>
      <View style={styles.container}>
        <Sessions />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#25292e",
  },
  timerText: {
    fontSize: 40,
    color: "#25292e",
  },
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "#fff",
  },
});
