import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Theme } from "../../../../constants/theme";
import { NAV_CONFIG, UserRole } from "./nav_config";

interface BottomNavRendererProps {
  role: UserRole;
  activeTab?: string;
  baseRoute?: string;
}

/**
 * Reusable Bottom Navigation Component
 * 
 * Props:
 * - role: The user role (customer, event_organizer, coordinator, venue_administrator, admin)
 * - activeTab: Currently active tab ID (optional, defaults to first item)
 * - baseRoute: The base route path (e.g., "/users/customer", "/users/coordinator")
 *   If not provided, it derives from role
 */
export default function BottomNavRenderer({
  role,
  activeTab,
  baseRoute,
}: BottomNavRendererProps) {
  const router = useRouter();
  const items = NAV_CONFIG[role];

  if (!items || items.length === 0) {
    console.warn(`No navigation items configured for role: ${role}`);
    return null;
  }

  // Default base route based on role
  const defaultBaseRoute = `/users/${role}`;
  const route = baseRoute || defaultBaseRoute;

  const handleTabPress = (page: string) => {
    router.push({
      pathname: route,
      params: { page },
    } as any);
  };

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <Pressable
            key={item.id}
            style={styles.tabButton}
            onPress={() => handleTabPress(item.page)}
            accessibilityLabel={item.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Ionicons
              name={(isActive ? item.iconFilled : item.iconOutline) as any}
              size={24}
              color={isActive ? Theme.colors.primary : Theme.colors.muted}
            />
            <Text
              style={[
                styles.tabLabel,
                isActive && styles.activeTabLabel,
              ]}
              numberOfLines={1}
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
