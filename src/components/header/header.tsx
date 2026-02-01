import { StyleSheet, Text, View } from "react-native";
import { Theme } from "../../../constants/theme";

export default function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>EventScape</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  headerText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 24,
    color: Theme.colors.text,
  },
});
