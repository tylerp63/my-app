import { Button } from "@tamagui/button";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { View } from "tamagui";
import { supabase } from "../utils/supabase";
type studySession = {
  started_at: string;
  ended_at: string;
  duration_sec: number;
};

const Timer = () => {
  const [status, setStatus] = useState("stopped");
  const [startTimeMs, setStartTimeMs] = useState<number | null>(null);
  const [accumulatedSec, setAccumulatedSec] = useState(0);
  const [nowMs, setNowMs] = useState(Date.now());

  // Supabase logic
  const startedAt =
    startTimeMs !== null ? new Date(startTimeMs).toISOString() : "";
  const endedAt = new Date().toISOString();

  let elapsedSeconds = accumulatedSec;
  if (status === "running" && startTimeMs !== null) {
    elapsedSeconds += Math.floor((nowMs - startTimeMs) / 1000);
    if (elapsedSeconds < 0) {
      elapsedSeconds = 0;
    }
  }
  // Supabase logic for saving session (insert Session)
  const savedSession = {
    started_at: startedAt,
    ended_at: endedAt,
    duration_sec: elapsedSeconds,
  };

  const handleSave = async () => {
    const { data, error } = await supabase
      .from("study_sessions")
      .insert<studySession>(savedSession);
    console.log(data);
    end();
    router.push("/results");
    if (error) {
      console.log("Error saving session:", error);
    }
  };
  useEffect(() => {
    if (status !== "running") return;

    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

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

  return (
    <>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
      </View>
      <View style={styles.buttonContainer}>
        {status === "stopped" && (
          <Button
            marginTop={80}
            height={80}
            borderRadius={50}
            style={styles.buttonContainerButton}
            onPress={start}
          >
            Start
          </Button>
        )}

        {status === "running" && (
          <Button
            borderRadius={50}
            style={styles.buttonContainerButton}
            onPress={pause}
          >
            Pause
          </Button>
        )}

        {status === "paused" && (
          <>
            <Button
              borderRadius={50}
              style={styles.buttonContainerButton}
              onPress={resume}
            >
              Resume
            </Button>

            <Button
              borderRadius={50}
              style={styles.buttonContainerButton}
              onPress={handleSave}
            >
              Save
            </Button>
          </>
        )}

        {(status === "running" || status === "paused") && (
          <Button
            borderRadius={50}
            style={styles.buttonContainerButton}
            backgroundColor="#DF9C9C"
            onPress={end}
          >
            End Session
          </Button>
        )}
      </View>
    </>
  );
};

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
