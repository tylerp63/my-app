import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import Timer from "./components/Timer";
export default function Index() {
  type UserType = {
    id: number;
    started_at: string;
    ended_at: string;
    duration_sec: number;
  };
  const [data, setData] = useState<UserType[]>([]);

  const db = useSQLiteContext();

  const loadData = async () => {
    const result = await db.getAllAsync<UserType>(
      "SELECT * FROM study_sessions;"
    );
    setData(result);
  };

  return (
    <View style={styles.container}>
      <Timer />
      <FlatList
        data={data}
        renderItem={({ item }) => {
          return (
            <View>
              <Text>{item.duration_sec}</Text>
            </View>
          );
        }}
      />
    </View>
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
