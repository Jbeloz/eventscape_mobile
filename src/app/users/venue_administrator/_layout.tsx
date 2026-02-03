import { Stack } from 'expo-router'

export default function VenueAdministratorLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationTypeForReplace: 'pop',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="venue_admin_calendar" />
      <Stack.Screen name="venue_admin_venues" />
      <Stack.Screen name="venue_admin_home" />
      <Stack.Screen name="venue_admin_profile" />
      <Stack.Screen name="add_schedule" />
      <Stack.Screen name="seasonal_rates" />
      <Stack.Screen name="venue_dashboard" />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="my_venue" />
      </Stack.Group>
    </Stack>
  )
}
