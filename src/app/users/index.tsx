import { Redirect } from "expo-router";
import { useAuth } from "../../hooks/use-auth";

export default function UsersIndex() {
  const { user, loading } = useAuth();

  console.log('📍 UsersIndex - Loading:', loading, 'User role:', user?.role);

  if (loading) {
    return null;
  }

  // Redirect based on user role
  if (user?.role === "customer") {
    console.log('✅ Redirecting to customer');
    return <Redirect href="/users/customer" />;
  } else if (user?.role === "event_organizer") {
    console.log('✅ Redirecting to event_organizer');
    return <Redirect href="/users/event_organizer" />;
  } else if (user?.role === "coordinator") {
    console.log('✅ Redirecting to coordinator');
    return <Redirect href="/users/coordinator" />;
  } else if (user?.role === "venue_administrator") {
    console.log('✅ Redirecting to venue_administrator');
    return <Redirect href="/users/venue_administrator" />;
  }

  // Default redirect
  console.log('⚠️ No role matched, redirecting to public');
  return <Redirect href="/public" />;
}
