import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { supabase } from "../utils/supabase";
type session = {
  id: string;
  started_at: string;
  ended_at: string;
  duration_sec: number;
};

const Sessions = () => {
  //   const { id } = useLocalSearchParams();

  //   const db = useSQLiteContext();

  //   const loadData = async () => {
  //     if (!id) return;
  //     const result = await db.getFirstAsync<session>(
  //       `SELECT * FROM study_sessions WHERE id = ?`,
  //       [String(id)]
  //     );
  //     // If you're opening an existing session, you can hydrate UI state here later.
  //     console.log("Loaded session:", result);
  //   };

  //   const loadSessions = async () => {
  //     try {
  //       const rows = await db.getAllAsync<session>(
  //         `SELECT * FROM study_sessions ORDER BY ended_at DESC LIMIT 50`
  //       );
  //       setSessions(rows ?? []);
  //     } catch (error) {
  //       console.error("Failed to load sessions", error);
  //     }
  //   };

  //   useEffect(() => {
  //     loadData();
  //     loadSessions();
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, [id]);

  const [studySessions, setSessions] = useState<session[]>([]);
  useEffect(() => {
    const getStudySessions = async () => {
      try {
        const { data: studySessions, error } = await supabase
          .from("study_sessions")
          .select();

        if (error) {
          console.error("Error fetching sessions:", error.message);
          return;
        }

        if (studySessions && studySessions.length > 0) {
          setSessions(studySessions);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching sessions:", error.message);
        } else {
          console.error("Error fetching sessions:", error);
        }
      }
    };

    getStudySessions();
  }, []);

  function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");

    return `${mm}:${ss}`;
  }

  function formatIso(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  }
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Recent study sessions</Text>
        <FlatList
          data={studySessions}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No study sessions saved yet.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.sessionRow}>
              <Text style={styles.sessionText}>
                Duration: {formatTime(item.duration_sec)}
              </Text>
              <Text style={styles.sessionText}>
                Start: {formatIso(item.started_at)}
              </Text>
              <Text style={styles.sessionText}>
                End: {formatIso(item.ended_at)}
              </Text>
            </View>
          )}
        />
      </View>
    </>
  );
};

export default Sessions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
    marginBottom: 20,
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
    color: "#25292e",
  },
  sectionTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#25292e",
  },
  emptyText: {
    marginTop: 8,
    color: "rgba(37, 41, 45, 0.68)",
  },
  sessionRow: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#2f3440",
  },
  sessionText: {
    color: "#fff",
    marginTop: 4,
  },
});
