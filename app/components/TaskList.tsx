import { Tables } from "@/database.types";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Button } from "tamagui";
import { supabase } from "../utils/supabase";

type Task = Tables<"tasks">;

const TaskList = () => {
  //main component so like reuseable "task list"
  const [tasks, setTasks] = useState<Task[]>([]); //state to hold list of tasks

  const [newTaskTitle, setNewTaskTitle] = useState(""); //state to hold new task title input

  useEffect(() => {
    //loads tasks when component mounts (loads)
    loadTasks();
  }, []);

  const loadTasks = async () => {
    //function to load tasks from supabase
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading tasks:", error);
      return;
    }

    setTasks(data || []);
  };

  const addTask = async () => {
    //function to add new task to supabase
    if (!newTaskTitle.trim()) return; //avoid adding empty tasks

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("tasks").insert({
      title: newTaskTitle,
      user_id: user.id
    });

    if (error) {
      console.error("Error adding task:", error);
      return;
    }

    setNewTaskTitle("");
    loadTasks();
  };

  const deleteTasks = async () => {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("completed", true);

    if (error) {
      console.error("Error deleting tasks:", error);
      return;
    }

    loadTasks();
  };

  const toggleTask = async (task: Task) => {
    const nextCompleted = !task.completed;

    const { error } = await supabase
      .from("tasks")
      .update({
        completed: nextCompleted,
        completed_at: nextCompleted ? new Date().toISOString() : null
      })
      .eq("id", task.id);

    if (error) {
      console.error("Error updating task:", error);
      return;
    }

    loadTasks();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today&apos;s Tasks</Text>

      {/* Input to add new task */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a task..."
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
        />
        <Button onPress={addTask}>Add</Button>
      </View>
      {/* Button to delete tasks */}
      <View style={styles.inputContainer}>
        <Button onPress={deleteTasks}>Clear tasks</Button>
      </View>

      {/* List of tasks */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.taskRow} onPress={() => toggleTask(item)}>
            <View style={styles.checkbox}>
              {item.completed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text
              style={[
                styles.taskText,
                item.completed && styles.taskTextCompleted
              ]}
            >
              {item.title}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
};

export default TaskList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 45,
    marginBottom: 16
  },
  inputContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 8
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#333",
    borderRadius: 4,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center"
  },
  checkmark: {
    fontSize: 16,
    color: "#333"
  },
  taskText: {
    fontSize: 16,
    flex: 1
  },
  taskTextCompleted: {
    textDecorationLine: "line-through",
    color: "#999"
  }
});
