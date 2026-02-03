import { useLocalSearchParams } from 'expo-router'
import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { Theme } from '../../../../constants/theme'
import VenueDashboard from '../../../components/VenueDashboard'
import { useAuth } from '../../../hooks/use-auth'

export default function VenueDashboardScreen() {
  const { venueId } = useLocalSearchParams<{ venueId: string }>()
  const { user } = useAuth()

  if (!venueId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>No venue selected</Text>
        </View>
      </SafeAreaView>
    )
  }

  return <VenueDashboard venueId={parseInt(venueId)} />
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 16,
    color: Theme.colors.muted,
  },
})
