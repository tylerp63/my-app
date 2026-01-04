import { WeeklyHeatMap } from "@symbiot.dev/react-native-heatmap";
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
  const [studySessions, setSessions] = useState<session[]>([]);
  const [startTimes, setStartTimes] = useState<string[]>([]);
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
          setStartTimes(studySessions.map((s) => s.started_at));
        } else {
          setSessions([]);
          setStartTimes([]);
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
  var now = new Date();
  if (now.getMonth() == 11) {
    var current = new Date(now.getFullYear() + 1, 0, 1);
  } else {
    var current = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  return (
    <View style={styles.container}>
      <View style={styles.heatmapSection}>
        <Text style={styles.sectionTitle}>Study heatmap</Text>
        <WeeklyHeatMap
          data={startTimes}
          theme={{ scheme: "light" }}
          startDate={now}
          endDate={current}
          cellSize={36}
        />
      </View>

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Sessions</Text>
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
    </View>
  );
};

export default Sessions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  heatmapSection: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  listSection: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#25292e",
    marginBottom: 8,
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
  emptyText: {
    marginTop: 8,
    color: "rgba(37, 41, 45, 0.68)",
  },
  sessionRow: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
  },
  sessionText: {
    color: "#25292e",
    marginTop: 4,
  },
});
