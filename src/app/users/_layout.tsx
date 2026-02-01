import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../../hooks/use-auth";

export default function UsersLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // User is not logged in, redirect to login
      router.replace("/auth");
    }
  }, [user, loading, router]);

  // Show nothing while loading or if user is not authenticated
  if (loading || !user) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="customer" />
      <Stack.Screen name="event_organizer" />
    </Stack>
  );
}
