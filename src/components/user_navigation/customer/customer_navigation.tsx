import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Theme } from "../../../../constants/theme";

type TabType = "home" | "templates" | "my_edit" | "my_event" | "profile";

interface BottomNavigationProps {
  activeTab: TabType;
}

const NAV_ITEMS = [
  { id: "home", label: "Home", iconOutline: "home-outline", iconFilled: "home", page: "home" },
  { id: "templates", label: "Templates", iconOutline: "document-outline", iconFilled: "document", page: "templates" },
  { id: "my_edit", label: "My Edit", iconOutline: "pencil-outline", iconFilled: "pencil", page: "my_edit" },
  { id: "my_event", label: "My Event", iconOutline: "calendar-outline", iconFilled: "calendar", page: "my_event" },
  { id: "profile", label: "Profile", iconOutline: "person-outline", iconFilled: "person", page: "profile" },
];

export default function BottomNavigation({ activeTab }: BottomNavigationProps) {
  const router = useRouter();

  const handleTabPress = (page: string) => {
    router.push({
      pathname: "/users/customer",
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
