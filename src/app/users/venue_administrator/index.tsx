import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import AddSchedule from "./add_schedule";
import VenueAdminAddVenue from "./my_venue/venue_admin_add_venue";
import VenueAdminMyVenue from "./my_venue/venue_admin_my_venue";
import SeasonalRates from "./seasonal_rates";
import VenueAdminCalendar from "./venue_admin_calendar";
import VenueAdminHome from "./venue_admin_home";
import VenueAdminProfile from "./venue_admin_profile";
import VenueAdminVenues from "./venue_admin_venues";

type PageType = "home" | "venues" | "calendar" | "profile" | "add_venue" | "my_venue" | "seasonal_rates" | "add_schedule";

export default function VenueAdministratorIndex() {
  const params = useLocalSearchParams();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  // Get the page from params or default to home
  const currentPage = (params.page as PageType) || "home";

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
