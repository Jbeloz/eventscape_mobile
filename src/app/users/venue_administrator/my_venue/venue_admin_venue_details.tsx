import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Theme } from "../../../../../constants/theme";
import TopBar from "../../../../components/top_bar";
import BottomNavRenderer from "../../../../components/user_navigation/bottom_nav/BottomNavRenderer";
import VenueFloorPlanVisualizer from "../../../../components/VenueFloorPlanVisualizer";
import { supabase } from "../../../../services/supabase";

interface VenueDetailsData {
  venue_id: string;
  venue_name: string;
  street_address: string;
  barangay: string;
  city: string;
  province: string;
  zip_code: string;
  max_capacity: number;
  description: string;
  type_name: string;
  images: string[];
  specifications: Array<{ name: string; value: string; notes: string }>;
  rules: string[];
  facilities: string[];
  floorPlan: { length: number; width: number; height: number; area_sqm: number } | null;
  baseRate: { rate_type: string; base_price: number; weekend_price: number; holiday_price: number; min_hours: number } | null;
  packages: Array<{ package_name: string; duration_hours: number; base_price: number; inclusions: string[] }>;
  overtimeRates: Array<{ rate_type: string; price_per_hour: number; start_hour: number; end_hour: number }>;
  contacts: Array<{ contact_type: string; contact_value: string }>;
  eventTypes: string[];
  doors: Array<{ door_id: number; door_type: string; width: number; height: number; door_offset: number; corner_position: string; swing_direction: string; hinge_position: string; wall: string }>;
}

export default function VenueAdminVenueDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const venueId = Array.isArray(params.venueId) ? params.venueId[0] : params.venueId;
  const [notificationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [venueData, setVenueData] = useState<VenueDetailsData | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    rules: true,
    specs: false,
    facilities: false,
    packages: false,
  });

  useEffect(() => {
    if (venueId) {
      fetchVenueDetails(venueId as string);
    }
  }, [venueId]);

  const fetchVenueDetails = async (id: string) => {
    try {
      setLoading(true);

      // Fetch main venue data
      const { data: venueData, error: venueError } = await supabase
        .from("venues")
        .select("*")
        .eq("venue_id", id)
        .single();

      if (venueError) throw venueError;

      // Fetch venue type from venue_venue_types junction table
      let typeName = "Unknown";
      const { data: venueTypeData, error: venueTypeError } = await supabase
        .from("venue_venue_types")
        .select("venue_type_id")
        .eq("venue_id", venueId)
        .single();

      if (!venueTypeError && venueTypeData?.venue_type_id) {
        const { data: typeData, error: typeError } = await supabase
          .from("venue_types")
          .select("type_name")
          .eq("venue_type_id", venueTypeData.venue_type_id)
          .single();
        if (typeError) {
          console.warn("Error fetching venue type:", typeError);
        }
        if (typeData?.type_name) {
          typeName = typeData.type_name;
          console.log("✅ Venue type fetched:", typeName);
        } else {
          console.warn("No type name found for venue_type_id:", venueTypeData.venue_type_id);
        }
      } else {
        console.warn("No venue type assigned for this venue");
      }

      // Fetch all related data in parallel
      const [imagesRes, specsRes, rulesRes, facilitiesRes, floorPlanRes, rateRes, packagesRes, overtimeRes, contactsRes, eventTypesRes, doorsRes] = await Promise.all([
        supabase.from("venue_images").select("image_path").eq("venue_id", id),
        supabase.from("venue_specifications").select("specification_name, specification_value, notes").eq("venue_id", id),
        supabase.from("venue_rules").select("rule_text").eq("venue_id", id),
        supabase.from("venue_facilities").select("facility_name").eq("venue_id", id),
        supabase.from("venue_floor_plans").select("length, width, height, area_sqm").eq("venue_id", id).single(),
        supabase.from("venue_base_rates").select("rate_type, base_price, weekend_price, holiday_price, min_hours").eq("venue_id", id).single(),
        supabase.from("venue_packages").select("package_id, package_name, duration_hours, base_price").eq("venue_id", id),
        supabase.from("venue_overtime_rates").select("rate_type, price_per_hour, start_hour, end_hour").eq("venue_id", id),
        supabase.from("venue_contacts").select("contact_type, contact_value").eq("venue_id", id),
        supabase.from("venue_allowed_event_types").select("event_categories(category_name)").eq("venue_id", id),
        supabase.from("venue_doors").select("door_id, door_type, width, height, door_offset, corner_position, swing_direction, hinge_position, wall").eq("venue_id", id),
      ]);

      // Process packages with inclusions
      let packagesWithInclusions: any[] = [];
      if (packagesRes.data) {
        packagesWithInclusions = await Promise.all(
          packagesRes.data.map(async (pkg: any) => {
            const { data: inclusionsData } = await supabase
              .from("venue_package_inclusions")
              .select("inclusion_name")
              .eq("package_id", pkg.package_id);
            return {
              package_name: pkg.package_name,
              duration_hours: pkg.duration_hours,
              base_price: pkg.base_price,
              inclusions: (inclusionsData || []).map((inc: any) => inc.inclusion_name),
            };
          })
        );
      }

      const formattedData: VenueDetailsData = {
        venue_id: venueData.venue_id,
        venue_name: venueData.venue_name,
        street_address: venueData.street_address,
        barangay: venueData.barangay,
        city: venueData.city,
        province: venueData.province,
        zip_code: venueData.zip_code,
        max_capacity: venueData.max_capacity,
        description: venueData.description || "No description available",
        type_name: typeName,
        images: (imagesRes.data || []).map((img: any) => img.image_path),
        specifications: (specsRes.data || []).map((spec: any) => ({ name: spec.specification_name, value: spec.specification_value, notes: spec.notes })),
        rules: (rulesRes.data || []).map((rule: any) => rule.rule_text),
        facilities: (facilitiesRes.data || []).map((fac: any) => fac.facility_name),
        floorPlan: floorPlanRes.data,
        baseRate: rateRes.data,
        packages: packagesWithInclusions,
        overtimeRates: (overtimeRes.data || []).map((rate: any) => ({ rate_type: rate.rate_type, price_per_hour: rate.price_per_hour, start_hour: rate.start_hour, end_hour: rate.end_hour })),
        contacts: contactsRes.data || [],
        eventTypes: (eventTypesRes.data || []).map((et: any) => et.event_categories?.category_name).filter(Boolean),
        doors: (doorsRes.data || []).map((door: any) => ({
          door_id: door.door_id,
          door_type: door.door_type,
          width: door.width,
          height: door.height,
          door_offset: door.door_offset,
          corner_position: door.corner_position,
          swing_direction: door.swing_direction,
          hinge_position: door.hinge_position,
          wall: door.wall,
        })),
      };

      setVenueData(formattedData);
    } catch (err) {
      console.error("Error fetching venue details:", err);
      Alert.alert("Error", "Failed to load venue details");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <TopBar notificationCount={notificationCount} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!venueData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <TopBar notificationCount={notificationCount} />
        <View style={styles.loadingContainer}>
          <Text>Venue not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar notificationCount={notificationCount} />
      
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={Theme.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Venue Details</Text>
        <Pressable 
          onPress={() => {
            console.log("Edit button pressed, venueId:", venueId);
            if (venueId) {
              router.push({
                pathname: "/users/venue_administrator/my_venue/venue_admin_my_venue_edit",
                params: { venueId: venueId }
              });
            } else {
              Alert.alert("Error", "Venue ID not found");
            }
          }}
          style={{ padding: 8 }}
        >
          <Ionicons name="create-outline" size={28} color={Theme.colors.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Image */}
        {venueData.images.length > 0 ? (
          <Image 
            source={{ uri: venueData.images[0] }} 
            style={styles.venueImage}
            onError={() => console.warn("Failed to load image")}
          />
        ) : (
          <View style={[styles.venueImage, { backgroundColor: Theme.colors.muted, justifyContent: "center", alignItems: "center" }]}>
            <Ionicons name="image-outline" size={48} color={Theme.colors.text} />
            <Text style={{ color: Theme.colors.text, marginTop: 8 }}>No images available</Text>
          </View>
        )}

        {/* Venue Name */}
        <Text style={styles.venueName}>{venueData.venue_name}</Text>

        {/* Basic Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={Theme.colors.primary} />
            <Text style={styles.infoText}>{venueData.street_address}, {venueData.barangay}</Text>
          </View>
          <Text style={[styles.infoText, { marginLeft: 24 }]}>{venueData.city}, {venueData.province} {venueData.zip_code}</Text>

          <View style={[styles.infoRow, { marginTop: 12 }]}>
            <Ionicons name="home-outline" size={16} color={Theme.colors.primary} />
            <Text style={styles.infoText}><Text style={styles.infoLabel}>Venue Type: </Text>{venueData.type_name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={16} color={Theme.colors.primary} />
            <Text style={styles.infoText}>Capacity / Guest Limit: {venueData.max_capacity} Person (Pax)</Text>
          </View>

          {venueData.eventTypes.length > 0 && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color={Theme.colors.primary} />
              <Text style={styles.infoText}>Event Types: {venueData.eventTypes.join(", ")}</Text>
            </View>
          )}
        </View>

        {/* Gallery */}
        {venueData.images.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>GALLERY</Text>
            <FlatList
              data={venueData.images.slice(1)}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={{ gap: 8 }}
              contentContainerStyle={{ gap: 8 }}
              renderItem={({ item }) => (
                <Image 
                  source={{ uri: item }} 
                  style={[styles.galleryImage, { flex: 1, height: 120 }]}
                  onError={() => console.warn("Failed to load gallery image")}
                />
              )}
              keyExtractor={(_, index) => index.toString()}
            />
          </View>
        )}
        {/* Dimensions */}
        {venueData.floorPlan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dimensions</Text>
            <View style={styles.dimensionsGrid}>
              <View style={styles.dimensionItem}>
                <Text style={styles.dimensionLabel}>Length × Width</Text>
                <Text style={styles.dimensionValue}>{venueData.floorPlan.length} m × {venueData.floorPlan.width} m</Text>
              </View>
              <View style={styles.dimensionItem}>
                <Text style={styles.dimensionLabel}>Floor Area</Text>
                <Text style={styles.dimensionValue}>{venueData.floorPlan.area_sqm} sqm</Text>
              </View>
              <View style={styles.dimensionItem}>
                <Text style={styles.dimensionLabel}>Ceiling Height</Text>
                <Text style={styles.dimensionValue}>{venueData.floorPlan.height} m</Text>
              </View>
            </View>
          </View>
        )}

        {/* Floor Plan Visualizer */}
        {venueData.floorPlan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Floor Plan</Text>
            <VenueFloorPlanVisualizer
              length={venueData.floorPlan.length.toString()}
              width={venueData.floorPlan.width.toString()}
              doors={venueData.doors.map((door, idx) => ({
                id: idx + 1,
                type: door.door_type,
                width: door.width.toString(),
                height: door.height.toString(),
                offsetFromCorner: (door.door_offset || 0).toString(),
                swingDirection: door.swing_direction || "Inward",
                hingePosition: door.hinge_position || "Left",
                wall: door.wall,
              }))}
            />
          </View>
        )}

        {/* Doors */}
        {venueData.doors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Doors & Entrances</Text>
            {venueData.doors.map((door, index) => (
              <View key={index} style={styles.doorItem}>
                <View style={styles.doorHeader}>
                  <Ionicons name="open-outline" size={16} color={Theme.colors.primary} />
                  <Text style={styles.doorType}>{door.door_type}</Text>
                </View>
                <View style={styles.doorDetails}>
                  <Text style={styles.doorDetail}>Size: {door.width} × {door.height} (m)</Text>
                  <Text style={styles.doorDetail}>Wall Position: {door.wall}</Text>
                  <Text style={styles.doorDetail}>Offset: {door.door_offset || "N/A"} m</Text>
                  <Text style={styles.doorDetail}>Corner: {door.corner_position || "N/A"}</Text>
                  <Text style={styles.doorDetail}>Swing: {door.swing_direction || "N/A"}</Text>
                  <Text style={styles.doorDetail}>Hinge: {door.hinge_position || "N/A"}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Rules */}
        {venueData.rules.length > 0 && (
          <View style={styles.section}>
            <Pressable style={styles.sectionHeader} onPress={() => toggleSection("rules")}>
              <Text style={styles.sectionTitle}>Venue Rules and Regulations</Text>
              <Ionicons name={expandedSections.rules ? "chevron-up" : "chevron-down"} size={20} color={Theme.colors.text} />
            </Pressable>
            {expandedSections.rules && (
              <View style={styles.rulesContainer}>
                {venueData.rules.map((rule, index) => (
                  <View key={index} style={styles.ruleItem}>
                    <Text style={styles.ruleNumber}>{index + 1}.</Text>
                    <Text style={styles.ruleText}>{rule}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Facilities */}
        {venueData.facilities.length > 0 && (
          <View style={styles.section}>
            <Pressable style={styles.sectionHeader} onPress={() => toggleSection("facilities")}>
              <Text style={styles.sectionTitle}>Facility Inclusions</Text>
              <Ionicons name={expandedSections.facilities ? "chevron-up" : "chevron-down"} size={20} color={Theme.colors.text} />
            </Pressable>
            {expandedSections.facilities && (
              <View style={styles.facilitiesContainer}>
                {venueData.facilities.map((facility, index) => (
                  <View key={index} style={styles.facilityItem}>
                    <Ionicons name="checkmark-circle" size={16} color={Theme.colors.primary} />
                    <Text style={styles.facilityText}>{facility}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Pricing */}
        {(venueData.baseRate || venueData.packages.length > 0 || venueData.overtimeRates.length > 0) && (
          <View style={styles.section}>
            <Pressable style={styles.sectionHeader} onPress={() => toggleSection("packages")}>
              <Text style={styles.sectionTitle}>Pricing & Rates</Text>
              <Ionicons name={expandedSections.packages ? "chevron-up" : "chevron-down"} size={20} color={Theme.colors.text} />
            </Pressable>

            {expandedSections.packages && (
              <>
                {venueData.baseRate && (
                  <View style={styles.rateSection}>
                    <Text style={styles.rateTitle}>Base Rate</Text>
                    <View style={styles.rateGrid}>
                      <View style={styles.rateItem}>
                        <Text style={styles.rateLabel}>Hourly Rate</Text>
                        <Text style={styles.rateValue}>₱{venueData.baseRate.base_price.toLocaleString()}</Text>
                      </View>
                      <View style={styles.rateItem}>
                        <Text style={styles.rateLabel}>Weekend</Text>
                        <Text style={styles.rateValue}>₱{venueData.baseRate.weekend_price.toLocaleString()}</Text>
                      </View>
                      <View style={styles.rateItem}>
                        <Text style={styles.rateLabel}>Holiday</Text>
                        <Text style={styles.rateValue}>₱{venueData.baseRate.holiday_price.toLocaleString()}</Text>
                      </View>
                      <View style={styles.rateItem}>
                        <Text style={styles.rateLabel}>Min Hours</Text>
                        <Text style={styles.rateValue}>{venueData.baseRate.min_hours} hrs</Text>
                      </View>
                    </View>
                  </View>
                )}

                {venueData.packages.length > 0 && (
                  <View style={styles.rateSection}>
                    <Text style={styles.rateTitle}>Pricing Packages</Text>
                    {venueData.packages.map((pkg, index) => (
                      <View key={index} style={styles.packageItem}>
                        <View style={styles.packageHeader}>
                          <Text style={styles.packageName}>{pkg.package_name}</Text>
                          <Text style={styles.packagePrice}>₱{pkg.base_price.toLocaleString()}</Text>
                        </View>
                        <Text style={styles.packageDuration}>Duration: {pkg.duration_hours} hours</Text>
                        {pkg.inclusions.length > 0 && (
                          <View style={styles.inclusionsList}>
                            {pkg.inclusions.map((inclusion, idx) => (
                              <Text key={idx} style={styles.inclusionItem}>• {inclusion}</Text>
                            ))}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {venueData.overtimeRates.length > 0 && (
                  <View style={styles.rateSection}>
                    <Text style={styles.rateTitle}>Overtime Rates</Text>
                    {venueData.overtimeRates.map((rate, index) => (
                      <View key={index} style={styles.overtimeItem}>
                        <View style={styles.overtimeRow}>
                          <Text style={styles.overtimeLabel}>{rate.rate_type}</Text>
                          <Text style={styles.overtimePrice}>₱{rate.price_per_hour.toLocaleString()} / hour</Text>
                        </View>
                        {(rate.start_hour || rate.end_hour) && (
                          <Text style={styles.overtimeTime}>{rate.start_hour} - {rate.end_hour || "End"} hours</Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* Contact */}
        {venueData.contacts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            {venueData.contacts.map((contact, index) => (
              <View key={index} style={styles.contactItem}>
                <Ionicons name={contact.contact_type === "Email" ? "mail-outline" : "call-outline"} size={16} color={Theme.colors.primary} />
                <Text style={styles.contactText}>{contact.contact_value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable 
            style={styles.editButton}
            onPress={() => {
              console.log("Edit button pressed, venueId:", venueId);
              if (venueId) {
                router.push({
                  pathname: "/users/venue_administrator/my_venue/venue_admin_my_venue_edit",
                  params: { venueId: venueId }
                });
              } else {
                Alert.alert("Error", "Venue ID not found");
              }
            }}
          >
            <Ionicons name="pencil-outline" size={18} color={Theme.colors.primary} />
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>

          <Pressable style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={18} color="#FF4444" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomNavRenderer role="venue_administrator" activeTab="my_venue" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Theme.colors.text,
  },
  venueImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  venueName: {
    fontSize: 24,
    fontWeight: "700",
    color: Theme.colors.text,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: Theme.colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: Theme.colors.text,
    marginLeft: 8,
    flex: 1,
  },
  infoLabel: {
    fontWeight: "600",
    color: Theme.colors.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Theme.colors.text,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  galleryImage: {
    borderRadius: 8,
    overflow: "hidden",
  },
  dimensionsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  dimensionItem: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  dimensionLabel: {
    fontSize: 12,
    color: Theme.colors.muted,
    marginBottom: 4,
  },
  dimensionValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Theme.colors.primary,
  },
  rulesContainer: {
    backgroundColor: Theme.colors.background,
    borderRadius: 8,
    padding: 12,
  },
  ruleItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  ruleNumber: {
    fontWeight: "700",
    color: Theme.colors.primary,
    marginRight: 8,
    minWidth: 20,
  },
  ruleText: {
    flex: 1,
    color: Theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  facilitiesContainer: {
    backgroundColor: Theme.colors.background,
    borderRadius: 8,
    padding: 12,
  },
  facilityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  facilityText: {
    marginLeft: 8,
    color: Theme.colors.text,
    fontSize: 14,
  },
  rateSection: {
    marginBottom: 16,
  },
  rateTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Theme.colors.text,
    marginBottom: 8,
  },
  rateGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  rateItem: {
    flex: 1,
    minWidth: "48%",
    backgroundColor: Theme.colors.background,
    borderRadius: 8,
    padding: 12,
  },
  rateLabel: {
    fontSize: 12,
    color: Theme.colors.muted,
    marginBottom: 4,
  },
  rateValue: {
    fontSize: 14,
    fontWeight: "700",
    color: Theme.colors.primary,
  },
  packageItem: {
    backgroundColor: Theme.colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.primary,
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  packageName: {
    fontSize: 14,
    fontWeight: "600",
    color: Theme.colors.text,
  },
  packagePrice: {
    fontSize: 14,
    fontWeight: "700",
    color: Theme.colors.primary,
  },
  packageDuration: {
    fontSize: 12,
    color: Theme.colors.muted,
    marginBottom: 8,
  },
  inclusionsList: {
    marginTop: 8,
  },
  inclusionItem: {
    fontSize: 12,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  overtimeItem: {
    backgroundColor: Theme.colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  overtimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  overtimeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Theme.colors.text,
  },
  overtimePrice: {
    fontSize: 14,
    fontWeight: "700",
    color: Theme.colors.primary,
  },
  overtimeTime: {
    fontSize: 12,
    color: Theme.colors.muted,
    marginTop: 4,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  contactText: {
    marginLeft: 8,
    fontSize: 14,
    color: Theme.colors.text,
  },
  doorItem: {
    backgroundColor: Theme.colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.primary,
  },
  doorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  doorType: {
    fontSize: 14,
    fontWeight: "600",
    color: Theme.colors.text,
  },
  doorDetails: {
    gap: 4,
  },
  doorDetail: {
    fontSize: 12,
    color: Theme.colors.muted,
    marginLeft: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 20,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: Theme.colors.primary,
    borderRadius: 8,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFE5E5",
    borderRadius: 8,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#FF4444",
  },
  deleteButtonText: {
    color: "#FF4444",
    fontWeight: "600",
    fontSize: 14,
  },
});
