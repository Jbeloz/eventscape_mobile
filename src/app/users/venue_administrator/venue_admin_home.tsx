import { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Theme } from "../../../../constants/theme";
import TopBar from "../../../components/top_bar";
import BottomNavRenderer from "../../../components/user_navigation/bottom_nav/BottomNavRenderer";
import { useAuth } from "../../../hooks/use-auth";

export default function VenueAdminHome() {
  const { user } = useAuth();
  const [notificationCount] = useState(0);
  
  // Extract first name from user name
  const firstName = user?.name?.split(' ')[0] || "User";

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar notificationCount={notificationCount} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.welcomeBanner}>
          <Text style={styles.welcomeTitle}>Welcome back, {firstName} - Venue Manager!</Text>
          <Text style={styles.welcomeBody}>
            Manage your venues and bookings from here.
          </Text>
        </View>

        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>🏢 Venue Admin Home</Text>
          <Text style={styles.placeholderSubText}>Coming soon...</Text>
        </View>
      </ScrollView>

      <BottomNavRenderer role="venue_administrator" activeTab="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  welcomeBanner: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 24,
    color: Theme.colors.primary,
    marginBottom: 8,
  },
  welcomeBody: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.muted,
  },
  placeholderBox: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 32,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  placeholderText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.primary,
    marginBottom: 8,
  },
  placeholderSubText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.muted,
  },
});
