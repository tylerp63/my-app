import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "tamagui";
export default function Results() {
  const [rating, setRating] = React.useState(0);

  const goBack = () => {
    router.back();
  };
  return (
    <>
      <View
        style={{
          alignItems: "center",
          flex: 1,
          paddingBottom: 28,
          paddingTop: 28,
          backgroundColor: "#FFFFFF",
          gap: 17,
        }}
      >
        <Text style={{ fontSize: 15 }}>Session Title</Text>
        <Text style={styles.timerText}>00:00</Text>
        <Pressable>
          <Text style={styles.button}>Task List</Text>
        </Pressable>
        <Pressable>
          <Text style={styles.button}>Add Photo</Text>
        </Pressable>

        <Pressable style={{ paddingBottom: 28 }}>
          <Text style={styles.button}>Add Location</Text>
        </Pressable>
        <View style={{ display: "flex", flexDirection: "row", gap: 20 }}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Pressable key={value} onPress={() => setRating(value)}>
              <AntDesign
                name="star"
                size={36}
                color={value <= rating ? "#FFD700" : "#D9D9D9"}
              />
            </Pressable>
          ))}
        </View>

        <Button marginTop={20} onPress={goBack}>
          Back to home
        </Button>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
