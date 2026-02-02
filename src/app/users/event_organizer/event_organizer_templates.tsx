import { useState } from "react";
import {
  Dimensions,
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

type TemplateTab = "theme" | "venue";

interface ThemeTemplate {
  id: number;
  title: string;
  description: string;
  eventType: string;
  colors: string[];
  emoji: string;
}

interface VenueTemplate {
  id: number;
  title: string;
  description: string;
  eventType: string;
  emoji: string;
}

const THEME_TEMPLATES: ThemeTemplate[] = [
  {
    id: 1,
    title: "Classic Elegance",
    description: "Timeless and sophisticated design",
    eventType: "Wedding",
    colors: ["#1A3A52", "#C0A080", "#F5E6D3", "#FFFFFF"],
    emoji: "💍",
  },
  {
    id: 2,
    title: "Modern Minimalist",
    description: "Clean lines and contemporary style",
    eventType: "Corporate",
    colors: ["#2C3E50", "#ECF0F1", "#3498DB", "#95A5A6"],
    emoji: "✨",
  },
  {
    id: 3,
    title: "Tropical Paradise",
    description: "Vibrant and festive atmosphere",
    eventType: "Birthday",
    colors: ["#FF6B6B", "#FFA500", "#4ECDC4", "#FFE66D"],
    emoji: "🌴",
  },
];

const VENUE_TEMPLATES: VenueTemplate[] = [
  {
    id: 1,
    title: "Ballroom Elegance",
    description: "Grand and spacious ballroom",
    eventType: "Wedding",
    emoji: "🏛️",
  },
  {
    id: 2,
    title: "Garden Venue",
    description: "Outdoor garden setting",
    eventType: "Wedding",
    emoji: "🌹",
  },
  {
    id: 3,
    title: "Conference Hall",
    description: "Professional conference setup",
    eventType: "Corporate",
    emoji: "🏢",
  },
];

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - Theme.spacing.md * 2 - Theme.spacing.sm) / 2;

export default function EventOrganizerTemplates() {
  const [activeTab, setActiveTab] = useState<TemplateTab>("theme");

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar notificationCount={0} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Page Title */}
        <Text style={styles.pageTitle}>Templates</Text>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tab, activeTab === "theme" && styles.tabActive]}
            onPress={() => setActiveTab("theme")}
          >
            <Text
              style={[styles.tabText, activeTab === "theme" && styles.tabTextActive]}
            >
              Theme Templates
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === "venue" && styles.tabActive]}
            onPress={() => setActiveTab("venue")}
          >
            <Text
              style={[styles.tabText, activeTab === "venue" && styles.tabTextActive]}
            >
              Venue Templates
            </Text>
          </Pressable>
        </View>

        {/* Theme Templates */}
        {activeTab === "theme" && (
          <View style={styles.gridContainer}>
            {THEME_TEMPLATES.map((template) => (
              <View key={template.id} style={[styles.templateCard, { width: CARD_WIDTH }]}>
                <View style={styles.templateImageContainer}>
                  <Text style={styles.templateEmoji}>{template.emoji}</Text>
                </View>
                <Text style={styles.templateTitle}>{template.title}</Text>
                <Text style={styles.templateDescription}>{template.description}</Text>
                <View style={styles.colorPalette}>
                  {template.colors.map((color, index) => (
                    <View
                      key={index}
                      style={[styles.colorSwatch, { backgroundColor: color }]}
                    />
                  ))}
                </View>
                <View style={styles.eventTypeTag}>
                  <Text style={styles.eventTypeText}>{template.eventType}</Text>
                </View>
                <Pressable style={styles.selectButton}>
                  <Text style={styles.selectButtonText}>Select</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Venue Templates */}
        {activeTab === "venue" && (
          <View style={styles.gridContainer}>
            {VENUE_TEMPLATES.map((template) => (
              <View key={template.id} style={[styles.templateCard, { width: CARD_WIDTH }]}>
                <View style={styles.templateImageContainer}>
                  <Text style={styles.templateEmoji}>{template.emoji}</Text>
                </View>
                <Text style={styles.templateTitle}>{template.title}</Text>
                <Text style={styles.templateDescription}>{template.description}</Text>
                <View style={styles.eventTypeTag}>
                  <Text style={styles.eventTypeText}>{template.eventType}</Text>
                </View>
                <Pressable style={styles.selectButton}>
                  <Text style={styles.selectButtonText}>Select</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <BottomNavRenderer role="event_organizer" activeTab="activities" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 24,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: Theme.colors.primary,
    backgroundColor: "rgba(236, 168, 54, 0.12)",
  },
  tabText: {
    fontSize: 13,
    fontFamily: Theme.fonts.semibold,
    color: "#999999",
    textAlign: "center",
  },
  tabTextActive: {
    color: Theme.colors.primary,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  templateCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    alignItems: "center",
  },
  templateImageContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: "#E8F8F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  templateEmoji: {
    fontSize: 48,
  },
  templateTitle: {
    fontSize: 14,
    fontFamily: Theme.fonts.semibold,
    color: Theme.colors.text,
    marginBottom: 4,
    textAlign: "center",
  },
  templateDescription: {
    fontSize: 11,
    fontFamily: Theme.fonts.regular,
    color: "#999999",
    textAlign: "center",
    marginBottom: 12,
  },
  colorPalette: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  eventTypeTag: {
    backgroundColor: "#E8F8F5",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  eventTypeText: {
    fontSize: 10,
    fontFamily: Theme.fonts.semibold,
    color: Theme.colors.primary,
  },
  selectButton: {
    width: "100%",
    paddingVertical: 10,
    backgroundColor: Theme.colors.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  selectButtonText: {
    fontSize: 12,
    fontFamily: Theme.fonts.semibold,
    color: "#FFFFFF",
  },
});
