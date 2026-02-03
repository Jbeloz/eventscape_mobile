import { useLocalSearchParams } from "expo-router";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { Theme } from "../../../../constants/theme";
import TopBar from "../../../components/top_bar";
import BottomNavRenderer from "../../../components/user_navigation/bottom_nav/BottomNavRenderer";
import CoordinatorHome from "./coordinator_home";
import CoordinatorCalendar from "./coordinator_calendar";
import CoordinatorProjects from "./coordinator_projects";
import CoordinatorProfile from "./coordinator_profile";

type PageType = "home" | "calendar" | "projects" | "profile";

export default function CoordinatorIndex() {
  const params = useLocalSearchParams();
  const currentPage = (params.page as PageType) || "home";

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
      <View style={styles.container}>{renderPage()}</View>
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

