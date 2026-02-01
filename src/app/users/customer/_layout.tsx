import { Stack } from 'expo-router'

export default function CustomerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationTypeForReplace: 'pop',
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  )
}
