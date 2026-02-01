import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import CustomerHome from "./customer_home";
import CustomerMyEdit from "./customer_my_edit";
import CustomerMyEvents from "./customer_my_event";
import CustomerProfile from "./customer_profile";
import CustomerTemplates from "./customer_template";

type PageType = "home" | "my_edit" | "my_event" | "profile" | "templates";

export default function CustomerIndex() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  // Get the page from params or default to home
  const currentPage = (params.page as PageType) || "home";

  useEffect(() => {
    // Fade out and in when page changes - matching auth/index transition
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
      case "my_edit":
        return <CustomerMyEdit />;
      case "my_event":
        return <CustomerMyEvents />;
      case "profile":
        return <CustomerProfile />;
      case "templates":
        return <CustomerTemplates />;
      case "home":
      default:
        return <CustomerHome />;
    }
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, overflow: 'hidden' }}>
      {renderPage()}
    </Animated.View>
  );
}
