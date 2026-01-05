import { Database } from "@/database.types";
import { Button } from "@tamagui/button";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { View } from "tamagui";
import { supabase } from "../utils/supabase";

type StudySessionInsert =
  Database["public"]["Tables"]["study_sessions"]["Insert"];

type StudySessionRow = Database["public"]["Tables"]["study_sessions"]["Row"];

type TimerState = "idle" | "running" | "paused";
function Timer() {
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [segmentStart, setSegmentStart] = useState<number | null>(null);
  const [carrySeconds, setCarrySeconds] = useState(0);
  const [tick, setTick] = useState(Date.now());

  // Ticker
  useEffect(() => {
    if (timerState !== "running") return;

    const id = setInterval(() => {
      setTick(Date.now());
    }, 1000);

    return () => clearInterval(id);
  }, [timerState]);

  const totalSeconds =
    timerState === "running" && segmentStart !== null
      ? carrySeconds + Math.floor((tick - segmentStart) / 1000)
      : carrySeconds;

  function beginSession() {
    const now = Date.now();
    setTick(now);
    setSessionStart(now);
    setSegmentStart(now);
    setCarrySeconds(0);
    setTimerState("running");
  }

  function pauseSession() {
    setCarrySeconds(totalSeconds);
    setSegmentStart(null);
    setTimerState("paused");
  }

  function resumeSession() {
    const now = Date.now();
    setTick(now);
    setSegmentStart(now);
    setTimerState("running");
  }

  function resetSession() {
    setTimerState("idle");
    setSessionStart(null);
    setSegmentStart(null);
    setCarrySeconds(0);
  }

  function buildSavePayload(
    userId: string,
    sessionStart: number,
    totalSeconds: number
  ): StudySessionInsert {
    const startedIso = new Date(sessionStart).toISOString();
    const endedIso = new Date().toISOString();

    return {
      user_id: userId,
      started_at: startedIso,
      ended_at: endedIso,
      duration_sec: totalSeconds,
    };
  }

  async function persistSession(
    payload: StudySessionInsert
  ): Promise<string | null> {
    const { data, error } = await supabase
      .from("study_sessions")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      console.error("Save failed", error);
      return null;
    }

    return data?.id ?? null;
  }

  function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");

    return `${mm}:${ss}`;
  }

  async function handleSave() {
    // sessionStart can be null if the user hasn't started a session yet
    if (sessionStart == null) {
      console.warn("Cannot save: session has not started.");
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.id) {
      console.warn("Cannot save: user not authenticated.");
      return;
    }

    const payload: StudySessionInsert = buildSavePayload(
      user.id,
      sessionStart,
      totalSeconds
    );

    const sessionId = await persistSession(payload);

    if (!sessionId) return;

    // On success, reset timer state
    resetSession();
    router.push(`/results/${sessionId}`);
  }

  return (
    <>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(totalSeconds)}</Text>
      </View>
      <View style={styles.buttonContainer}>
        {timerState === "idle" && (
          <Button
            marginTop={80}
            boxShadow={"0 4px 8px rgba(0, 0, 0, 0.1)"}
            fontSize={18}
            height={80}
            borderRadius={50}
            style={styles.buttonContainerButton}
            onPress={beginSession}
          >
            Start
          </Button>
        )}

        {timerState === "running" && (
          <Button
            borderRadius={50}
            fontSize={18}
            boxShadow={"0 4px 8px rgba(0, 0, 0, 0.1)"}
            style={styles.buttonContainerButton}
            onPress={pauseSession}
          >
            Pause
          </Button>
        )}

        {timerState === "paused" && (
          <>
            <Button
              borderRadius={50}
              fontSize={18}
              boxShadow={"0 4px 8px rgba(0, 0, 0, 0.1)"}
              style={styles.buttonContainerButton}
              onPress={resumeSession}
            >
              Resume
            </Button>

            <Button
              borderRadius={50}
              fontSize={18}
              boxShadow={"0 4px 8px rgba(0, 0, 0, 0.1)"}
              style={styles.buttonContainerButton}
              onPress={handleSave}
            >
              Save
            </Button>
          </>
        )}

        {(timerState === "running" || timerState === "paused") && (
          <Button
            borderRadius={50}
            fontSize={18}
            boxShadow={"0 4px 8px rgba(0, 0, 0, 0.1)"}
            style={styles.buttonContainerButton}
            backgroundColor="#DF9C9C"
            onPress={resetSession}
          >
            End Session
          </Button>
        )}
      </View>
    </>
  );
}

export default Timer;

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 100,
    display: "flex",
    gap: 10,
    justifyContent: "space-around",
    minWidth: "80%",
    minHeight: "20%",
  },
  buttonContainerButton: {
    flex: 1,
    padding: 10,
    boxSizing: "border-box",
  },

  timerContainer: {
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
