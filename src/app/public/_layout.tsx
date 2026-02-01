import { Stack } from "expo-router";

export default function PublicLayout() {
  return (
    <Stack
      initialRouteName="splash_screen"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="splash_screen" />
      <Stack.Screen name="landing_screen" />
    </Stack>
  );
}