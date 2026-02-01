import { View, Image, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme } from "../../constants/theme";

export default function Header() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Logo Circle */}
        <View style={styles.logoCircle}>
          <Image
            source={require("../../assets/images/WeekenderEventLogo.png")}
            style={styles.logo}
          />
        </View>

        {/* Text */}
        <Text style={styles.logoText}>Weekender Events</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Theme.colors.background,
  },
  container: {
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.lg,
    borderBottomWidth: 3,
    borderBottomColor: Theme.colors.black,
    gap: Theme.spacing.md,
    backgroundColor: Theme.colors.background,
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: Theme.colors.black,
  },
  logo: {
    width: 36,
    height: 36,
    resizeMode: "contain",
  },
  logoText: {
    fontFamily: "Poppins-Bold", // Make sure Poppins-Bold is added to your project
    fontSize: 24,
    color: Theme.colors.text,
  },
});