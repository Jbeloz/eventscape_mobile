import { StyleSheet, Text, View } from "react-native";
import { Theme } from "../../constants/theme";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        <Text style={{ fontStyle: "italic" }}>Weekender Events Production</Text>
      </Text>
      <Text style={styles.footerSubText}>
        © {currentYear} EventScape. All rights reserved.
      </Text>
      <Text style={styles.footerLink}>Weekender Events & Production Services</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.xl,
    alignItems: "center",
    marginTop: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  footerText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  footerSubText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.muted,
    marginBottom: Theme.spacing.sm,
  },
  footerLink: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: Theme.colors.primary,
  },
});
