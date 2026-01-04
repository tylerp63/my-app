import { WeeklyHeatMap } from "@symbiot.dev/react-native-heatmap";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "tamagui";
import useDateRanges from "../hooks/useDateRanges";
import useSessionDerivedData from "../hooks/useSessionDerivedDate";
import useStudySessions from "../hooks/useStudySessions";
import formatTotal from "./FormatTotal";

const Sessions = () => {
  const ranges = useDateRanges();
  const { sessions: studySessions, loading, error } = useStudySessions();
  const { startTimes, totalSec } = useSessionDerivedData(studySessions, ranges);

  return (
    <View style={styles.container}>
      <View style={styles.heatmapSection}>
        <WeeklyHeatMap
          data={startTimes}
          theme={{ scheme: "light" }}
          startDate={ranges.monthStart}
          endDate={ranges.monthEnd}
          cellSize={40}
          scrollable={false}
          isSidebarVisible={true}
        />
      </View>
      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>This week's study total:</Text>
        {error ? (
          <Text color={"#b91c1c"} textAlign="center">
            {error}
          </Text>
        ) : null}
        {loading ? (
          <Text textAlign="center" marginTop={12}>
            Loading…
          </Text>
        ) : null}
        <Text fontSize={48} marginTop={24} textAlign="center">
          {formatTotal(totalSec)}
        </Text>
      </View>

      {/* <View style={styles.listSection}>
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
      </View> */}
    </View>
  );
};

export default Sessions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    padding: 16,
    gap: 16,
  },
  heatmapSection: {
    alignSelf: "center",
    padding: 12,
    borderRadius: 8,
    overflow: "hidden",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
    maxWidth: 500,
    minWidth: 400,
  },
  listSection: {
    alignSelf: "center",
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
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
