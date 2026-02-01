import { StyleSheet, View } from "react-native";
import { Theme } from "../../../../constants/theme";

export default function EventOrganizerNavigation() {
  return (
    <View style={styles.navigation}>
      {/* Navigation content will be implemented here */}
    </View>
  );
}

const styles = StyleSheet.create({
  navigation: {
    backgroundColor: Theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
  },
});
