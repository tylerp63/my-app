import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "tamagui";
import ImagePickerExample from "./components/ImagePicker";
import LocationTool from "./components/LocationTool";
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
        <Text style={styles.timerText}>00:00</Text>
        <Button circular={true} style={styles.button}>
          Task List
        </Button>
        <ImagePickerExample />
        <LocationTool />
        <View
          style={{
            marginTop: 20,
            display: "flex",
            flexDirection: "row",
            gap: 20,
          }}
        >
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
    minWidth: "50%",
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
