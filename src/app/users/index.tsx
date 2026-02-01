import { Redirect } from "expo-router";
import { useAuth } from "../../hooks/use-auth";

export default function UsersIndex() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  // Redirect based on user role
  if (user?.user_metadata?.role === "customer") {
    return <Redirect href="/users/customer" />;
  } else if (user?.user_metadata?.role === "event_organizer") {
    return <Redirect href="/users/event_organizer" />;
  } else if (user?.user_metadata?.role === "coordinator") {
    return <Redirect href="/users/coordinator" />;
  } else if (user?.user_metadata?.role === "venue_administrator") {
    return <Redirect href="/users/venue_administrator" />;
  }

  // Default redirect
  return <Redirect href="/public" />;
}
