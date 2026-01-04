import { StyleSheet } from "react-native";
import { View } from "tamagui";
import Sessions from "../components/Sessions";
export default function Index() {
  return (
    <>
      <View style={styles.container}>
        <Sessions />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 80,
    gap: 20,
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
