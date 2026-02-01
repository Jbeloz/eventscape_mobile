import { Stack } from 'expo-router'

export default function EventOrganizerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationTypeForReplace: 'pop',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="event_organizer_home" />
      <Stack.Screen name="event_organizer_activities" />
      <Stack.Screen name="event_organizer_venue_booking" />
      <Stack.Screen name="event_organizer_templates" />
      <Stack.Screen name="event_organizer_projects" />
      <Stack.Screen name="event_organizer_review_center" />
      <Stack.Screen name="event_organizer_profile" />
    </Stack>
  )
}
