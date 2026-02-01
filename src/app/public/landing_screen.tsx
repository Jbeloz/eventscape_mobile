import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
    BackHandler,
    Dimensions,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    ToastAndroid,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme } from "../../../constants/theme";
import Footer from "../../components/Footer";
import Header from "../../components/header/header";

// Gallery placeholder data - Replace with actual images when available
const galleryItems = [
  { id: 1, title: "Wedding Event", color: "#FFB6C1" },
  { id: 2, title: "Corporate Gala", color: "#87CEEB" },
  { id: 3, title: "Birthday Bash", color: "#DDA0DD" },
  { id: 4, title: "Product Launch", color: "#F0E68C" },
  { id: 5, title: "Concert Night", color: "#98FB98" },
  { id: 6, title: "Grand Opening", color: "#FFA07A" },
];

const { width } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();
  const backPressedOnce = useRef(false);

  // Handle back button press - double tap to exit
  useEffect(() => {
    const backAction = () => {
      if (backPressedOnce.current) {
        // Second back press within 2 seconds - exit app
        BackHandler.exitApp();
        return true;
      } else {
        // First back press - show toast message
        backPressedOnce.current = true;
        
        // Show toast notification (non-blocking)
        if (Platform.OS === 'android') {
          ToastAndroid.show("Press back again to exit", ToastAndroid.SHORT);
        }
        
        // Reset the flag after 2 seconds
        setTimeout(() => {
          backPressedOnce.current = false;
        }, 2000);
        
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const weekenderOffers = [
    { icon: "🎯", title: "Catering" },
    { icon: "🏢", title: "Company Events" },
    { icon: "🎨", title: "Event Styling" },
    { icon: "📅", title: "On The Day Coordination" },
  ];

  const fullEventPackages = [
    { icon: "👶", title: "Baptism" },
    { icon: "🎂", title: "Birthday" },
    { icon: "💃", title: "Debut" },
    { icon: "💍", title: "Wedding" },
  ];

  const coreValues = ["Creativity", "Excellence", "Teamwork", "Integrity"];

  const expertise = [
    "Concert & Live Events",
    "Corporate & Government Events",
    "Wedding & Private Celebrations",
    "Stage, Sound & Lighting Production",
    "Event Design & Styling",
    "Event Management & Coordination",
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              Visualize Events in{"\n"}
              <Text style={styles.heroTitleHighlight}>2D & 3D</Text>
            </Text>

            <Text style={styles.heroDescription}>
              Plan, visualize, and execute your events with stunning 2D and 3D layouts
            </Text>

            <Pressable
              style={styles.getStartedButton}
              onPress={() => router.push("/auth")}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </Pressable>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          {[
            { number: "10,000+", label: "Templates" },
            { number: "50,000+", label: "Users" },
            { number: "100K+", label: "Events" },
          ].map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.statNumber}>{stat.number}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Gallery Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Featured Designs</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.galleryContainer}
            contentContainerStyle={styles.galleryContent}
          >
            {galleryItems.map((item) => (
              <View key={item.id} style={styles.galleryImageWrapper}>
                <View
                  style={[
                    styles.galleryPlaceholder,
                    { backgroundColor: item.color },
                  ]}
                >
                  <Text style={styles.galleryPlaceholderText}>
                    {item.title}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Services Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          
          {/* Weekender Offers */}
          <View style={styles.servicesCard}>
            <Text style={styles.servicesCardTitle}>Weekender Offers</Text>
            <View style={styles.servicesGrid}>
              {weekenderOffers.map((offer, index) => (
                <View key={index} style={styles.serviceItem}>
                  <Text style={styles.serviceIcon}>{offer.icon}</Text>
                  <Text style={styles.serviceText}>{offer.title}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Full Event Packages */}
          <View style={styles.servicesCard}>
            <Text style={styles.servicesCardTitle}>Full Event Packages</Text>
            <View style={styles.servicesGrid}>
              {fullEventPackages.map((pkg, index) => (
                <View key={index} style={styles.serviceItem}>
                  <Text style={styles.serviceIcon}>{pkg.icon}</Text>
                  <Text style={styles.serviceText}>{pkg.title}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>About Weekender Events</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              Weekender Prod & Event Management Services is a full-service events management 
              and production company dedicated to turning ideas into memorable experiences.
            </Text>
            
            <View style={styles.aboutHighlight}>
              <Text style={styles.aboutLabel}>Motto:</Text>
              <Text style={styles.aboutValue}>"Weekender Events: Let's make every moment count"</Text>
            </View>
            
            <View style={styles.aboutHighlight}>
              <Text style={styles.aboutLabel}>Vision:</Text>
              <Text style={styles.aboutValue}>
                Committed to turning every client's dream into reality by delivering 
                high-quality event concepts, reliable production, and exceptional customer care.
              </Text>
            </View>
            
            <View style={styles.aboutHighlight}>
              <Text style={styles.aboutLabel}>Mission:</Text>
              <Text style={styles.aboutValue}>To tell the stories that inspire and influence the audience.</Text>
            </View>
            
            <View style={styles.aboutHighlight}>
              <Text style={styles.aboutLabel}>Core Values:</Text>
              <View style={styles.valuesContainer}>
                {coreValues.map((value, index) => (
                  <View key={index} style={styles.valuePill}>
                    <Text style={styles.valueText}>{value}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.aboutHighlight}>
              <Text style={styles.aboutLabel}>Our Expertise:</Text>
              <View style={styles.expertiseContainer}>
                {expertise.map((item, index) => (
                  <View key={index} style={styles.expertiseItem}>
                    <View style={styles.expertiseBullet} />
                    <Text style={styles.expertiseText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Visualize Your Event?</Text>
          <Text style={styles.ctaDescription}>
            Start planning your perfect event with our 2D and 3D visualization tools
          </Text>
          <Pressable
            style={styles.ctaButton}
            onPress={() => router.push("/auth")}
          >
            <Text style={styles.ctaButtonText}>Start Planning Now</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingBottom: Theme.spacing.xl,
  },
  heroSection: {
    backgroundColor: Theme.colors.primary + "10",
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.xl * 1.5,
  },
  heroContent: {
    maxWidth: 500,
    alignSelf: "center",
    alignItems: "center",
  },
  heroTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 36,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
    lineHeight: 44,
    textAlign: "center",
  },
  heroTitleHighlight: {
    color: Theme.colors.primary,
    fontWeight: "800",
  },
  heroDescription: {
    fontFamily: Theme.fonts.regular,
    fontSize: 16,
    color: Theme.colors.muted,
    marginBottom: Theme.spacing.lg,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: "80%",
  },
  getStartedButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: 12,
    alignItems: "center",
    marginTop: Theme.spacing.md,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: "#FFFFFF",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.xl,
    backgroundColor: "#FFFFFF",
    marginTop: -20,
    borderRadius: 20,
    marginHorizontal: Theme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontFamily: Theme.fonts.bold,
    fontSize: 24,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.muted,
  },
  sectionContainer: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.xl,
  },
  sectionTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 24,
    marginBottom: Theme.spacing.lg,
    color: Theme.colors.text,
    textAlign: "center",
  },
  galleryContainer: {
    marginHorizontal: -Theme.spacing.lg,
  },
  galleryContent: {
    paddingHorizontal: Theme.spacing.lg,
  },
  galleryImageWrapper: {
    marginRight: Theme.spacing.md,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  galleryImage: {
    width: 250,
    height: 300,
    borderRadius: 16,
    resizeMode: "cover",
  },
  galleryPlaceholder: {
    width: 250,
    height: 300,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: Theme.spacing.md,
  },
  galleryPlaceholderText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  servicesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  servicesCardTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
    textAlign: "center",
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  serviceItem: {
    width: "48%",
    alignItems: "center",
    paddingVertical: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
  },
  serviceIcon: {
    fontSize: 32,
    marginBottom: Theme.spacing.sm,
  },
  serviceText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
    textAlign: "center",
  },
  aboutCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: Theme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  aboutText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 16,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.lg,
    lineHeight: 24,
  },
  aboutHighlight: {
    marginBottom: Theme.spacing.lg,
  },
  aboutLabel: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  aboutValue: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
    lineHeight: 20,
  },
  valuesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: Theme.spacing.sm,
  },
  valuePill: {
    backgroundColor: Theme.colors.primary + "20",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: 20,
    marginRight: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  valueText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    color: Theme.colors.primary,
  },
  expertiseContainer: {
    marginTop: Theme.spacing.sm,
  },
  expertiseItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.sm,
  },
  expertiseBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.primary,
    marginRight: Theme.spacing.sm,
  },
  expertiseText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
    flex: 1,
  },
  ctaSection: {
    backgroundColor: Theme.colors.primary,
    marginHorizontal: Theme.spacing.lg,
    borderRadius: 16,
    padding: Theme.spacing.xl,
    alignItems: "center",
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 24,
    color: "#FFFFFF",
    marginBottom: Theme.spacing.sm,
    textAlign: "center",
  },
  ctaDescription: {
    fontFamily: Theme.fonts.regular,
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
    marginBottom: Theme.spacing.lg,
    textAlign: "center",
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: 12,
    alignItems: "center",
  },
  ctaButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.primary,
  },
});
