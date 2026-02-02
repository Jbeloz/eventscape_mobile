import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Theme } from "../../../../../constants/theme";
import TopBar from "../../../../components/top_bar";
import BottomNavRenderer from "../../../../components/user_navigation/bottom_nav/BottomNavRenderer";

interface Venue {
  id: string;
  name: string;
  address: string;
  type: string;
  capacity: string;
  image: string;
}

const MOCK_VENUES: Venue[] = [
  {
    id: "1",
    name: "The Palm at San Francisco",
    address: "The Palm at San Francisco, 756 Esguerra, Poblacion, Pullian, 3005 Bulacan",
    type: "Ballroom and Hall",
    capacity: "Capacity / Guest Limit: 250 Person (Pax)",
    image: "https://via.placeholder.com/300x200?text=The+Palm",
  },
  {
    id: "2",
    name: "Grand Hotel Ballroom",
    address: "123 Main Street, San Francisco, CA 94102",
    type: "Convention Center",
    capacity: "Capacity / Guest Limit: 500 Person (Pax)",
    image: "https://via.placeholder.com/300x200?text=Grand+Hotel",
  },
];

export default function VenueAdminMyVenue() {
  const router = useRouter();
  const [notificationCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVenues = MOCK_VENUES.filter((venue) =>
    venue.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar notificationCount={notificationCount} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Add Venue Button */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>My Venue</Text>
          <Pressable
            style={styles.addButton}
            onPress={() => router.push("/users/venue_administrator/my_venue/venue_admin_add_venue")}
          >
            <Text style={styles.addButtonText}>Add Venue</Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Here.."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="options" size={18} color="#999" />
        </View>

        {/* Venue Cards */}
        <View style={styles.venueList}>
          {filteredVenues.map((venue) => (
            <Pressable
              key={venue.id}
              style={styles.venueCard}
              onPress={() =>
                router.push({
                  pathname: "./venue_admin_venue_details",
                  params: { venueId: venue.id },
                })
              }
            >
              {/* Venue Images Container */}
              <View style={styles.imagesContainer}>
                <Image
                  source={{ uri: venue.image }}
                  style={styles.venueImage}
                />
                <Image
                  source={{ uri: venue.image }}
                  style={[styles.venueImage, styles.venueImageSecond]}
                />
              </View>

              {/* Venue Info */}
              <View style={styles.venueInfo}>
                <Text style={styles.venueName}>{venue.name}</Text>
                <Text style={styles.venueAddress}>{venue.address}</Text>

                <View style={styles.detailsRow}>
                  <Text style={styles.capacity}>{venue.capacity}</Text>
                </View>

                <View style={styles.typeRow}>
                  <Text style={styles.venueType}>Venue Type: {venue.type}</Text>
                </View>

                {/* View Details Button */}
                <Pressable style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>View Details</Text>
                </Pressable>
              </View>
            </Pressable>
          ))}
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
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: Theme.fonts.bold,
    fontSize: 24,
    color: Theme.colors.text,
  },
  addButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: "#FFFFFF",
  },

  // Search Bar
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },

  // Venue List
  venueList: {
    gap: 16,
  },
  venueCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },

  // Images Container
  imagesContainer: {
    flexDirection: "row",
    height: 180,
    backgroundColor: "#F0F0F0",
  },
  venueImage: {
    flex: 1,
    backgroundColor: "#E8E8E8",
  },
  venueImageSecond: {
    marginLeft: -2,
  },

  // Venue Info
  venueInfo: {
    padding: 16,
  },
  venueName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
    marginBottom: 6,
  },
  venueAddress: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: "#888888",
    marginBottom: 12,
    lineHeight: 18,
  },
  detailsRow: {
    marginBottom: 8,
  },
  capacity: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: "#666666",
  },
  typeRow: {
    marginBottom: 12,
  },
  venueType: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: "#666666",
  },

  // View Details Button
  viewButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  viewButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: "#FFFFFF",
  },
});
