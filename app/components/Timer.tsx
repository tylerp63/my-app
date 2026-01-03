import { router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
type session = {
  id: string;
  started_at: string;
  ended_at: string;
  duration_sec: number;
};

const Timer = () => {
  const [status, setStatus] = useState("stopped");
  const [startTimeMs, setStartTimeMs] = useState<number | null>(null);
  const [accumulatedSec, setAccumulatedSec] = useState(0);
  const [nowMs, setNowMs] = useState(Date.now());
  const [sessions, setSessions] = useState<session[]>([]);

  const { id } = useLocalSearchParams();

  const db = useSQLiteContext();

  const loadData = async () => {
    if (!id) return;
    const result = await db.getFirstAsync<session>(
      `SELECT * FROM study_sessions WHERE id = ?`,
      [String(id)]
    );
    // If you're opening an existing session, you can hydrate UI state here later.
    console.log("Loaded session:", result);
  };

  const loadSessions = async () => {
    try {
      const rows = await db.getAllAsync<session>(
        `SELECT * FROM study_sessions ORDER BY ended_at DESC LIMIT 50`
      );
      setSessions(rows ?? []);
    } catch (error) {
      console.error("Failed to load sessions", error);
    }
  };

  useEffect(() => {
    loadData();
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    try {
      // Your table schema requires `id` (TEXT PRIMARY KEY NOT NULL)
      const sessionId = id ? String(id) : String(Date.now());

      // Persist times as ISO strings to match TEXT columns
      const startedAtIso = startTimeMs
        ? new Date(startTimeMs).toISOString()
        : new Date().toISOString();
      const endedAtIso = new Date().toISOString();

      const response = await db.runAsync(
        `INSERT OR REPLACE INTO study_sessions
         (id, started_at, ended_at, duration_sec)
         VALUES (?, ?, ?, ?)`,
        [
          sessionId,
          startedAtIso,
          endedAtIso,
          Math.max(0, Math.floor(elapsedSeconds)),
        ]
      );

      console.log("Session saved successfully:", response?.changes);
      router.push("/results");
      await loadSessions();
    } catch (error) {
      console.error("Failed to save session", error);
    }
  };

  useEffect(() => {
    if (status !== "running") return;

    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  let elapsedSeconds = accumulatedSec;
  if (status === "running" && startTimeMs !== null) {
    elapsedSeconds += Math.floor((nowMs - startTimeMs) / 1000);
    if (elapsedSeconds < 0) {
      elapsedSeconds = 0;
    }
  }

  const start = () => {
    setStartTimeMs(Date.now());
    setAccumulatedSec(0);
    setStatus("running");
  };

  const pause = () => {
    setAccumulatedSec(elapsedSeconds);
    setStatus("paused");
  };

  const resume = () => {
    setStartTimeMs(Date.now());
    setStatus("running");
  };

  const end = async () => {
    setAccumulatedSec(0);
    setStartTimeMs(null);
    setStatus("stopped");
    return;
  };

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
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
      </View>
      <View style={styles.container}>
        {status === "stopped" && (
          <Pressable onPress={start}>
            <Text style={styles.button}>Start</Text>
          </Pressable>
        )}

        {status === "running" && (
          <Pressable onPress={pause}>
            <Text style={styles.button}>Pause</Text>
          </Pressable>
        )}

        {status === "paused" && (
          <>
            <Pressable onPress={resume}>
              <Text style={styles.button}>Resume</Text>
            </Pressable>

            <Pressable onPress={handleSave}>
              <Text style={styles.button}>Save</Text>
            </Pressable>
          </>
        )}

        {(status === "running" || status === "paused") && (
          <Pressable onPress={end}>
            <Text
              style={{
                minWidth: 240,
                fontSize: 24,
                textAlign: "center",
                margin: 6,
                padding: 24,
                borderRadius: 50,
                backgroundColor: "#DF9C9C",
              }}
            >
              End Session
            </Text>
          </Pressable>
        )}
      </View>
    </>
  );
};

export default Timer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  timerContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  text: {
    color: "#25292e",
  },
  timerText: {
    fontSize: 72,
    color: "#25292e",
  },
  button: {
    fontSize: 24,
    color: "#25292e",
    backgroundColor: "#D9D9D9",
    textAlign: "center",
    minWidth: 240,
    margin: 6,
    padding: 24,
    borderRadius: 50,
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
