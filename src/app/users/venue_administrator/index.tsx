import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import VenueDashboard from "../../../components/VenueDashboard";
import { useAuth } from "../../../hooks/use-auth";
import { supabase } from "../../../services/supabase";
import AddSchedule from "./add_schedule";
import VenueAdminAddVenue from "./my_venue/venue_admin_add_venue";
import VenueAdminMyVenue from "./my_venue/venue_admin_my_venue";
import SeasonalRates from "./seasonal_rates";
import VenueAdminCalendar from "./venue_admin_calendar";
import VenueAdminHome from "./venue_admin_home";
import VenueAdminProfile from "./venue_admin_profile";
import VenueAdminVenues from "./venue_admin_venues";

type PageType = "home" | "venues" | "calendar" | "profile" | "add_venue" | "my_venue" | "seasonal_rates" | "add_schedule" | "venue_dashboard";

export default function VenueAdministratorIndex() {
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [firstVenueId, setFirstVenueId] = useState<number | null>(null);
  
  // Get the page from params or default to home
  const currentPage = (params.page as PageType) || "home";

  // Load user's first venue on mount
  useEffect(() => {
    if (user?.id) {
      loadFirstVenue(user.id);
    }
  }, [user]);

  const loadFirstVenue = async (authId: string) => {
    try {
      // Get first venue from ALL venues (everyone can see all venues)
      const { data: venuesData } = await supabase
        .from("venues")
        .select("venue_id")
        .order("created_at", { ascending: false })
        .limit(1);

      if (venuesData && venuesData.length > 0) {
        setFirstVenueId(venuesData[0].venue_id);
      }
    } catch (err) {
      console.error("Error loading first venue:", err);
    }
  };

  useEffect(() => {
    // Fade out and in when page changes
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 10,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case "venues":
        return <VenueAdminVenues />;
      case "calendar":
        return <VenueAdminCalendar />;
      case "seasonal_rates":
        return <SeasonalRates />;
      case "add_schedule":
        return <AddSchedule />;
      case "profile":
        return <VenueAdminProfile />;
      case "add_venue":
        return <VenueAdminAddVenue />;
      case "my_venue":
        return <VenueAdminMyVenue />;
      case "venue_dashboard":
        // Get venueId from params, or use user's first venue, or default to 1
        const venueId = params.venueId 
          ? parseInt(params.venueId as string, 10) 
          : (firstVenueId || 1);
        return <VenueDashboard venueId={venueId} />;
      case "home":
      default:
        return <VenueAdminHome />;
    }
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, overflow: 'hidden' }}>
      {renderPage()}
    </Animated.View>
  );
}
