import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Theme } from "../../../../constants/theme";

const VENUE_TEMPLATES = [
  {
    id: 1,
    title: "The Palm at San Francisco",
    address: "The Palm at San Francisco, 756 Esguerra Ave, San Francisco, CA",
    capacity: "250",
    venueType: "Ballroom and Hall",
    image: require("../../../../assets/images/wedding-placeholder.png"),
  },
  {
    id: 2,
    title: "Lian Gwen Venue",
    address: "Lian Gwen Venue, 123 Main St, New York, NY",
    capacity: "300",
    venueType: "Wedding Hall",
    image: require("../../../../assets/images/tech-placeholder.png"),
  },
  {
    id: 3,
    title: "Liora's Ballroom",
    address: "Liora's Ballroom, 456 Oak Rd, Los Angeles, CA",
    capacity: "200",
    venueType: "Event Space",
    image: require("../../../../assets/images/party-placeholder.png"),
  },
];

interface CustomerVenueTemplatesProps {
  onViewDetails: (templateId: number) => void;
}

export default function CustomerVenueTemplates({
  onViewDetails,
}: CustomerVenueTemplatesProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleViewDetails = (templateId: number) => {
    onViewDetails(templateId);
  };

  const filteredVenues = VENUE_TEMPLATES.filter((venue) =>
    venue.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>Venue Templates</Text>
        <Text style={styles.pageDescription}>
          Ready to use venue designs for your perfect event
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
          placeholder="Search venues..."
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

      {/* Venue Cards */}
      <View style={styles.cardsContainer}>
        {filteredVenues.map((venue) => (
          <View key={venue.id} style={styles.card}>
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
              <Text style={styles.cardTitle}>{venue.title}</Text>

              {/* Address */}
              <Text style={styles.cardAddress} numberOfLines={2}>
                {venue.address}
              </Text>

              {/* Details Section */}
              <View style={styles.detailsSection}>
                {/* Capacity */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Capacity:</Text>
                  <Text style={styles.detailValue}>
                    {venue.capacity} Persons (Pax)
                  </Text>
                </View>

                {/* Venue Type */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Venue Type:</Text>
                  <Text style={styles.detailValue}>{venue.venueType}</Text>
                </View>
              </View>

              {/* View Details Button */}
              <Pressable
                style={styles.viewDetailsButton}
                onPress={() => handleViewDetails(venue.id)}
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
  cardAddress: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: Theme.colors.muted,
    marginBottom: Theme.spacing.md,
    lineHeight: 18,
  },

  // Details Section
  detailsSection: {
    marginBottom: Theme.spacing.lg,
  },
  detailRow: {
    marginBottom: 8,
  },
  detailLabel: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: Theme.colors.muted,
    marginBottom: 2,
  },
  detailValue: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.text,
  },

  // View Details Button
  viewDetailsButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 6,
    paddingVertical: Theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Theme.spacing.md,
  },
  viewDetailsText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: "#FFFFFF",
  },
});
