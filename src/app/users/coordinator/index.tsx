import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, SafeAreaView, StyleSheet } from "react-native";
import { Theme } from "../../../../constants/theme";
import TopBar from "../../../components/top_bar";
import BottomNavRenderer from "../../../components/user_navigation/bottom_nav/BottomNavRenderer";
import CoordinatorCalendar from "./coordinator_calendar";
import CoordinatorHome from "./coordinator_home";
import CoordinatorProfile from "./coordinator_profile";
import CoordinatorProjects from "./coordinator_projects";

type PageType = "home" | "calendar" | "projects" | "profile";

export default function CoordinatorIndex() {
  const router = useRouter();
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
      case "calendar":
        return <CoordinatorCalendar />;
      case "projects":
        return <CoordinatorProjects />;
      case "profile":
        return <CoordinatorProfile />;
      case "home":
      default:
        return <CoordinatorHome />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar notificationCount={0} />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {renderPage()}
      </Animated.View>
      <BottomNavRenderer role="coordinator" activeTab={currentPage} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  container: {
    flex: 1,
  },
});

