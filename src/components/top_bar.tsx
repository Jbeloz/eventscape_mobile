import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { Theme } from "../../constants/theme";

interface TopBarProps {
  notificationCount?: number;
}

export default function TopBar({ notificationCount = 0 }: TopBarProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Ionicons
          name="sparkles"
          size={24}
          color={Theme.colors.primary}
          style={styles.logo}
        />
        <Text style={styles.logoText}>EventScape</Text>
      </View>
      <View style={styles.notificationContainer}>
        <Ionicons
          name="notifications-outline"
          size={24}
          color={Theme.colors.text}
        />
        {notificationCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>{notificationCount}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    marginRight: Theme.spacing.sm,
  },
  logoText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 20,
    color: Theme.colors.text,
  },
  notificationContainer: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FF4444",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontFamily: Theme.fonts.bold,
  },
});
