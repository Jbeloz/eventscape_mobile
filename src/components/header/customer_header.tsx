import { Pressable, StyleSheet, Text, View } from "react-native";
import { Theme } from "../../../constants/theme";

interface CustomerHeaderProps {
  showNotificationBell?: boolean;
  onNotificationPress?: () => void;
}

export default function CustomerHeader({
  showNotificationBell = true,
  onNotificationPress,
}: CustomerHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>EventScape</Text>
      {showNotificationBell && (
        <Pressable
          style={styles.notificationBell}
          onPress={onNotificationPress}
        >
          <Text style={styles.bellIcon}>🔔</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  headerText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 24,
    color: Theme.colors.text,
  },
  notificationBell: {
    padding: Theme.spacing.sm,
  },
  bellIcon: {
    fontSize: 24,
  },
});
