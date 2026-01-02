import { Stack } from "expo-router";
import * as SQLite from "expo-sqlite";
import { SQLiteProvider } from "expo-sqlite";
import { Platform } from "react-native";

const createDbIfNeeded = async (db: SQLite.SQLiteDatabase) => {
  console.log("Creating database...");
  try {
    // wa-sqlite (web) cannot always create/lock WAL files; use a safer mode on web.
    const journalMode = Platform.OS === "web" ? "DELETE" : "WAL";

    await db.execAsync(`
      PRAGMA journal_mode = ${journalMode};
      CREATE TABLE IF NOT EXISTS study_sessions (
        id TEXT PRIMARY KEY NOT NULL,
        started_at TEXT NOT NULL,
        ended_at TEXT NOT NULL,
        duration_sec INTEGER NOT NULL
      );
    `);
    console.log("Database created.");
  } catch (error) {
    console.log("Error creating database:", error);
  }
};

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="test.db" onInit={createDbIfNeeded}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SQLiteProvider>
  );
}
