import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Theme } from "../../../../../constants/theme";
import TopBar from "../../../../components/top_bar";
import BottomNavRenderer from "../../../../components/user_navigation/bottom_nav/BottomNavRenderer";

interface VenueDetails {
  name: string;
  address: string;
  type: string;
  capacity: string;
  image: string;
  description: string;
  amenities: string[];
  priceRange: string;
  availability: string;
}

const VENUE_DATA: Record<string, VenueDetails> = {
  "1": {
    name: "The Palm at San Francisco",
    address: "The Palm at San Francisco, 756 Esguerra, Poblacion, Pullian, 3005 Bulacan",
    type: "Ballroom and Hall",
    capacity: "250 Person (Pax)",
    image: "https://via.placeholder.com/400x250?text=The+Palm",
    description:
      "A premium venue perfect for weddings, corporate events, and special occasions. Features modern facilities and excellent service.",
    amenities: [
      "Air Conditioning",
      "Parking Available",
      "Sound System",
      "Lighting Setup",
      "Tables & Chairs",
    ],
    priceRange: "₱50,000 - ₱200,000",
    availability: "Available for bookings",
  },
};

export default function VenueAdminVenueDetails() {
  const router = useRouter();
  const { venueId } = useLocalSearchParams();
  const [notificationCount] = useState(0);

  const venue = VENUE_DATA[venueId as string] || VENUE_DATA["1"];

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar notificationCount={notificationCount} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Back Button Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={Theme.colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Venue Details</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Venue Image */}
        <Image source={{ uri: venue.image }} style={styles.venueImage} />

        {/* Venue Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.venueName}>{venue.name}</Text>

          {/* Address */}
          <View style={styles.infoSection}>
            <Ionicons
              name="location-outline"
              size={16}
              color={Theme.colors.primary}
              style={styles.icon}
            />
            <Text style={styles.address}>{venue.address}</Text>
          </View>

          {/* Venue Type */}
          <View style={styles.infoSection}>
            <Ionicons
              name="home-outline"
              size={16}
              color={Theme.colors.primary}
              style={styles.icon}
            />
            <Text style={styles.detailText}>
              <Text style={styles.label}>Venue Type: </Text>
              {venue.type}
            </Text>
          </View>

          {/* Capacity */}
          <View style={styles.infoSection}>
            <Ionicons
              name="people-outline"
              size={16}
              color={Theme.colors.primary}
              style={styles.icon}
            />
            <Text style={styles.detailText}>
              <Text style={styles.label}>Capacity: </Text>
              {venue.capacity}
            </Text>
          </View>

          {/* Price Range */}
          <View style={styles.infoSection}>
            <Ionicons
              name="pricetag-outline"
              size={16}
              color={Theme.colors.primary}
              style={styles.icon}
            />
            <Text style={styles.detailText}>
              <Text style={styles.label}>Price Range: </Text>
              {venue.priceRange}
            </Text>
          </View>

          {/* Availability */}
          <View style={styles.infoSection}>
            <Ionicons
              name="checkmark-circle-outline"
              size={16}
              color="#27AE60"
              style={styles.icon}
            />
            <Text style={[styles.detailText, { color: "#27AE60" }]}>
              {venue.availability}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{venue.description}</Text>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {venue.amenities.map((amenity: string, index: number) => (
              <View key={index} style={styles.amenityItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={Theme.colors.primary}
                  style={styles.amenityIcon}
                />
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.editButton}
            onPress={() =>
              router.push("/users/venue_administrator/my_venue/venue_admin_add_venue")
            }
          >
            <Ionicons name="pencil-outline" size={18} color={Theme.colors.primary} />
            <Text style={styles.editButtonText}>Edit Venue</Text>
          </Pressable>

          <Pressable style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={18} color="#FF4444" />
            <Text style={styles.deleteButtonText}>Delete Venue</Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomNavRenderer role="venue_administrator" activeTab="my_venue" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },

  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text,
  },

  // Venue Image
  venueImage: {
    width: "100%",
    height: 240,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#F0F0F0",
  },

  // Info Card
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    padding: 16,
    marginBottom: 16,
  },
  venueName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text,
    marginBottom: 16,
  },

  // Info Section
  infoSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  address: {
    flex: 1,
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: "#888888",
    lineHeight: 18,
  },
  detailText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: "#666666",
  },
  label: {
    fontFamily: Theme.fonts.semibold,
    color: Theme.colors.text,
  },

  // Section
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: 12,
  },
  description: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: "#666666",
    lineHeight: 18,
  },

  // Amenities Grid
  amenitiesGrid: {
    gap: 10,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  amenityIcon: {
    marginRight: 8,
  },
  amenityText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: "#666666",
  },

  // Buttons
  buttonContainer: {
    gap: 12,
  },
  editButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  editButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.primary,
  },
  deleteButton: {
    backgroundColor: "#FFF5F5",
    borderWidth: 2,
    borderColor: "#FF4444",
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  deleteButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: "#FF4444",
  },
});
