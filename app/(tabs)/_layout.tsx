import Ionicons from "@expo/vector-icons/Ionicons";
import { defaultConfig } from "@tamagui/config/v4";
import { Tabs } from "expo-router";
import React from "react";
import { createTamagui, TamaguiProvider, Theme } from "tamagui";

const config = createTamagui(defaultConfig);

export default function TabLayout() {
  return (
    <TamaguiProvider config={config}>
      <Theme name="light">
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: "#ffd33d",
            sceneStyle: {
              backgroundColor: "#FFFFFF",
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Profile",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? "person-sharp" : "person-outline"}
                  color={color}
                  size={24}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="main"
            options={{
              title: "Home",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? "home-sharp" : "home-outline"}
                  color={color}
                  size={24}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="stats"
            options={{
              title: "Stats",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? "stats-chart-sharp" : "stats-chart-outline"}
                  color={color}
                  size={24}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="tasks"
            options={{
              title: "Tasks",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? "checkbox" : "checkbox-outline"}
                  color={color}
                  size={24}
                />
              ),
            }}
          />
        </Tabs>
      </Theme>
    </TamaguiProvider>
  );
}
