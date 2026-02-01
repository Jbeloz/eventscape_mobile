import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { Theme } from "../../../../constants/theme";

const THEME_TEMPLATES = [
  {
    id: 1,
    title: "Classic Elegance",
    description: "Timeless and sophisticated design",
    eventType: "Wedding",
    colors: ["#FFFFFF", "#C0C0C0", "#D4AF37"],
    image: require("../../../../assets/images/wedding-placeholder.png"),
  },
  {
    id: 2,
    title: "Tech Future",
    description: "Modern and innovative aesthetic",
    eventType: "Tech Conference",
    colors: ["#000000", "#0066FF", "#00FF00"],
    image: require("../../../../assets/images/tech-placeholder.png"),
  },
  {
    id: 3,
    title: "Princess Party",
    description: "Fun and festive celebration",
    eventType: "Birthday",
    colors: ["#FFB6C1", "#FF69B4", "#FFD700"],
    image: require("../../../../assets/images/party-placeholder.png"),
  },
];

interface CustomerThemeTemplatesProps {
  onViewDetails: (templateId: number) => void;
}

export default function CustomerThemeTemplates({
  onViewDetails,
}: CustomerThemeTemplatesProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleViewDetails = (templateId: number) => {
    onViewDetails(templateId);
  };

  const filteredTemplates = THEME_TEMPLATES.filter((template) =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>Theme Templates</Text>
        <Text style={styles.pageDescription}>
          Explore a collection of beautifully designed theme templates for your
          events
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={Theme.colors.muted}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search templates..."
          placeholderTextColor={Theme.colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons
          name="options"
          size={20}
          color={Theme.colors.muted}
          style={styles.filterIcon}
        />
      </View>

      {/* Theme Cards */}
      <View style={styles.cardsContainer}>
        {filteredTemplates.map((template) => (
          <View key={template.id} style={styles.card}>
            {/* Card Image */}
            <View style={styles.cardImageContainer}>
              <View style={styles.placeholderImage}>
                <Ionicons
                  name="image"
                  size={40}
                  color={Theme.colors.muted}
                />
              </View>
            </View>

            {/* Card Content */}
            <View style={styles.cardContent}>
              {/* Title */}
              <Text style={styles.cardTitle}>{template.title}</Text>

              {/* Description */}
              <Text style={styles.cardDescription}>
                {template.description}
              </Text>

              {/* Event Type Tag */}
              <View style={styles.eventTypeTag}>
                <Text style={styles.eventTypeText}>{template.eventType}</Text>
              </View>

              {/* Color Palette */}
              <View style={styles.colorPaletteContainer}>
                {template.colors.map((color, index) => (
                  <View
                    key={index}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color },
                    ]}
                  />
                ))}
              </View>

              {/* View Details Button */}
              <Pressable
                style={styles.viewDetailsButton}
                onPress={() => handleViewDetails(template.id)}
              >
                <Text style={styles.viewDetailsText}>View Details</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  // Title Section
  titleSection: {
    marginBottom: Theme.spacing.lg,
  },
  pageTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 22,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  pageDescription: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.muted,
  },

  // Search Bar
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    height: 48,
  },
  searchIcon: {
    marginRight: Theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  filterIcon: {
    marginLeft: Theme.spacing.sm,
  },

  // Cards
  cardsContainer: {
    gap: Theme.spacing.lg,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  // Card Image
  cardImageContainer: {
    width: "100%",
    height: 180,
    backgroundColor: "#F0F0F0",
  },
  placeholderImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8E8E8",
  },

  // Card Content
  cardContent: {
    padding: Theme.spacing.lg,
  },
  cardTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  cardDescription: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.muted,
    marginBottom: Theme.spacing.md,
  },

  // Event Type Tag
  eventTypeTag: {
    alignSelf: "flex-start",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: 12,
    marginBottom: Theme.spacing.md,
  },
  eventTypeText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: Theme.colors.text,
  },

  // Color Palette
  colorPaletteContainer: {
    flexDirection: "row",
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CCCCCC",
  },

  // View Details Button
  viewDetailsButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 6,
    paddingVertical: Theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  viewDetailsText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: "#FFFFFF",
  },
});
