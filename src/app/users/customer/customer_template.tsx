import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme } from "../../../../constants/theme";
import TopBar from "../../../components/top_bar";
import BottomNavRenderer from "../../../components/user_navigation/bottom_nav/BottomNavRenderer";
import CustomerThemeTemplates from "./customer_theme_templates";
import CustomerVenueTemplates from "./customer_venue_templates";

export default function CustomerTemplates() {
  const [activeTab, setActiveTab] = useState<"themes" | "venues">("themes");
  const [notificationCount] = useState(1);

  const handleViewDetails = (templateId: number) => {
    // Navigate to template details
    console.log("View details for template:", templateId);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header - Fixed */}
      <TopBar notificationCount={notificationCount} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Tabs */}
        <View style={styles.tabsContainer}>
          <Pressable
            style={[styles.tab, activeTab === "themes" && styles.activeTab]}
            onPress={() => setActiveTab("themes")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "themes" && styles.activeTabText,
              ]}
            >
              Theme Templates
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === "venues" && styles.activeTab]}
            onPress={() => setActiveTab("venues")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "venues" && styles.activeTabText,
              ]}
            >
              Venue Templates
            </Text>
          </Pressable>
        </View>

        {/* Content based on active tab */}
        {activeTab === "themes" ? (
          <CustomerThemeTemplates onViewDetails={handleViewDetails} />
        ) : (
          <CustomerVenueTemplates onViewDetails={handleViewDetails} />
        )}
      </ScrollView>

      {/* Bottom Navigation - Fixed */}
      <BottomNavRenderer role="customer" activeTab="templates" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: 100,
  },

  // Tabs
  tabsContainer: {
    flexDirection: "row",
    marginBottom: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  tab: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: Theme.colors.primary,
    backgroundColor: "#ECA83620",
  },
  tabText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.muted,
  },
  activeTabText: {
    color: Theme.colors.primary,
  },
});
