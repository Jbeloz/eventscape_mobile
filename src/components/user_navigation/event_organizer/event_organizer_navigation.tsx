import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Theme } from "../../../../constants/theme";

type TabType = "home" | "activities" | "review" | "profile";

interface EventOrganizerNavigationProps {
  activeTab: TabType;
}

const NAV_ITEMS = [
  { id: "home", label: "Home", iconOutline: "home-outline", iconFilled: "home", page: "home" },
  { id: "activities", label: "Activities", iconOutline: "calendar-outline", iconFilled: "calendar", page: "activities" },
  { id: "review", label: "Reviews", iconOutline: "star-outline", iconFilled: "star", page: "review" },
  { id: "profile", label: "Profile", iconOutline: "person-outline", iconFilled: "person", page: "profile" },
];

export default function EventOrganizerNavigation({ activeTab }: EventOrganizerNavigationProps) {
  const router = useRouter();

  const handleTabPress = (page: string) => {
    router.push({
      pathname: "/users/event_organizer",
      params: { page },
    } as any);
  };

  return (
    <View style={styles.container}>
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <Pressable
            key={item.id}
            style={styles.tabButton}
            onPress={() => handleTabPress(item.page)}
          >
            <Ionicons
              name={isActive ? item.iconFilled : item.iconOutline as any}
              size={24}
              color={isActive ? Theme.colors.primary : Theme.colors.muted}
            />
            <Text
              style={[
                styles.tabLabel,
                isActive && styles.activeTabLabel,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingBottom: 8,
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    justifyContent: "center",
  },
  tabLabel: {
    fontFamily: Theme.fonts.regular,
    fontSize: 11,
    color: Theme.colors.muted,
    marginTop: 4,
  },
  activeTabLabel: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.semibold,
  },
});
