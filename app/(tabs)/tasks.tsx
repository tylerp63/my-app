import { StyleSheet, View } from "react-native";
import TaskList from "../components/TaskList";

export default function TasksScreen() {
  return (
    <View style={styles.container}>
      <TaskList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
