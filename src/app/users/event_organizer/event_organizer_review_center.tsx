import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme } from "../../../../constants/theme";
import TopBar from "../../../components/top_bar";
import BottomNavRenderer from "../../../components/user_navigation/bottom_nav/BottomNavRenderer";

interface Review {
  id: number;
  clientName: string;
  eventTitle: string;
  guestCount: number;
  rating: number;
  comment: string;
  emoji: string;
}

const REVIEWS: Review[] = [
  {
    id: 1,
    clientName: "Sarah Johnson",
    eventTitle: "Summer Wedding",
    guestCount: 150,
    rating: 5,
    comment: "Absolutely amazing event! Everything was perfect.",
    emoji: "💍",
  },
  {
    id: 2,
    clientName: "Michael Chen",
    eventTitle: "Corporate Gala",
    guestCount: 300,
    rating: 4,
    comment: "Great planning and execution. Minor timing issue.",
    emoji: "🎩",
  },
  {
    id: 3,
    clientName: "Emma Wilson",
    eventTitle: "Birthday Celebration",
    guestCount: 80,
    rating: 5,
    comment: "The team was professional and attentive throughout!",
    emoji: "🎉",
  },
];

export default function EventOrganizerReviewCenter() {
  const [searchQuery, setSearchQuery] = useState("");

  const averageRating = (REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length).toFixed(1);
  const totalReviews = REVIEWS.length;
  const fiveStarCount = REVIEWS.filter((r) => r.rating === 5).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar notificationCount={0} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Page Title */}
        <Text style={styles.pageTitle}>Review Center</Text>

        {/* Stats Summary Card */}
        <View style={styles.statsSummaryCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{averageRating}</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
              <View style={styles.starsRow}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < Math.floor(parseFloat(averageRating)) ? "star" : "star-outline"}
                    size={14}
                    color={Theme.colors.primary}
                  />
                ))}
              </View>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalReviews}</Text>
              <Text style={styles.statLabel}>Total Reviews</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{fiveStarCount}</Text>
              <Text style={styles.statLabel}>5-Star Reviews</Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={Theme.colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reviews..."
            placeholderTextColor={Theme.colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Review Feed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          {REVIEWS.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewImageContainer}>
                <Text style={styles.reviewEmoji}>{review.emoji}</Text>
              </View>

              <View style={styles.reviewContent}>
                <Text style={styles.reviewClientName}>{review.clientName}</Text>
                <Text style={styles.reviewEventTitle}>{review.eventTitle}</Text>
                <View style={styles.reviewMetaRow}>
                  <Ionicons name="people-outline" size={12} color={Theme.colors.muted} />
                  <Text style={styles.reviewMeta}>{review.guestCount} guests</Text>
                </View>
                <View style={styles.starsRow}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < review.rating ? "star" : "star-outline"}
                      size={14}
                      color={Theme.colors.primary}
                    />
                  ))}
                </View>
                <Text style={styles.reviewComment} numberOfLines={2}>
                  {review.comment}
                </Text>
              </View>

              <Pressable style={styles.viewReviewButton}>
                <Ionicons name="arrow-forward" size={18} color={Theme.colors.primary} />
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomNavRenderer role="event_organizer" activeTab="review" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 24,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    marginBottom: 16,
  },
  statsSummaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.primary,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: Theme.fonts.regular,
    color: "#999999",
  },
  starsRow: {
    flexDirection: "row",
    gap: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Theme.fonts.semibold,
    color: Theme.colors.text,
    marginBottom: 16,
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  reviewImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#E8F8F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  reviewEmoji: {
    fontSize: 28,
  },
  reviewContent: {
    flex: 1,
  },
  reviewClientName: {
    fontSize: 14,
    fontFamily: Theme.fonts.semibold,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  reviewEventTitle: {
    fontSize: 12,
    fontFamily: Theme.fonts.regular,
    color: "#999999",
    marginBottom: 8,
  },
  reviewMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  reviewMeta: {
    fontSize: 11,
    fontFamily: Theme.fonts.regular,
    color: "#999999",
  },
  reviewComment: {
    fontSize: 11,
    fontFamily: Theme.fonts.regular,
    color: "#999999",
    marginTop: 8,
    lineHeight: 16,
  },
  viewReviewButton: {
    marginLeft: 12,
    marginTop: 4,
  },
});
