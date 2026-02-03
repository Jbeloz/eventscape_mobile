import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { useAuth } from "../../../../hooks/use-auth";
import { supabase } from "../../../../services/supabase";

interface Venue {
  venue_id: string;
  venue_name: string;
  street_address: string;
  barangay: string;
  city: string;
  province: string;
  max_capacity: number;
  venue_type_id: string;
  type_name?: string;
  image_uri?: string;
}

export default function VenueAdminMyVenue() {
  const router = useRouter();
  const { user } = useAuth();
  const [notificationCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch user ID and venues
  useEffect(() => {
    if (user?.id) {
      fetchUserIdAndVenues(user.id);
    }
  }, [user]);

  const fetchUserIdAndVenues = async (authId: string) => {
    try {
      setLoading(true);

      // First, get the user_id from the users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("user_id")
        .eq("auth_id", authId)
        .single();

      if (userError || !userData?.user_id) {
        console.error("Error fetching user:", userError);
        setLoading(false);
        return;
      }

      const userId = userData.user_id.toString();
      setCurrentUserId(userId);

      // Fetch all venues created by this user (simple query without complex joins)
      const { data: venuesData, error: venuesError } = await supabase
        .from("venues")
        .select("*")
        .eq("created_by", userId)
        .order("created_at", { ascending: false });

      if (venuesError) {
        console.error("Error fetching venues:", venuesError);
        setLoading(false);
        return;
      }

      // For each venue, fetch its type name and first image
      const formattedVenues: Venue[] = await Promise.all(
        (venuesData || []).map(async (venue: any) => {
          let typeName = "Unknown Type";
          let imageUri = "";

          // Fetch venue type
          if (venue.venue_type_id) {
            const { data: typeData } = await supabase
              .from("venue_types")
              .select("type_name")
              .eq("venue_type_id", venue.venue_type_id)
              .single();
            if (typeData) typeName = typeData.type_name;
          }

          // Fetch first image
          const { data: imagesData } = await supabase
            .from("venue_images")
            .select("image_path")
            .eq("venue_id", venue.venue_id)
            .limit(1);
          if (imagesData && imagesData.length > 0) {
            imageUri = imagesData[0].image_path;
          }

          return {
            venue_id: venue.venue_id,
            venue_name: venue.venue_name,
            street_address: venue.street_address,
            barangay: venue.barangay,
            city: venue.city,
            province: venue.province,
            max_capacity: venue.max_capacity,
            venue_type_id: venue.venue_type_id,
            type_name: typeName,
            image_uri: imageUri,
          };
        })
      );

      setVenues(formattedVenues);
    } catch (err) {
      console.error("Error in fetchUserIdAndVenues:", err);
      Alert.alert("Error", "Failed to load venues");
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = venues.filter((venue) =>
    venue.venue_name.toLowerCase().includes(searchQuery.toLowerCase())
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

        {/* Loading Indicator */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Theme.colors.primary} />
            <Text style={styles.loadingText}>Loading venues...</Text>
          </View>
        ) : filteredVenues.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>
              {venues.length === 0 ? "No venues yet. Create your first venue!" : "No venues match your search"}
            </Text>
          </View>
        ) : (
          /* Venue Cards */
          <View style={styles.venueList}>
            {filteredVenues.map((venue) => (
              <Pressable
                key={venue.venue_id}
                style={styles.venueCard}
                onPress={() =>
                  router.push({
                    pathname: "/users/venue_administrator/my_venue/venue_admin_venue_details",
                    params: { venueId: venue.venue_id },
                  })
                }
              >
                {/* Venue Images Container */}
                <View style={styles.imagesContainer}>
                  {venue.image_uri ? (
                    <Image
                      source={{ uri: venue.image_uri }}
                      style={styles.venueImage}
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Ionicons name="image-outline" size={40} color={Theme.colors.muted} />
                    </View>
                  )}
                </View>

                {/* Venue Info */}
                <View style={styles.venueInfo}>
                  <Text style={styles.venueName}>{venue.venue_name}</Text>
                  <Text style={styles.venueAddress}>
                    {venue.street_address}, {venue.barangay}, {venue.city}, {venue.province}
                  </Text>

                  <View style={styles.detailsRow}>
                    <Text style={styles.capacity}>
                      Capacity / Guest Limit: {venue.max_capacity} Person (Pax)
                    </Text>
                  </View>

                  <View style={styles.typeRow}>
                    <Text style={styles.venueType}>Venue Type: {venue.type_name}</Text>
                  </View>

                  {/* View Details Button */}
                  <Pressable 
                    style={styles.viewButton}
                    onPress={() =>
                      router.push({
                        pathname: "/users/venue_administrator/my_venue/venue_admin_venue_details",
                        params: { venueId: venue.venue_id },
                      })
                    }
                  >
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        )}
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

  // Loading & Empty States
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: "#999",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  placeholderImage: {
    width: "100%",
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 6,
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
