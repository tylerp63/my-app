import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { Controller, useForm } from "react-hook-form";
import {
  GooglePlaceData,
  GooglePlaceDetail,
  GooglePlacesAutocomplete
} from "react-native-google-places-autocomplete";
import {
  deleteAllocationsNotIn,
  upsertSessionAllocations
} from "../lib/queries/allocations";
import { loadResultsData } from "../lib/queries/resultsLoader";
import { updateStudySession } from "../lib/queries/sessions";
import {
  StudyPlaceRow,
  StudySessionSubjectInsert,
  StudySessionUpdate,
  TaskRow
} from "../lib/queries/types";
import { supabase } from "../utils/supabase";

type Difficulty = "easy" | "medium" | "hard";

type FormValues = {
  title: string;
  notes: string;
  place_id: string | null;
  subject_id: string | null;
  subject_allocations: Array<{ subject_id: string; seconds_spent: number }>;
  task_id: string | null;
  difficulty: Difficulty | null;
  tags: string[];
};

export default function ResultsSessionScreen() {
  const params = useLocalSearchParams();
  const rawId = params.id;
  const sessionId = Array.isArray(rawId) ? rawId[0] : String(rawId ?? "");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // dropdown options
  const [places, setPlaces] = useState<StudyPlaceRow[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [placeModalOpen, setPlaceModalOpen] = useState(false);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [showCreateSubject, setShowCreateSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [creatingSubject, setCreatingSubject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);

  const [sessionDurationSec, setSessionDurationSec] = useState<number | null>(
    null
  );

  const { control, handleSubmit, reset, setValue } = useForm<FormValues>({
    defaultValues: {
      notes: "",
      place_id: null,
      subject_id: null,
      task_id: null,
      difficulty: null,
      tags: [],
      subject_allocations: []
    }
  });

  // 1) Load + reset once
  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);

        const data = await loadResultsData(sessionId);
        if (cancelled) return;

        setPlaces(data.places);
        setSubjects(data.subjects);
        setTasks(data.tasks);
        setSessionDurationSec(data.session.duration_sec ?? null);

        reset({
          notes: data.session.notes ?? "",
          place_id: data.session.place_id ?? null,
          task_id: (data.session as any).task_id ?? null,
          difficulty: (data.session as any).difficulty ?? null,
          tags: data.session.tags ?? [],
          subject_id: (data.allocations?.[0]?.subject_id ?? null) as any,
          subject_allocations: (data.allocations ?? []).map((a: any) => ({
            subject_id: a.subject_id,
            seconds_spent: a.seconds_spent
          }))
        });
      } catch (e: any) {
        Alert.alert("Error", e?.message ?? "Failed to load session");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, reset]);
  const addPlaceFromGoogle = async (
    data: GooglePlaceData,
    details: GooglePlaceDetail | null
  ) => {
    try {
      const name =
        (details as any)?.name ??
        (data as any)?.structured_formatting?.main_text ??
        (data as any)?.description ??
        "Unnamed place";

      // study_places.address_text is REQUIRED and NOT nullable in your types
      const address_text =
        (details as any)?.formatted_address ??
        (details as any)?.vicinity ??
        (data as any)?.structured_formatting?.secondary_text ??
        "";

      const latitude = (details as any)?.geometry?.location?.lat ?? null;
      const longitude = (details as any)?.geometry?.location?.lng ?? null;

      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;

      const userId = userRes.user?.id;
      if (!userId) {
        Alert.alert("Not signed in", "Please sign in to add a place.");
        return;
      }

      // This matches Database.public.Tables.study_places.Insert
      const insertPayload = {
        user_id: userId,
        name,
        address_text,
        latitude,
        longitude
      };

      const { data: inserted, error } = await supabase
        .from("study_places")
        .insert(insertPayload)
        .select("*")
        .single();

      if (error) throw error;
      if (!inserted) throw new Error("No place returned from insert");

      // places is StudyPlaceRow[], so update it with the inserted DB row
      setPlaces((prev) => [inserted as any, ...prev]);

      // select it for the session
      setValue("place_id", (inserted as any).id);

      setPlaceModalOpen(false);
    } catch (e: any) {
      Alert.alert("Add place failed", e?.message ?? "Unknown error");
    }
  };

  // Logic for creating tasks if none
  const createTask = async () => {
    const title = newTaskTitle.trim();
    if (!title) {
      Alert.alert("Task title required", "Enter a title for the new task.");
      return;
    }

    try {
      setCreatingTask(true);

      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const userId = userRes.user?.id;
      if (!userId) {
        Alert.alert("Not signed in", "Please sign in to create a task.");
        return;
      }

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title,
          user_id: userId,
          completed: true,
          completed_at: new Date().toISOString()
        })
        .select("*")
        .single();

      if (error) throw error;

      // Update local list + select the new task
      setTasks((prev) => [data as any, ...prev]);
      setValue("task_id", (data as any).id);

      // Reset UI state
      setNewTaskTitle("");
      setShowCreateTask(false);
      setTaskModalOpen(false);
    } catch (e: any) {
      Alert.alert("Create task failed", e?.message ?? "Unknown error");
    } finally {
      setCreatingTask(false);
    }
  };

  const createSubject = async () => {
    const name = newSubjectName.trim();
    if (!name) {
      Alert.alert("Subject name required", "Enter a name for the new subject.");
      return;
    }

    try {
      setCreatingSubject(true);

      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const userId = userRes.user?.id;
      if (!userId) {
        Alert.alert("Not signed in", "Please sign in to create a subject.");
        return;
      }

      const { data, error } = await supabase
        .from("subjects")
        .insert({ name, user_id: userId })
        .select("*")
        .single();

      if (error) throw error;

      setSubjects((prev: any[]) => [data as any, ...prev]);
      setValue("subject_id", (data as any).id);

      setNewSubjectName("");
      setShowCreateSubject(false);
      setSubjectModalOpen(false);
    } catch (e: any) {
      Alert.alert("Create subject failed", e?.message ?? "Unknown error");
    } finally {
      setCreatingSubject(false);
    }
  };

  const onSave = async (values: FormValues) => {
    try {
      setSaving(true);

      // (Optional) validation: allocation sum <= duration
      if (sessionDurationSec != null) {
        const sum = values.subject_allocations.reduce(
          (acc, a) => acc + (a.seconds_spent || 0),
          0
        );
        if (sum > sessionDurationSec) {
          Alert.alert(
            "Allocation exceeds session time",
            "Reduce allocated seconds so it fits the session duration."
          );
          return;
        }
      }

      // A) update study_sessions (single payload)
      const patch: StudySessionUpdate = {
        notes: values.notes,
        place_id: values.place_id,
        tags: values.tags,
        difficulty: values.difficulty as any
      } as any;

      const { error: sessionErr } = await updateStudySession(sessionId, patch);
      if (sessionErr) throw sessionErr;

      // B) upsert allocations (join table)
      const allocationRows: StudySessionSubjectInsert[] =
        values.subject_allocations.map((a) => ({
          session_id: sessionId,
          subject_id: a.subject_id,
          seconds_spent: a.seconds_spent
        }));

      // Upsert current ones
      if (allocationRows.length > 0) {
        const { error: allocErr } =
          await upsertSessionAllocations(allocationRows);
        if (allocErr) throw allocErr;
      }

      // Delete ones removed (recommended)
      const keepIds = values.subject_allocations.map((a) => a.subject_id);
      const { error: delErr } = await deleteAllocationsNotIn(
        sessionId,
        keepIds
      );
      if (delErr) throw delErr;

      Alert.alert("Saved", "Your session was saved.");
      // router.back();  <-- removed since useRouter is removed
    } catch (e: any) {
      Alert.alert("Save failed", e?.message ?? "Unknown error");
    } finally {
      setSaving(false);
    }
    router.back();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.logo}>Toki</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.formBody}
          keyboardShouldPersistTaps="handled"
        >
          {/* Notes */}
          <Controller
            control={control}
            name="notes"
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="Notes"
                placeholderTextColor="#888"
                style={[styles.input, styles.textArea]}
                multiline
              />
            )}
          />

          {/* Place */}
          <Controller
            control={control}
            name="place_id"
            render={({ field: { value, onChange } }) => (
              <Pressable
                onPress={() => setPlaceModalOpen(true)}
                style={styles.selectContainer}
              >
                <Text style={styles.selectText}>
                  {value
                    ? (places.find((p) => p.id === value)?.name ?? "Place")
                    : "Place"}
                </Text>
              </Pressable>
            )}
          />
          {/* Subject */}
          <Controller
            control={control}
            name="subject_id"
            render={({ field: { value, onChange } }) => (
              <Pressable
                onPress={() => setSubjectModalOpen(true)}
                style={styles.selectContainer}
              >
                <Text style={styles.selectText}>
                  {value
                    ? (subjects.find((s: any) => s.id === value)?.name ??
                      "Course")
                    : "Course"}
                </Text>
              </Pressable>
            )}
          />

          {/* Task */}
          <Controller
            control={control}
            name="task_id"
            render={({ field: { value, onChange } }) => (
              <Pressable
                onPress={() => setTaskModalOpen(true)}
                style={styles.selectContainer}
              >
                <Text style={styles.selectText}>
                  {value
                    ? (tasks.find((t) => t.id === value)?.title ?? "Task")
                    : "Task"}
                </Text>
              </Pressable>
            )}
          />

          {/* Difficulty */}
          <Controller
            control={control}
            name="difficulty"
            render={({ field: { value, onChange } }) => (
              <View style={{ gap: 8 }}>
                <Text style={{ fontSize: 14, color: "#666" }}>Difficulty</Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {(["easy", "medium", "hard"] as Difficulty[]).map((d) => {
                    const selected = value === d;
                    return (
                      <Pressable
                        key={d}
                        onPress={() => onChange(selected ? null : d)}
                        style={[
                          styles.selectContainer,
                          { flex: 1, justifyContent: "center" },
                          selected && { borderWidth: 2, borderColor: "#51a2e9" }
                        ]}
                      >
                        <Text style={styles.selectText}>{d}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          />

          {/* TODO: tags + subject allocations UI */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 14, color: "#666" }}>
              Tags & allocations
            </Text>
            <Text style={{ fontSize: 12, color: "#888" }}>
              Placeholder: wire these to your UI once you decide the picker /
              editor UX.
            </Text>
          </View>

          <Pressable
            disabled={saving}
            onPress={handleSubmit(onSave)}
            style={[styles.saveButton, saving && { opacity: 0.7 }]}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Saving…" : "Save"}
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Place modal */}
      <Modal visible={placeModalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Add place</Text>
              {Platform.OS === "web" || !GooglePlacesAutocomplete ? (
                <Text style={styles.emptyHint}>
                  Place search is not available on web builds.
                </Text>
              ) : (
                <GooglePlacesAutocomplete
                  styles={{
                    container: { flex: 0 },
                    textInput: {
                      marginLeft: 0,
                      marginRight: 0,
                      height: 50,
                      color: "#5d5d5d",
                      fontSize: 16,
                      borderWidth: 1,
                      borderColor: "#ddd",
                      borderRadius: 8,
                      paddingHorizontal: 12
                    },
                    listView: { maxHeight: 220 }
                  }}
                  textInputProps={{ placeholderTextColor: "#8c8c8cff" }}
                  placeholder="Search"
                  fetchDetails={true}
                  onPress={(
                    data: GooglePlaceData,
                    details: GooglePlaceDetail | null = null
                  ) => {
                    addPlaceFromGoogle(data, details);
                  }}
                  query={{
                    key: "AIzaSyCgmp5HOwwIQr_8SuWJQmHzKkQAqkc7SRA",
                    language: "en"
                  }}
                />
              )}
              <Controller
                control={control}
                name="place_id"
                render={({ field: { value, onChange } }) => (
                  <FlatList
                    data={places}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                      const selected = item.id === value;
                      return (
                        <>
                          <Pressable
                            onPress={() => {
                              onChange(item.id);
                              setPlaceModalOpen(false);
                            }}
                            style={[
                              styles.modalRow,
                              selected && styles.modalRowSelected
                            ]}
                          >
                            <Text style={styles.modalRowText}>{item.name}</Text>
                          </Pressable>
                        </>
                      );
                    }}
                  />
                )}
              />
              <Pressable
                onPress={() => setPlaceModalOpen(false)}
                style={styles.modalClose}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {/* Subject modal */}
      <Modal visible={subjectModalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select a course</Text>

            {subjects.length === 0 ? (
              <View style={{ gap: 10 }}>
                <Text style={styles.emptyHint}>
                  You don’t have any courses yet. Create one below.
                </Text>

                <TextInput
                  value={newSubjectName}
                  onChangeText={setNewSubjectName}
                  placeholder="New subject name"
                  placeholderTextColor="#888"
                  style={styles.modalInput}
                  autoFocus
                />

                <Pressable
                  disabled={creatingSubject}
                  onPress={createSubject}
                  style={[
                    styles.modalPrimaryButton,
                    creatingSubject && { opacity: 0.7 }
                  ]}
                >
                  <Text style={styles.modalPrimaryButtonText}>
                    {creatingSubject ? "Creating…" : "Create course"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setSubjectModalOpen(false);
                    setShowCreateSubject(false);
                    setNewSubjectName("");
                  }}
                  style={styles.modalClose}
                >
                  <Text style={styles.modalCloseText}>Close</Text>
                </Pressable>
              </View>
            ) : (
              <Controller
                control={control}
                name="subject_id"
                render={({ field: { value, onChange } }) => (
                  <View style={{ gap: 12 }}>
                    <FlatList
                      data={subjects as any[]}
                      keyExtractor={(item: any) => item.id}
                      renderItem={({ item }: any) => {
                        const selected = item.id === value;
                        return (
                          <Pressable
                            onPress={() => {
                              onChange(item.id);
                              setSubjectModalOpen(false);
                            }}
                            style={[
                              styles.modalRow,
                              selected && styles.modalRowSelected
                            ]}
                          >
                            <Text style={styles.modalRowText}>{item.name}</Text>
                          </Pressable>
                        );
                      }}
                    />

                    <Pressable
                      onPress={() => onChange(null)}
                      style={styles.modalClose}
                    >
                      <Text style={styles.modalCloseText}>Clear course</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => setShowCreateSubject((v) => !v)}
                      style={styles.modalClose}
                    >
                      <Text style={styles.modalCloseText}>
                        {showCreateSubject ? "Hide create" : "Add new course"}
                      </Text>
                    </Pressable>

                    {showCreateSubject && (
                      <View style={{ gap: 10 }}>
                        <TextInput
                          value={newSubjectName}
                          onChangeText={setNewSubjectName}
                          placeholder="New subject name"
                          placeholderTextColor="#888"
                          style={styles.modalInput}
                        />
                        <Pressable
                          disabled={creatingSubject}
                          onPress={createSubject}
                          style={[
                            styles.modalPrimaryButton,
                            creatingSubject && { opacity: 0.7 }
                          ]}
                        >
                          <Text style={styles.modalPrimaryButtonText}>
                            {creatingSubject ? "Creating…" : "Create course"}
                          </Text>
                        </Pressable>
                      </View>
                    )}

                    <Pressable
                      onPress={() => {
                        setSubjectModalOpen(false);
                        setShowCreateSubject(false);
                        setNewSubjectName("");
                      }}
                      style={styles.modalClose}
                    >
                      <Text style={styles.modalCloseText}>Close</Text>
                    </Pressable>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Task modal */}
      <Modal visible={taskModalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Select a task</Text>

              {tasks.length === 0 ? (
                <View style={{ gap: 10 }}>
                  <Text style={styles.emptyHint}>
                    You don’t have any tasks yet. Create one below.
                  </Text>

                  <TextInput
                    value={newTaskTitle}
                    onChangeText={setNewTaskTitle}
                    placeholder="New task title"
                    placeholderTextColor="#888"
                    style={styles.modalInput}
                    autoFocus
                  />

                  <Pressable
                    disabled={creatingTask}
                    onPress={createTask}
                    style={[
                      styles.modalPrimaryButton,
                      creatingTask && { opacity: 0.7 }
                    ]}
                  >
                    <Text style={styles.modalPrimaryButtonText}>
                      {creatingTask ? "Creating…" : "Create task"}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setTaskModalOpen(false);
                      setShowCreateTask(false);
                      setNewTaskTitle("");
                    }}
                    style={styles.modalClose}
                  >
                    <Text style={styles.modalCloseText}>Close</Text>
                  </Pressable>
                </View>
              ) : (
                <Controller
                  control={control}
                  name="task_id"
                  render={({ field: { value, onChange } }) => (
                    <View style={{ gap: 12 }}>
                      <FlatList
                        data={tasks}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => {
                          const selected = item.id === value;
                          return (
                            <Pressable
                              onPress={() => {
                                onChange(item.id);
                                setTaskModalOpen(false);
                              }}
                              style={[
                                styles.modalRow,
                                selected && styles.modalRowSelected
                              ]}
                            >
                              <Text style={styles.modalRowText}>
                                {item.title}
                              </Text>
                            </Pressable>
                          );
                        }}
                      />

                      <Pressable
                        onPress={() => onChange(null)}
                        style={styles.modalClose}
                      >
                        <Text style={styles.modalCloseText}>Clear task</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => setShowCreateTask((v) => !v)}
                        style={styles.modalClose}
                      >
                        <Text style={styles.modalCloseText}>
                          {showCreateTask ? "Hide create" : "Add new task"}
                        </Text>
                      </Pressable>

                      {showCreateTask && (
                        <View style={{ gap: 10 }}>
                          <TextInput
                            value={newTaskTitle}
                            onChangeText={setNewTaskTitle}
                            placeholder="New task title"
                            placeholderTextColor="#888"
                            style={styles.modalInput}
                          />
                          <Pressable
                            disabled={creatingTask}
                            onPress={createTask}
                            style={[
                              styles.modalPrimaryButton,
                              creatingTask && { opacity: 0.7 }
                            ]}
                          >
                            <Text style={styles.modalPrimaryButtonText}>
                              {creatingTask ? "Creating…" : "Create task"}
                            </Text>
                          </Pressable>
                        </View>
                      )}

                      <Pressable
                        onPress={() => {
                          setTaskModalOpen(false);
                          setShowCreateTask(false);
                          setNewTaskTitle("");
                        }}
                        style={styles.modalClose}
                      >
                        <Text style={styles.modalCloseText}>Close</Text>
                      </Pressable>
                    </View>
                  )}
                />
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5"
  },
  card: {
    flex: 1,
    width: "100%",
    backgroundColor: "white"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4da3f1"
  },
  formBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12 // Gap works in modern React Native versions
  },
  input: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#333"
  },
  textArea: {
    height: 120,
    paddingTop: 15
  },
  selectContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 15
  },
  selectText: {
    fontSize: 16,
    color: "#666"
  },
  footer: {
    backgroundColor: "#e8e8e8",
    padding: 20,
    alignItems: "center"
  },
  saveButton: {
    backgroundColor: "#51a2e9",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center"
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600"
  },
  stateBox: {
    paddingHorizontal: 20,
    paddingTop: 10
  },
  stateText: {
    color: "#666",
    fontSize: 14
  },
  errorText: {
    color: "#b00020",
    fontSize: 14
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end"
  },
  modalCard: {
    backgroundColor: "white",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    maxHeight: "85%"
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10
  },
  modalRow: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10
  },
  modalRowSelected: {
    backgroundColor: "#eef6ff"
  },
  modalRowText: {
    fontSize: 16,
    color: "#222"
  },
  modalClose: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    alignItems: "center"
  },
  modalCloseText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600"
  },
  emptyHint: {
    fontSize: 14,
    color: "#666"
  },
  modalInput: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#333"
  },
  modalPrimaryButton: {
    backgroundColor: "#51a2e9",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center"
  },
  modalPrimaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600"
  }
});
