import { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Theme } from "../../../../../constants/theme";
import TopBar from "../../../../components/top_bar";
import BottomNavRenderer from "../../../../components/user_navigation/bottom_nav/BottomNavRenderer";

export default function VenueAdminAddVenue() {
  const [notificationCount] = useState(0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar notificationCount={notificationCount} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Add New Venue</Text>
        </View>

        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>➕ Add Venue Form</Text>
          <Text style={styles.placeholderSubText}>Create a new venue listing</Text>
        </View>
      </ScrollView>

      <BottomNavRenderer role="venue_administrator" activeTab="venues" />
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontFamily: Theme.fonts.bold,
    fontSize: 24,
    color: Theme.colors.primary,
  },
  placeholderBox: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 32,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
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
