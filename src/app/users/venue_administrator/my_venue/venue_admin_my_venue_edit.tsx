import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Theme } from "../../../../../constants/theme";
import DoorDropdown from "../../../../components/DoorDropdown";
import VenueFloorPlanVisualizer from "../../../../components/VenueFloorPlanVisualizer";
import TopBar from "../../../../components/top_bar";
import BottomNavRenderer from "../../../../components/user_navigation/bottom_nav/BottomNavRenderer";
import { useAuth } from "../../../../hooks/use-auth";
import { supabase } from "../../../../services/supabase";


// Interfaces
interface VenueSpecification {
  id: number;
  name: string;
  value: string;
  notes: string;
}

interface Door {
  id: number;
  type: string;
  width: string;
  height: string;
  offsetFromCorner: string;
  swingDirection: string;
  hingePosition: string;
  wall: string;
}

interface PricingPackage {
  id: number;
  name: string;
  duration: string;
  price: string;
  inclusions: string;
}

interface OvertimeRate {
  id: number;
  rateType: string;
  pricePerHour: string;
  startHour: string;
  endHour: string;
}

export default function VenueAdminMyVenueEdit() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const venueId = Array.isArray(params.venueId) ? params.venueId[0] : params.venueId;
  const { user } = useAuth();
  const [notificationCount] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [isSaving, setIsSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialState, setInitialState] = useState<any>(null);

  // Step 1: Basic Info
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [barangay, setBarangay] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [capacity, setCapacity] = useState("");

  // Step 2: Technical Specs
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [floorArea, setFloorArea] = useState("");
  const [ceilingHeight, setCeilingHeight] = useState("");
  const [venueSpecifications, setVenueSpecifications] = useState<VenueSpecification[]>([]);
  const [customSpecificationInput, setCustomSpecificationInput] = useState("");
  const [specValueInput, setSpecValueInput] = useState("");
  const [specNotesInput, setSpecNotesInput] = useState("");
  const [nextSpecId, setNextSpecId] = useState(1);
  const [doors, setDoors] = useState<Door[]>([]);
  const [nextDoorId, setNextDoorId] = useState(1);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);

  // Step 3: Media & Rules
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [thumbnailImage, setThumbnailImage] = useState<string>("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [rulesAndRegulations, setRulesAndRegulations] = useState("");
  const [facilities, setFacilities] = useState<string[]>([]);
  const [customFacilityInput, setCustomFacilityInput] = useState("");

  // Step 4: Pricing & Contact
  const [hourlyRate, setHourlyRate] = useState("");
  const [minimumHours, setMinimumHours] = useState("");
  const [weekendRate, setWeekendRate] = useState("");
  const [holidayRate, setHolidayRate] = useState("");
  const [pricingNotes, setPricingNotes] = useState("");
  const [overtimeRates, setOvertimeRates] = useState<OvertimeRate[]>([]);
  const [nextOvertimeId, setNextOvertimeId] = useState(1);
  
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [nextPackageId, setNextPackageId] = useState(1);

  // Additional state variables
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [floorPlanImage, setFloorPlanImage] = useState("");
  const [selectedVenueType, setSelectedVenueType] = useState<number | null>(null);

  // Dropdown states
  const [openOvertimeDropdown, setOpenOvertimeDropdown] = useState<number | null>(null);
  const rateTypeOptions = ["Hourly", "Flat Rate", "Per Guest", "Package Rate"];
  const [openSeasonalDropdown, setOpenSeasonalDropdown] = useState<{type: "rateType" | "modifierType", id: number} | null>(null);
  const [openDoorWallDropdown, setOpenDoorWallDropdown] = useState<number | null>(null);
  const wallOptions = ["Top", "Bottom", "Left", "Right"];

  // Data Selectors
  const [venueTypes, setVenueTypes] = useState<any[]>([]);
  const [eventCategories, setEventCategories] = useState<any[]>([]);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const steps = ["Basic Info", "Technical Specs", "Media & Rules", "Pricing & Contact"];

  // Detect changes in form fields
  useEffect(() => {
    if (!initialState) return; // Don't check until data is loaded

    const currentState = {
      name, type, streetAddress, barangay, city, province, zipCode, capacity,
      length, width, ceilingHeight, venueSpecifications,
      selectedEventTypes, doors, galleryImages, thumbnailImage, rulesAndRegulations,
      facilities, hourlyRate, minimumHours, weekendRate, holidayRate, pricingNotes,
      packages, overtimeRates, email, phone, location, description, floorPlanImage
    };

    const hasAnyChanges = JSON.stringify(currentState) !== JSON.stringify(initialState);
    setHasChanges(hasAnyChanges);
  }, [name, type, streetAddress, barangay, city, province, zipCode, capacity,
      length, width, ceilingHeight, venueSpecifications,
      selectedEventTypes, doors, galleryImages, thumbnailImage, rulesAndRegulations,
      facilities, hourlyRate, minimumHours, weekendRate, holidayRate, pricingNotes,
      packages, overtimeRates, email, phone, location, description, floorPlanImage, initialState]);

  // Load initial data
  useEffect(() => {
    if (user?.id) {
      // Fetch the user_id from the users table using auth_id
      fetchUserIdFromDatabase(user.id);
    }
    loadVenueTypes();
    loadEventCategories();
  }, [user]);

  // Load existing venue data for editing
  useEffect(() => {
    if (venueId) {
      loadExistingVenueData();
    }
  }, [venueId]);

  const loadExistingVenueData = async () => {
    try {
      setLoading(true);

      // Fetch all 14 venue-related tables in parallel
      const [
        venueData,
        specData,
        eventTypesData,
        baseRatesData,
        contactsData,
        facilitiesData,
        packagesData,
        doorsData,
        imagesData,
        rulesData,
        floorPlansData,
        venueTypeData,
        overtimeRatesData,
      ] = await Promise.all([
        supabase
          .from("venues")
          .select("*")
          .eq("venue_id", venueId)
          .single(),
        supabase
          .from("venue_specifications")
          .select("*")
          .eq("venue_id", venueId),
        supabase
          .from("venue_allowed_event_types")
          .select("*")
          .eq("venue_id", venueId),
        supabase
          .from("venue_base_rates")
          .select("*")
          .eq("venue_id", venueId)
          .single(),
        supabase
          .from("venue_contacts")
          .select("*")
          .eq("venue_id", venueId),
        supabase
          .from("venue_facilities")
          .select("*")
          .eq("venue_id", venueId),
        supabase
          .from("venue_packages")
          .select("*, venue_package_inclusions(*)")
          .eq("venue_id", venueId),
        supabase
          .from("venue_doors")
          .select("*")
          .eq("venue_id", venueId),
        supabase
          .from("venue_images")
          .select("*")
          .eq("venue_id", venueId),
        supabase
          .from("venue_rules")
          .select("*")
          .eq("venue_id", venueId)
          .single(),
        supabase
          .from("venue_floor_plans")
          .select("*")
          .eq("venue_id", venueId)
          .single(),
        supabase
          .from("venue_venue_types")
          .select("venue_type_id")
          .eq("venue_id", venueId)
          .single(),
        supabase
          .from("venue_overtime_rates")
          .select("*")
          .eq("venue_id", venueId),
      ]);

      // Populate venue basic info
      if (venueData.data) {
        const v = venueData.data;
        setName(v.venue_name);
        setDescription(v.description);
        setLocation(v.location);
        setStreetAddress(v.street_address);
        setBarangay(v.barangay);
        setCity(v.city);
        setProvince(v.province);
        setZipCode(v.zip_code);
        setCapacity(v.max_capacity?.toString() || "");
      }

      // Populate venue specifications
      if (specData.data && specData.data.length > 0) {
        console.log("✅ Venue specs loaded:", specData.data);
        const specsList = specData.data.map((spec: any, index: number) => ({
          id: index,
          name: spec.specification_name,
          value: spec.specification_value,
          notes: spec.notes || "",
        }));
        setVenueSpecifications(specsList);
      } else {
        console.log("⚠️ No venue specs found:", specData);
      }

      // Populate event types
      if (eventTypesData.data && eventTypesData.data.length > 0) {
        console.log("✅ Event types loaded:", eventTypesData.data);
        const eventIds = eventTypesData.data.map((et: any) => et.category_id);
        setSelectedEventTypes(eventIds);
      } else {
        console.log("⚠️ No event types found:", eventTypesData);
      }

      // Populate base rates
      if (baseRatesData.data) {
        const rates = baseRatesData.data;
        setHourlyRate(rates.base_price?.toString() || "");
        setWeekendRate(rates.weekend_price?.toString() || "");
        setHolidayRate(rates.holiday_price?.toString() || "");
        setMinimumHours(rates.min_hours?.toString() || "");
      }

      // Populate contacts
      if (contactsData.data && contactsData.data.length > 0) {
        const contacts = contactsData.data;
        const emailContact = contacts.find((c: any) => c.contact_type === "Email");
        const phoneContact = contacts.find((c: any) => c.contact_type === "Phone");
        if (emailContact) {
          setEmail(emailContact.contact_value || "");
        }
        if (phoneContact) {
          setPhone(phoneContact.contact_value || "");
        }
      }

      // Populate facilities
      if (facilitiesData.data && facilitiesData.data.length > 0) {
        const facilityList = facilitiesData.data.map((f: any) => f.facility_name);
        setFacilities(facilityList);
      }

      // Populate packages
      if (packagesData.data && packagesData.data.length > 0) {
        const packageList = packagesData.data.map((pkg: any, index: number) => ({
          id: index,
          name: pkg.package_name,
          description: pkg.description,
          price: pkg.base_price?.toString() || "0",
          duration: pkg.min_hours?.toString() || "0",
          inclusions: pkg.venue_package_inclusions
            ?.map((inc: any) => inc.inclusion_name)
            .join(", ") || "",
        }));
        setPackages(packageList);
      }

      // Populate doors
      if (doorsData.data && doorsData.data.length > 0) {
        console.log("✅ Doors loaded:", doorsData.data);
        const doorList = doorsData.data.map((door: any, index: number) => ({
          id: index,
          type: door.door_type,
          width: door.width?.toString() || "",
          height: door.height?.toString() || "",
          offsetFromCorner: door.door_offset?.toString() || "",
          swingDirection: door.swing_direction || "Inward",
          hingePosition: door.hinge_position || "Left",
          wall: door.wall || "Top",
        }));
        setDoors(doorList);
      } else {
        console.log("⚠️ No doors found:", doorsData);
      }

      // Populate images
      if (imagesData.data && imagesData.data.length > 0) {
        const imageList = imagesData.data.map((img: any) => img.image_path);
        setGalleryImages(imageList);
      }

      // Populate rules
      if (rulesData.data) {
        setRulesAndRegulations(rulesData.data.rule_text || "");
      }

      // Populate floor plans
      if (floorPlansData.data) {
        const fp = floorPlansData.data;
        setLength(fp.length?.toString() || "");
        setWidth(fp.width?.toString() || "");
        setFloorArea(fp.area_sqm?.toString() || "");
        setCeilingHeight(fp.height?.toString() || "");
        setFloorPlanImage(fp.floor_plan_image_path || "");
      }

      // Populate venue type
      if (venueTypeData.data) {
        console.log("✅ Venue type data loaded:", venueTypeData.data);
        setType(venueTypeData.data.venue_type_id.toString());
      } else if (venueTypeData.error) {
        console.warn("⚠️ Error loading venue type:", venueTypeData.error);
      } else {
        console.warn("⚠️ No venue type data found");
      }

      // Populate overtime rates
      if (overtimeRatesData.data && overtimeRatesData.data.length > 0) {
        const overtimeList = overtimeRatesData.data.map((rate: any, index: number) => ({
          id: index,
          rateType: rate.rate_type || "Hourly",
          pricePerHour: rate.price_per_hour?.toString() || "0",
          startHour: rate.start_hour?.toString() || "0",
          endHour: rate.end_hour?.toString() || "0",
        }));
        setOvertimeRates(overtimeList);
      }

      // Store initial state for change detection
      const specsList = specData.data && specData.data.length > 0 
        ? specData.data.map((spec: any, index: number) => ({
            id: index,
            name: spec.specification_name,
            value: spec.specification_value,
            notes: spec.notes || "",
          }))
        : [];
      
      const eventTypesList = eventTypesData.data && eventTypesData.data.length > 0
        ? eventTypesData.data.map((et: any) => et.category_id)
        : [];
      
      const doorsList = doorsData.data && doorsData.data.length > 0
        ? doorsData.data.map((door: any, index: number) => ({
            id: index,
            type: door.door_type,
            width: door.width?.toString() || "",
            height: door.height?.toString() || "",
            offsetFromCorner: door.door_offset?.toString() || "",
            swingDirection: door.swing_direction || "Inward",
            hingePosition: door.hinge_position || "Left",
            wall: door.wall || "Top",
          }))
        : [];
      
      const initialStateSnapshot = {
        name: venueData.data?.venue_name || "",
        type: venueTypeData.data?.venue_type_id?.toString() || "",
        streetAddress: venueData.data?.street_address || "",
        barangay: venueData.data?.barangay || "",
        city: venueData.data?.city || "",
        province: venueData.data?.province || "",
        zipCode: venueData.data?.zip_code || "",
        capacity: venueData.data?.max_capacity?.toString() || "",
        length: floorPlansData.data?.length?.toString() || "",
        width: floorPlansData.data?.width?.toString() || "",
        ceilingHeight: floorPlansData.data?.height?.toString() || "",
        venueSpecifications: specsList,
        selectedEventTypes: eventTypesList,
        doors: doorsList,
        galleryImages: imagesData.data ? imagesData.data.map((img: any) => img.image_path) : [],
        thumbnailImage: imagesData.data ? imagesData.data.find((img: any) => img.is_thumbnail)?.image_path || "" : "",
        rulesAndRegulations: rulesData.data?.rule_text || "",
        facilities: facilitiesData.data ? facilitiesData.data.map((f: any) => f.facility_name) : [],
        hourlyRate: baseRatesData.data?.base_price?.toString() || "",
        minimumHours: baseRatesData.data?.min_hours?.toString() || "",
        weekendRate: baseRatesData.data?.weekend_price?.toString() || "",
        holidayRate: baseRatesData.data?.holiday_price?.toString() || "",
        pricingNotes: "",
        packages: packagesData.data ? packagesData.data.map((pkg: any, index: number) => ({
          id: index,
          name: pkg.package_name,
          description: pkg.description,
          price: pkg.base_price?.toString() || "0",
          duration: pkg.min_hours?.toString() || "0",
          inclusions: pkg.venue_package_inclusions?.map((inc: any) => inc.inclusion_name).join(", ") || "",
        })) : [],
        overtimeRates: overtimeRatesData.data && overtimeRatesData.data.length > 0 
          ? overtimeRatesData.data.map((rate: any, index: number) => ({
              id: index,
              rateType: rate.rate_type || "Hourly",
              pricePerHour: rate.price_per_hour?.toString() || "0",
              startHour: rate.start_hour?.toString() || "0",
              endHour: rate.end_hour?.toString() || "0",
            }))
          : [],
        email: contactsData.data ? (contactsData.data.find((c: any) => c.contact_type === "Email")?.contact_value || "") : "",
        phone: contactsData.data ? (contactsData.data.find((c: any) => c.contact_type === "Phone")?.contact_value || "") : "",
        location: venueData.data?.location || "",
        description: venueData.data?.description || "",
        floorPlanImage: floorPlansData.data?.floor_plan_image_path || "",
      };
      setInitialState(initialStateSnapshot);
      setHasChanges(false);

      setLoading(false);
    } catch (err) {
      console.error("Error loading existing venue data:", err);
      alert("Failed to load venue data");
      setLoading(false);
    }
  };

  const fetchUserIdFromDatabase = async (authId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("user_id")
        .eq("auth_id", authId)
        .single();

      if (error) {
        console.error("Error fetching user_id:", error);
        return;
      }

      if (data?.user_id) {
        setCurrentUserId(data.user_id.toString());
      }
    } catch (err) {
      console.error("Error in fetchUserIdFromDatabase:", err);
    }
  };

  const checkVenueNameExists = async (venueName: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("venues")
        .select("venue_id", { count: "exact" })
        .eq("venue_name", venueName);

      if (error) {
        console.error("Error checking venue name:", error);
        return false;
      }

      // If count > 0, name exists
      return data && data.length > 0;
    } catch (err) {
      console.error("Error checking venue name:", err);
      return false;
    }
  };

  const handleVenueNameChange = async (value: string) => {
    setName(value);
    
    // Clear error when user starts typing
    if (fieldErrors.venueName) {
      setFieldErrors({ ...fieldErrors, venueName: "" });
    }

    // Check if name exists (debounce would be ideal but this is simple)
    if (value.trim()) {
      const exists = await checkVenueNameExists(value);
      if (exists) {
        setFieldErrors({ ...fieldErrors, venueName: "This venue name has already been taken" });
      }
    }
  };

  // Auto-calculate floor area
  useEffect(() => {
    if (length && width) {
      const lengthNum = parseFloat(length);
      const widthNum = parseFloat(width);
      if (!isNaN(lengthNum) && !isNaN(widthNum)) {
        const area = (lengthNum * widthNum).toFixed(2);
        setFloorArea(area);
      }
    }
  }, [length, width]);

  const loadVenueTypes = async () => {
    try {
      const { data, error } = await supabase
        .from("venue_types")
        .select("venue_type_id, type_name")
        .order("type_name");

      if (!error && data) {
        setVenueTypes(
          data.map((vt: any) => ({
            id: vt.venue_type_id,
            name: vt.type_name,
          }))
        );
      }
    } catch (err) {
      console.error("Error loading venue types:", err);
    }
  };

  const loadEventCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("event_categories")
        .select("category_id, category_name")
        .order("category_name");

      if (!error && data) {
        setEventCategories(
          data.map((ec: any) => ({
            id: ec.category_id,
            name: ec.category_name,
          }))
        );
      }
    } catch (err) {
      console.error("Error loading event categories:", err);
    }
  };

  const pickGalleryImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setGalleryImages([...galleryImages, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const addCustomSpecification = () => {
    if (customSpecificationInput.trim() && specValueInput.trim()) {
      setVenueSpecifications([
        ...venueSpecifications,
        {
          id: nextSpecId,
          name: customSpecificationInput,
          value: specValueInput,
          notes: specNotesInput,
        },
      ]);
      setNextSpecId(nextSpecId + 1);
      setCustomSpecificationInput("");
      setSpecValueInput("");
      setSpecNotesInput("");
    }
  };

  const addDoor = () => {
    setDoors([
      ...doors,
      {
        id: nextDoorId,
        type: "Single Door",
        width: "",
        height: "",
        offsetFromCorner: "",
        swingDirection: "Inward",
        hingePosition: "Left",
        wall: "Top",
      },
    ]);
    setNextDoorId(nextDoorId + 1);
  };

  const updateDoor = (id: number, field: string, value: string) => {
    setDoors(
      doors.map((door) =>
        door.id === id ? { ...door, [field]: value } : door
      )
    );
  };

  const deleteDoor = (id: number) => {
    setDoors(doors.filter((door) => door.id !== id));
  };

  const addPricingPackage = () => {
    setPackages([
      ...packages,
      {
        id: nextPackageId,
        name: "",
        duration: "",
        price: "",
        inclusions: "",
      },
    ]);
    setNextPackageId(nextPackageId + 1);
  };

  const updatePackage = (id: number, field: string, value: string) => {
    setPackages(
      packages.map((pkg) =>
        pkg.id === id ? { ...pkg, [field]: value } : pkg
      )
    );
  };

  const deletePackage = (id: number) => {
    setPackages(packages.filter((pkg) => pkg.id !== id));
  };

  const addOvertimeRate = () => {
    setOvertimeRates([
      ...overtimeRates,
      {
        id: nextOvertimeId,
        rateType: "Hourly",
        pricePerHour: "",
        startHour: "",
        endHour: "",
      },
    ]);
    setNextOvertimeId(nextOvertimeId + 1);
  };

  const updateOvertimeRate = (id: number, field: string, value: string) => {
    setOvertimeRates(
      overtimeRates.map((rate) =>
        rate.id === id ? { ...rate, [field]: value } : rate
      )
    );
  };

  const deleteOvertimeRate = (id: number) => {
    setOvertimeRates(overtimeRates.filter((rate) => rate.id !== id));
  };

  const addFacility = () => {
    if (customFacilityInput.trim() && !facilities.includes(customFacilityInput)) {
      setFacilities([...facilities, customFacilityInput]);
      setCustomFacilityInput("");
    }
  };

  const toggleEventType = (eventTypeId: string) => {
    setSelectedEventTypes((prev) =>
      prev.includes(eventTypeId)
        ? prev.filter((et) => et !== eventTypeId)
        : [...prev, eventTypeId]
    );
  };

  const getValidationErrors = (): string[] => {
    const errors: string[] = [];
    
    switch (currentStep) {
      case 1:
        if (!name?.trim()) errors.push("• Venue Name is required");
        if (!type) errors.push("• Venue Type is required");
        if (!streetAddress?.trim()) errors.push("• Street Address is required");
        if (!barangay?.trim()) errors.push("• Barangay is required");
        if (!city?.trim()) errors.push("• City is required");
        if (!province?.trim()) errors.push("• Province is required");
        if (!zipCode?.trim()) errors.push("• Zip Code is required");
        else if (!/^\d{4}$/.test(zipCode)) errors.push("• Zip Code must be exactly 4 digits");
        if (!capacity?.trim()) errors.push("• Max Capacity is required");
        else {
          const capacityNum = parseInt(capacity);
          if (isNaN(capacityNum)) errors.push("• Max Capacity must be a number");
          else if (capacityNum > 10000) errors.push("• Max Capacity cannot exceed 10,000");
          else if (capacityNum <= 0) errors.push("• Max Capacity must be greater than 0");
        }
        break;
      case 2:
        if (!length?.trim()) errors.push("• Floor Length is required");
        if (!width?.trim()) errors.push("• Floor Width is required");
        if (!floorArea?.trim()) errors.push("• Floor Area is required");
        if (venueSpecifications.length === 0) errors.push("• At least one Venue Specification is required");
        if (selectedEventTypes.length === 0) errors.push("• At least one Event Type must be selected");
        break;
      case 3:
        if (galleryImages.length === 0) errors.push("• At least one Gallery Image is required");
        if (!rulesAndRegulations?.trim()) errors.push("• Rules & Regulations are required");
        if (facilities.length === 0) errors.push("• At least one Facility must be selected");
        break;
      case 4:
        if (!hourlyRate || !hourlyRate.trim()) errors.push("• Hourly Rate is required");
        if (!email || !email.trim()) errors.push("• Email is required");
        if (!phone || !phone.trim()) errors.push("• Phone is required");
        if (packages.length === 0) errors.push("• At least one Pricing Package is required");
        if (overtimeRates.length > 0) {
          const overtimeErrors = overtimeRates
            .map((rate, index) => {
              const errs = [];
              if (!rate.rateType) errs.push(`Overtime Rate ${index + 1}: Rate Type required`);
              if (!rate.pricePerHour || !rate.pricePerHour.trim()) errs.push(`Overtime Rate ${index + 1}: Price Per Hour required`);
              if (!rate.startHour || !rate.startHour.trim()) errs.push(`Overtime Rate ${index + 1}: Start Hour required`);
              return errs;
            })
            .flat();
          errors.push(...overtimeErrors.map(e => "• " + e));
        }
        break;
    }
    
    return errors;
  };

  const canProceedToNextStep = (): boolean => {
    return getValidationErrors().length === 0;
  };

  const handleNextStep = () => {
    const errors = getValidationErrors();
    if (errors.length > 0) {
      Alert.alert(
        "Missing Required Fields",
        "Please fill in the following fields:\n\n" + errors.join("\n"),
        [{ text: "OK" }]
      );
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const uploadGalleryImageToCloudinary = async (imageUri: string): Promise<string | null> => {
    try {
      console.log("🖼️ Uploading gallery image to Cloudinary:", imageUri.substring(0, 50));
      
      // Convert URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      console.log("✅ Blob obtained, size:", blob.size, "bytes");

      // Create FormData for Cloudinary upload
      const formData = new FormData();
      formData.append('file', blob);
      formData.append('upload_preset', process.env.EXPO_PUBLIC_CLOUDINARY_PRESET || '');
      formData.append('folder', 'eventscape/gallery');

      console.log("📤 Uploading to Cloudinary with preset:", process.env.EXPO_PUBLIC_CLOUDINARY_PRESET);
      
      // Upload to Cloudinary
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_NAME}/image/upload`;
      const uploadResponse = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("❌ Cloudinary API error:", uploadResponse.status, errorText);
        throw new Error(`Cloudinary upload failed: ${uploadResponse.statusText}`);
      }

      const data = await uploadResponse.json();
      console.log("✅ Gallery image uploaded to Cloudinary:", data.secure_url);
      return data.secure_url || data.url;
    } catch (error) {
      console.error("❌ Error uploading gallery image:", error);
      return null;
    }
  };

  const handleSaveVenue = async () => {
    // Check if there are any changes to save
    if (!hasChanges) {
      Alert.alert("No Changes", "You haven't made any changes to the venue.");
      return;
    }

    if (!currentUserId) {
      Alert.alert("Error", "User not authenticated. Please refresh the page.");
      return;
    }

    if (!venueId) {
      Alert.alert("Error", "Venue ID not found. Please go back and try again.");
      return;
    }

    setIsSaving(true);

    try {
      // Debug: Log what we're updating
      console.log("Updating venue with ID:", venueId);

      // Update main venue record
      const venueData = {
        venue_name: name,
        description: rulesAndRegulations,
        street_address: streetAddress,
        barangay: barangay,
        city: city,
        province: province,
        zip_code: zipCode,
        country: "Philippines",
        max_capacity: parseInt(capacity),
        is_active: true,
      };

      console.log("Venue data being updated:", venueData);

      const { data: venueResult, error: venueError } = await supabase
        .from("venues")
        .update(venueData)
        .eq("venue_id", venueId)
        .select()
        .single();

      if (venueError) {
        console.error("Venue update error:", venueError);
        Alert.alert("Error", `Failed to update venue: ${venueError.message}`);
        setIsSaving(false);
        return;
      }

      if (!venueResult) {
        Alert.alert("Error", "Failed to update venue");
        setIsSaving(false);
        return;
      }

      console.log("✅ Venue updated with ID:", venueId);

      // Ensure venue is assigned to the current admin
      const { error: adminAssignError } = await supabase
        .from("venue_administrators")
        .update({ assigned_venue_id: venueId })
        .eq("user_id", parseInt(currentUserId) || 0);

      if (adminAssignError) {
        console.warn("⚠️ Warning: Could not assign venue to admin:", adminAssignError);
        // Continue anyway, the venue is updated
      } else {
        console.log("✅ Venue assigned to venue administrator");
      }

      // Delete and re-insert venue specifications
      if (venueSpecifications.length > 0) {
        // First delete existing specifications
        await supabase.from("venue_specifications").delete().eq("venue_id", venueId);

        // Then insert new ones
        const specsInsert = await supabase.from("venue_specifications").insert(
          venueSpecifications.map((spec) => ({
            venue_id: venueId,
            specification_name: spec.name,
            specification_value: spec.value,
            notes: spec.notes || null,
          }))
        );
        if (specsInsert.error) {
          console.error("Specifications insert error:", specsInsert.error);
        } else {
          console.log("✅ Specifications inserted");
        }
      } else {
        // Delete specifications if none provided
        await supabase.from("venue_specifications").delete().eq("venue_id", venueId);
      }

      // Delete and re-insert allowed event types
      if (selectedEventTypes.length > 0) {
        // First delete existing event types
        await supabase.from("venue_allowed_event_types").delete().eq("venue_id", venueId);

        // Then insert new ones
        const eventTypesInsert = await supabase.from("venue_allowed_event_types").insert(
          selectedEventTypes.map((categoryId) => ({
            venue_id: venueId,
            category_id: parseInt(categoryId),
          }))
        );
        if (eventTypesInsert.error) {
          console.error("Event types insert error:", eventTypesInsert.error);
        } else {
          console.log("✅ Event types inserted");
        }
      } else {
        // Delete event types if none provided
        await supabase.from("venue_allowed_event_types").delete().eq("venue_id", venueId);
      }

      // Update base rate
      if (hourlyRate) {
        const baseRateUpdate = await supabase.from("venue_base_rates").update({
          rate_type: "Hourly",
          base_price: parseFloat(hourlyRate),
          weekend_price: parseFloat(weekendRate) || 0,
          holiday_price: parseFloat(holidayRate) || 0,
          included_hours: 2,
          min_hours: parseInt(minimumHours) || 2,
          notes: pricingNotes || null,
          is_active: true,
        }).eq("venue_id", venueId);
        if (baseRateUpdate.error) {
          console.error("Base rate update error:", baseRateUpdate.error);
        } else {
          console.log("✅ Base rates inserted");
        }
      }

      // Insert contact information
      const contactsData = [];
      if (email) {
        contactsData.push({
          venue_id: venueId,
          contact_type: "Email",
          contact_value: email,
        });
      }
      if (phone) {
        contactsData.push({
          venue_id: venueId,
          contact_type: "Phone",
          contact_value: phone,
        });
      }
      
      // Delete and re-insert contacts
      await supabase.from("venue_contacts").delete().eq("venue_id", venueId);
      if (contactsData.length > 0) {
        const contactsInsert = await supabase.from("venue_contacts").insert(contactsData);
        if (contactsInsert.error) {
          console.error("Contacts insert error:", contactsInsert.error);
        } else {
          console.log("✅ Contacts inserted");
        }
      }

      // Delete and re-insert facilities
      if (facilities.length > 0) {
        // Delete existing facilities
        await supabase.from("venue_facilities").delete().eq("venue_id", venueId);

        const facilitiesInsert = await supabase.from("venue_facilities").insert(
          facilities.map((facility) => ({
            venue_id: venueId,
            facility_name: facility,
            description: null,
          }))
        );
        if (facilitiesInsert.error) {
          console.error("Facilities insert error:", facilitiesInsert.error);
        } else {
          console.log("✅ Facilities inserted");
        }
      } else {
        // Delete facilities if none provided
        await supabase.from("venue_facilities").delete().eq("venue_id", venueId);
      }

      // Delete and re-insert packages
      if (packages.length > 0) {
        // First delete existing packages and their inclusions
        await supabase.from("venue_packages").delete().eq("venue_id", venueId);

        const { data: packageResults, error: packageError } = await supabase
          .from("venue_packages")
          .insert(
            packages.map((pkg) => ({
              venue_id: venueId,
              package_name: pkg.name,
              description: pkg.inclusions || "",
              duration_hours: parseInt(pkg.duration) || 0,
              duration_days: null,
              base_price: parseFloat(pkg.price) || 0,
              min_hours: parseInt(pkg.duration) || 0,
              notes: null,
              is_active: true,
            }))
          )
          .select();

        if (packageError) {
          console.error("Packages insert error:", packageError);
        } else {
          console.log("✅ Packages inserted");
        }

        // Insert package inclusions
        if (packageResults && packageResults.length > 0) {
          const inclusionsData: any[] = [];
          packages.forEach((pkg, index) => {
            if (pkg.inclusions && packageResults[index]) {
              const inclusions = pkg.inclusions
                .split(",")
                .map((inc) => inc.trim())
                .filter((inc) => inc);
              inclusions.forEach((inclusion) => {
                inclusionsData.push({
                  package_id: packageResults[index].package_id,
                  inclusion_name: inclusion,
                  is_active: true,
                });
              });
            }
          });

          if (inclusionsData.length > 0) {
            const inclusionsInsert = await supabase.from("venue_package_inclusions").insert(inclusionsData);
            if (inclusionsInsert.error) {
              console.error("Package inclusions insert error:", inclusionsInsert.error);
            } else {
              console.log("✅ Package inclusions inserted");
            }
          }
        }
      } else {
        // Delete packages if none provided
        await supabase.from("venue_packages").delete().eq("venue_id", venueId);
      }

      // Update rules
      if (rulesAndRegulations) {
        const rulesUpdate = await supabase.from("venue_rules").update({
          rule_text: rulesAndRegulations,
          is_active: true,
        }).eq("venue_id", venueId);
        if (rulesUpdate.error) {
          console.error("Rules update error:", rulesUpdate.error);
        } else {
          console.log("✅ Rules updated");
        }
      }

      // Update floor plan
      if (length && width) {
        const floorPlanUpdate = await supabase.from("venue_floor_plans").update({
          floor_plan_file: "floor_plan_default.svg",
          floor_plan_type: "dimensions",
          length: parseFloat(length),
          width: parseFloat(width),
          height: parseFloat(ceilingHeight) || 0,
          area_sqm: parseFloat(floorArea),
        }).eq("venue_id", venueId);
        if (floorPlanUpdate.error) {
          console.error("Floor plan update error:", floorPlanUpdate.error);
        } else {
          console.log("✅ Floor plan updated");
        }
      } else {
        console.log("⏭️  Floor plan skipped (no dimensions provided)");
      }

      // Delete and re-insert doors
      if (doors.length > 0) {
        // First delete existing doors
        await supabase.from("venue_doors").delete().eq("venue_id", venueId);

        const doorsInsert = await supabase.from("venue_doors").insert(
          doors.map((door) => {
            // Map display names to enum values
            const doorTypeMap: { [key: string]: string } = {
              'Single Door': 'Single',
              'Double Door': 'Double',
              'Sliding Door': 'Sliding',
              'Pocket Door': 'Pocket',
              'Single': 'Single',
              'Double': 'Double',
              'Sliding': 'Sliding',
              'Pocket': 'Pocket',
            };
            const mappedDoorType = doorTypeMap[door.type] || door.type;
            
            const swingMap: { [key: string]: string } = {
              'Inward': 'Inward',
              'Outward': 'Outward',
            };
            const mappedSwing = swingMap[door.swingDirection] || 'Inward';
            
            const hingeMap: { [key: string]: string } = {
              'Left': 'Left',
              'Right': 'Right',
              'Center': 'Center',
            };
            const mappedHinge = hingeMap[door.hingePosition] || 'Left';
            
            const wallMap: { [key: string]: string } = {
              'Top': 'Top',
              'Bottom': 'Bottom',
              'Left': 'Left',
              'Right': 'Right',
            };
            const mappedWall = wallMap[door.wall] || 'Top';
            
            return {
              venue_id: venueId,
              door_type: mappedDoorType,
              door_offset: parseFloat(door.offsetFromCorner) || 0,
              hinge_position: mappedHinge,
              width: parseFloat(door.width) || 1,
              height: parseFloat(door.height) || 2.1,
              wall: mappedWall,
              corner_position: 'Center',
              swing_direction: mappedSwing,
            };
          })
        );
        if (doorsInsert.error) {
          console.error("Doors insert error:", doorsInsert.error);
        } else {
          console.log("✅ Doors inserted");
        }
      } else {
        console.log("⏭️  Doors skipped (no doors added)");
      }

      // Insert overtime rates
      if (overtimeRates.length > 0) {
        const overtimeInsert = await supabase.from("venue_overtime_rates").insert(
          overtimeRates.map((rate) => ({
            venue_id: venueId,
            rate_type: rate.rateType,
            price_per_hour: parseFloat(rate.pricePerHour) || 0,
            start_hour: parseInt(rate.startHour) || 0,
            end_hour: parseInt(rate.endHour) || 0,
            is_active: true,
          }))
        );
        if (overtimeInsert.error) {
          console.error("Overtime rates insert error:", overtimeInsert.error);
        } else {
          console.log("✅ Overtime rates inserted");
        }
      } else {
        // Delete overtime rates if none provided
        await supabase.from("venue_overtime_rates").delete().eq("venue_id", venueId);
      }

      // Delete and re-insert gallery images
      if (galleryImages.length > 0) {
        console.log("📤 Starting gallery image uploads to Cloudinary...");
        
        // First delete existing images
        await supabase.from("venue_images").delete().eq("venue_id", venueId);
        
        // Upload all gallery images to Cloudinary first
        const uploadedImageUrls: string[] = [];
        for (let i = 0; i < galleryImages.length; i++) {
          try {
            console.log(`⏳ Uploading image ${i + 1}/${galleryImages.length}...`);
            const uploadedUrl = await uploadGalleryImageToCloudinary(galleryImages[i]);
            if (uploadedUrl) {
              uploadedImageUrls.push(uploadedUrl);
              console.log(`✅ Image ${i + 1} uploaded: ${uploadedUrl}`);
            } else {
              console.error(`❌ Failed to upload image ${i + 1}`);
              Alert.alert("Error", `Failed to upload image ${i + 1}. Please try again.`);
              setIsSaving(false);
              return;
            }
          } catch (uploadError) {
            console.error(`❌ Error uploading image ${i + 1}:`, uploadError);
            Alert.alert("Error", `Failed to upload image ${i + 1}: ${uploadError}`);
            setIsSaving(false);
            return;
          }
        }
        
        // Now save the uploaded URLs to database
        const imagesInsert = await supabase.from("venue_images").insert(
          uploadedImageUrls.map((imagePath, index) => ({
            venue_id: venueId,
            image_path: imagePath,
            is_thumbnail: index === 0,
          }))
        );
        if (imagesInsert.error) {
          console.error("Images insert error:", imagesInsert.error);
        } else {
          console.log("✅ Images inserted");
        }
      } else {
        // Delete images if none provided
        await supabase.from("venue_images").delete().eq("venue_id", venueId);
      }

      // Update venue type link (venue_venue_types)
      if (type) {
        const { error: venueTypeLinkError } = await supabase
          .from("venue_venue_types")
          .update({
            venue_type_id: parseInt(type),
          })
          .eq("venue_id", venueId);
        if (venueTypeLinkError) {
          console.error("Venue type link error:", venueTypeLinkError);
        } else {
          console.log("✅ Venue type link updated");
        }
      }

      setIsSaving(false);
      Alert.alert("Success", "Venue updated successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      setIsSaving(false);
      Alert.alert("Error", err.message || "Failed to update venue");
    }
  };

  // Render Step 1: Basic Info
  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>Basic Information</Text>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Venue Name *</Text>
        <TextInput
          style={[styles.textInput, fieldErrors.venueName && styles.textInputError]}
          placeholder="Enter venue name"
          value={name}
          onChangeText={handleVenueNameChange}
        />
        {fieldErrors.venueName && (
          <Text style={styles.errorText}>{fieldErrors.venueName}</Text>
        )}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Venue Type *</Text>
        <Pressable
          style={styles.dropdownButton}
          onPress={() => setShowTypeDropdown(!showTypeDropdown)}
        >
          <Text style={styles.dropdownButtonText}>
            {type
              ? venueTypes.find((vt) => vt.id.toString() === type)?.name || "Select type"
              : "Select type"}
          </Text>
          <Ionicons name="chevron-down" size={20} color={Theme.colors.primary} />
        </Pressable>

        {showTypeDropdown && (
          <View style={styles.dropdownMenu}>
            {venueTypes.map((vt) => (
              <Pressable
                key={vt.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setType(vt.id.toString());
                  setShowTypeDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{vt.name}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Street Address *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter street address"
          value={streetAddress}
          onChangeText={setStreetAddress}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Barangay *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter barangay"
          value={barangay}
          onChangeText={setBarangay}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>City *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter city"
          value={city}
          onChangeText={setCity}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Province *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter province"
          value={province}
          onChangeText={setProvince}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Zip Code *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter zip code (4 digits)"
          value={zipCode}
          onChangeText={(val) => {
            // Only allow digits and max 4 characters
            const filtered = val.replace(/[^0-9]/g, '').slice(0, 4);
            setZipCode(filtered);
          }}
          keyboardType="numeric"
          maxLength={4}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Capacity (Pax) *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter guest capacity (max 10,000)"
          value={capacity}
          onChangeText={(val) => {
            // Only allow digits and max 5 characters (for 10000)
            const filtered = val.replace(/[^0-9]/g, '').slice(0, 5);
            const num = parseInt(filtered) || 0;
            // Limit to 10000 max
            setCapacity(num > 10000 ? "10000" : filtered);
          }}
          keyboardType="numeric"
          maxLength={5}
        />
      </View>
    </View>
  );

  // Render Step 2: Technical Specs
  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>Technical Specifications</Text>

      {/* Venue Specifications */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Venue Specifications *</Text>
        {venueSpecifications.map((spec) => (
          <View key={spec.id} style={styles.specificationItem}>
            <Text style={styles.specText}>
              {spec.name}: {spec.value}
            </Text>
            <Pressable
              onPress={() =>
                setVenueSpecifications(
                  venueSpecifications.filter((s) => s.id !== spec.id)
                )
              }
            >
              <Ionicons name="trash-outline" size={18} color="#FF4444" />
            </Pressable>
          </View>
        ))}

        <View style={styles.addSpecificationForm}>
          <TextInput
            style={[styles.textInput, { marginBottom: 8 }]}
            placeholder="Specification name"
            value={customSpecificationInput}
            onChangeText={setCustomSpecificationInput}
          />
          <TextInput
            style={[styles.textInput, { marginBottom: 8 }]}
            placeholder="Specification value"
            value={specValueInput}
            onChangeText={setSpecValueInput}
          />
          <TextInput
            style={[styles.textInput, { marginBottom: 8 }]}
            placeholder="Notes (optional)"
            value={specNotesInput}
            onChangeText={setSpecNotesInput}
          />
          <Pressable
            style={styles.addButton}
            onPress={addCustomSpecification}
          >
            <Text style={styles.addButtonText}>Add Specification</Text>
          </Pressable>
        </View>
      </View>

      {/* Event Types */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Event Types *</Text>
        <ScrollView style={styles.eventTypesList} nestedScrollEnabled>
          {eventCategories.map((cat) => (
            <Pressable
              key={cat.id}
              style={[
                styles.eventTypeItem,
                selectedEventTypes.includes(cat.id.toString()) &&
                  styles.eventTypeItemActive,
              ]}
              onPress={() => toggleEventType(cat.id.toString())}
            >
              <Text
                style={[
                  styles.eventTypeText,
                  selectedEventTypes.includes(cat.id.toString()) &&
                    styles.eventTypeTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Dimensions */}
      <Text style={styles.label}>Venue Measurement & Floor Plan *</Text>

      {/* Venue Measurements */}
      <View style={styles.row2}>
        <View style={styles.flex1}>
          <Text style={styles.smallLabel}>Length (m) *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Length"
            value={length}
            onChangeText={setLength}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.flex1}>
          <Text style={styles.smallLabel}>Width (m) *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Width"
            value={width}
            onChangeText={setWidth}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Floor Area (m²)</Text>
        <TextInput
          style={[styles.textInput, { color: "#999" }]}
          placeholder="Auto-calculated"
          value={floorArea}
          editable={false}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Ceiling Height (m)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Ceiling height"
          value={ceilingHeight}
          onChangeText={setCeilingHeight}
          keyboardType="decimal-pad"
        />
      </View>

      {/* Floor Plan Visualization */}
      {length && width && !isNaN(parseFloat(length)) && !isNaN(parseFloat(width)) && (
        <VenueFloorPlanVisualizer length={length} width={width} doors={[]} />
      )}

      {/* Doors */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Door Placements</Text>
        {doors.map((door, index) => (
          <View key={door.id} style={styles.doorItem}>
            <Text style={styles.doorTitle}>Door {index + 1}</Text>
            
            {/* Width & Height */}
            <View style={styles.row2}>
              <View style={styles.flex1}>
                <Text style={styles.smallLabel}>Width (m)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Width"
                  value={door.width}
                  onChangeText={(val) => updateDoor(door.id, "width", val)}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.smallLabel}>Height (m)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Height"
                  value={door.height}
                  onChangeText={(val) => updateDoor(door.id, "height", val)}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Wall & Type */}
            <View style={styles.row2}>
              <View style={styles.flex1}>
                <Text style={styles.smallLabel}>Wall</Text>
                <Pressable
                  style={styles.miniDropdown}
                  onPress={() => setOpenDoorWallDropdown(openDoorWallDropdown === door.id ? null : door.id)}
                >
                  <Text style={styles.miniDropdownText}>{door.wall}</Text>
                  <Ionicons name="chevron-down" size={16} color="#666" />
                </Pressable>
                {openDoorWallDropdown === door.id && (
                  <View style={styles.dropdownMenu}>
                    {wallOptions.map((option) => (
                      <Pressable
                        key={option}
                        style={styles.dropdownItem}
                        onPress={() => {
                          updateDoor(door.id, "wall", option);
                          setOpenDoorWallDropdown(null);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{option}</Text>
                        {door.wall === option && (
                          <Ionicons name="checkmark" size={16} color="#007AFF" />
                        )}
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
              <View style={styles.flex1}>
                <DoorDropdown
                  label="Type"
                  value={door.type}
                  options={["Single Door", "Double Door", "Sliding Door", "Pocket Door"]}
                  onSelect={(value) => updateDoor(door.id, "type", value)}
                />
              </View>
            </View>

            {/* Offset & Swing Direction */}
            <View style={styles.row2}>
              <View style={styles.flex1}>
                <Text style={styles.smallLabel}>Offset (m)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Offset from corner"
                  value={door.offsetFromCorner}
                  onChangeText={(val) => updateDoor(door.id, "offsetFromCorner", val)}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.flex1}>
                <DoorDropdown
                  label="Swing"
                  value={door.swingDirection}
                  options={["Inward", "Outward"]}
                  onSelect={(value) => updateDoor(door.id, "swingDirection", value)}
                />
              </View>
            </View>

            {/* Hinge Position */}
            <View style={styles.fieldGroup}>
              <Text style={styles.smallLabel}>Hinge</Text>
              <Pressable
                style={styles.miniDropdown}
                onPress={() => setOpenDoorWallDropdown(openDoorWallDropdown === door.id + 1000 ? null : door.id + 1000)}
              >
                <Text style={styles.miniDropdownText}>{door.hingePosition}</Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </Pressable>
              {openDoorWallDropdown === door.id + 1000 && (
                <View style={styles.dropdownMenu}>
                  {["Left", "Right", "Center"].map((option) => (
                    <Pressable
                      key={option}
                      style={styles.dropdownItem}
                      onPress={() => {
                        updateDoor(door.id, "hingePosition", option);
                        setOpenDoorWallDropdown(null);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{option}</Text>
                      {door.hingePosition === option && (
                        <Ionicons name="checkmark" size={16} color="#007AFF" />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <Pressable
              style={styles.deleteButton}
              onPress={() => deleteDoor(door.id)}
            >
              <Ionicons name="trash-outline" size={18} color="#FF4444" />
              <Text style={styles.deleteButtonText}>Delete Door</Text>
            </Pressable>
          </View>
        ))}

        <Pressable style={styles.addButton} onPress={addDoor}>
          <Text style={styles.addButtonText}>+ Add Door</Text>
        </Pressable>
      </View>
    </View>
  );

  // Render Step 3: Media & Rules
  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>Media & Regulations</Text>

      {/* Unified Gallery & Thumbnail Section */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Gallery / Assets Upload * ({galleryImages.length}/10)</Text>
        
        {/* Featured/Main Image */}
        {galleryImages.length > 0 && (
          <View style={styles.featuredImageContainer}>
            <Image
              source={{ uri: thumbnailImage || galleryImages[0] }}
              style={styles.featuredImage}
            />
            {(thumbnailImage || galleryImages[0]) && (
              <View style={styles.featuredBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.featuredBadgeText}>Featured Thumbnail</Text>
              </View>
            )}
          </View>
        )}

        {/* Image Grid */}
        {galleryImages.length > 0 && (
          <View style={styles.imageGrid}>
            {galleryImages.map((image, index) => {
              const isThumbnail = thumbnailImage === image || (!thumbnailImage && index === 0);
              const isSelected = selectedImageIndex === index;
              return (
                <Pressable
                  key={index}
                  style={[
                    styles.gridImageContainer,
                    isThumbnail && styles.gridImageContainerActive,
                    isSelected && styles.gridImageContainerSelected,
                  ]}
                  onPress={() => setSelectedImageIndex(index)}
                >
                  <Image
                    source={{ uri: image }}
                    style={styles.gridImage}
                  />
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Action Buttons */}
        {galleryImages.length > 0 && (
          <View style={styles.imageActionButtonsContainer}>
            <Pressable
              style={styles.imageActionButtonPrimary}
              onPress={() => {
                const selectedIndex = selectedImageIndex !== null ? selectedImageIndex : 0;
                setThumbnailImage(galleryImages[selectedIndex]);
              }}
            >
              <Ionicons name="image" size={18} color="#FFFFFF" />
              <Text style={styles.imageActionButtonText}>Set Thumbnail</Text>
            </Pressable>
            <Pressable
              style={styles.imageActionButtonDanger}
              onPress={() => {
                const selectedIndex = selectedImageIndex !== null ? selectedImageIndex : 0;
                const deletedImage = galleryImages[selectedIndex];
                setGalleryImages(galleryImages.filter((_, i) => i !== selectedIndex));
                if (thumbnailImage === deletedImage) setThumbnailImage("");
                setSelectedImageIndex(null);
              }}
            >
              <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
              <Text style={styles.imageActionButtonText}>Delete</Text>
            </Pressable>
          </View>
        )}

        {/* Upload Button */}
        <Pressable
          style={styles.uploadButton}
          onPress={pickGalleryImage}
        >
          <Ionicons name="image-outline" size={20} color={Theme.colors.primary} />
          <Text style={styles.uploadButtonText}>Add Image</Text>
        </Pressable>
      </View>

      {/* Rules & Regulations */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Rules & Regulations *</Text>
        <TextInput
          style={[styles.textInput, styles.textAreaInput]}
          placeholder="Enter venue rules and regulations"
          value={rulesAndRegulations}
          onChangeText={setRulesAndRegulations}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Facilities */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Facilities * ({facilities.length})</Text>
        {facilities.map((facility, index) => (
          <View key={index} style={styles.facilityItem}>
            <Text style={styles.facilityText}>{facility}</Text>
            <Pressable
              onPress={() =>
                setFacilities(facilities.filter((_, i) => i !== index))
              }
            >
              <Ionicons name="trash-outline" size={18} color="#FF4444" />
            </Pressable>
          </View>
        ))}

        <View style={styles.addFacilityForm}>
          <TextInput
            style={[styles.textInput, { flex: 1, marginRight: 8 }]}
            placeholder="Add facility"
            value={customFacilityInput}
            onChangeText={setCustomFacilityInput}
          />
          <Pressable
            style={styles.smallAddButton}
            onPress={addFacility}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );

  // Render Step 4: Pricing & Contact
  const renderStep4 = () => (
    <View>
      <Text style={styles.stepTitle}>Pricing & Contact</Text>

      <View style={styles.row2}>
        <View style={styles.flex1}>
          <Text style={styles.label}>Hourly Rate (₱) *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Rate per hour"
            value={hourlyRate}
            onChangeText={setHourlyRate}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.flex1}>
          <Text style={styles.label}>Minimum Hours</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Minimum"
            value={minimumHours}
            onChangeText={setMinimumHours}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.row2}>
        <View style={styles.flex1}>
          <Text style={styles.label}>Weekend Rate (₱)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Weekend"
            value={weekendRate}
            onChangeText={setWeekendRate}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.flex1}>
          <Text style={styles.label}>Holiday Rate (₱)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Holiday"
            value={holidayRate}
            onChangeText={setHolidayRate}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Pricing Notes</Text>
        <TextInput
          style={[styles.textInput, styles.textAreaInput]}
          placeholder="Additional pricing notes"
          value={pricingNotes}
          onChangeText={setPricingNotes}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Overtime Rates */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Overtime Rates ({overtimeRates.length})</Text>
        {overtimeRates.map((rate, index) => (
          <View key={rate.id} style={styles.packageItem}>
            <Text style={styles.packageTitle}>Overtime Rate {index + 1}</Text>

            <View style={styles.row2}>
              <View style={styles.flex1}>
                <Text style={styles.smallLabel}>Rate Type</Text>
                <Pressable
                  style={styles.miniDropdown}
                  onPress={() => setOpenOvertimeDropdown(openOvertimeDropdown === rate.id ? null : rate.id)}
                >
                  <Text style={styles.miniDropdownText}>{rate.rateType}</Text>
                  <Ionicons name="chevron-down" size={16} color="#666" />
                </Pressable>
                {openOvertimeDropdown === rate.id && (
                  <View style={styles.dropdownMenu}>
                    {rateTypeOptions.map((option) => (
                      <Pressable
                        key={option}
                        style={styles.dropdownItem}
                        onPress={() => {
                          updateOvertimeRate(rate.id, "rateType", option);
                          setOpenOvertimeDropdown(null);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{option}</Text>
                        {rate.rateType === option && (
                          <Ionicons name="checkmark" size={16} color="#007AFF" />
                        )}
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
              <View style={styles.flex1}>
                <Text style={styles.smallLabel}>Price Per Hour (₱)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0.00"
                  value={rate.pricePerHour}
                  onChangeText={(val) => updateOvertimeRate(rate.id, "pricePerHour", val)}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.row2}>
              <View style={styles.flex1}>
                <Text style={styles.smallLabel}>Start Hour</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0"
                  value={rate.startHour}
                  onChangeText={(val) => updateOvertimeRate(rate.id, "startHour", val)}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.smallLabel}>End Hour (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0"
                  value={rate.endHour}
                  onChangeText={(val) => updateOvertimeRate(rate.id, "endHour", val)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Pressable
              style={styles.deleteButton}
              onPress={() => deleteOvertimeRate(rate.id)}
            >
              <Ionicons name="trash-outline" size={18} color="#FF4444" />
              <Text style={styles.deleteButtonText}>Delete Rate</Text>
            </Pressable>
          </View>
        ))}

        <Pressable style={styles.addButton} onPress={addOvertimeRate}>
          <Text style={styles.addButtonText}>+ Add Overtime Rate</Text>
        </Pressable>
      </View>


      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Pricing Packages * ({packages.length})</Text>
        {packages.map((pkg, index) => (
          <View key={pkg.id} style={styles.packageItem}>
            <Text style={styles.packageTitle}>Package {index + 1}</Text>

            <TextInput
              style={styles.textInput}
              placeholder="Package name"
              value={pkg.name}
              onChangeText={(val) => updatePackage(pkg.id, "name", val)}
            />

            <View style={styles.row2}>
              <View style={styles.flex1}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Duration (hours)"
                  value={pkg.duration}
                  onChangeText={(val) => updatePackage(pkg.id, "duration", val)}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.flex1}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Price"
                  value={pkg.price}
                  onChangeText={(val) => updatePackage(pkg.id, "price", val)}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              placeholder="Inclusions (comma-separated)"
              value={pkg.inclusions}
              onChangeText={(val) => updatePackage(pkg.id, "inclusions", val)}
              multiline
              numberOfLines={2}
            />

            <Pressable
              style={styles.deleteButton}
              onPress={() => deletePackage(pkg.id)}
            >
              <Ionicons name="trash-outline" size={18} color="#FF4444" />
              <Text style={styles.deleteButtonText}>Delete Package</Text>
            </Pressable>
          </View>
        ))}

        <Pressable style={styles.addButton} onPress={addPricingPackage}>
          <Text style={styles.addButtonText}>+ Add Package</Text>
        </Pressable>
      </View>

      {/* Contact Information */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Contact Information *</Text>
        <View style={styles.row2}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="venue@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>Phone *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="+63 9XX XXX XXXX"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar notificationCount={notificationCount} />

      {/* Header with Back and Save Buttons */}
      <View style={styles.editHeader}>
        <Pressable 
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Theme.colors.primary} />
          <Text style={styles.headerButtonText}>Back</Text>
        </Pressable>
        
        <Text style={styles.editHeaderTitle}>Edit Venue</Text>
        
        <Pressable 
          style={[
            styles.headerSaveButton,
            (!hasChanges || isSaving) && styles.headerSaveButtonDisabled
          ]}
          onPress={handleSaveVenue}
          disabled={!hasChanges || isSaving}
        >
          <Ionicons name="checkmark" size={24} color={!hasChanges || isSaving ? "#CCC" : "#FFF"} />
          <Text style={[
            styles.headerButtonText,
            { color: !hasChanges || isSaving ? "#CCC" : "#FFF" }
          ]}>
            {isSaving ? "Saving..." : "Save"}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stepper - Clickable in Edit Mode */}
        <View style={styles.stepper}>
          {steps.map((step, index) => (
            <Pressable
              key={index}
              style={styles.stepperItem}
              onPress={() => setCurrentStep(index + 1)}
            >
              <View
                style={[
                  styles.stepperDot,
                  currentStep >= index + 1 && styles.stepperDotActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepperNumber,
                    currentStep >= index + 1 && styles.stepperNumberActive,
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
              <Text style={styles.stepperLabel}>{step}</Text>
            </Pressable>
          ))}
        </View>

        {/* Steps Content */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <Pressable
              style={styles.secondaryButton}
              onPress={() => setCurrentStep(currentStep - 1)}
            >
              <Text style={styles.secondaryButtonText}>Back</Text>
            </Pressable>
          )}

          {currentStep < totalSteps ? (
            <Pressable
              style={[
                styles.primaryButton,
                !canProceedToNextStep() && styles.buttonDisabled,
              ]}
              onPress={handleNextStep}
              disabled={!canProceedToNextStep()}
            >
              <Text style={styles.primaryButtonText}>Next</Text>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.primaryButton, isSaving && styles.buttonDisabled]}
              onPress={handleSaveVenue}
              disabled={isSaving}
            >
              <Text style={styles.primaryButtonText}>
                {isSaving ? "Saving..." : "Save Venue"}
              </Text>
            </Pressable>
          )}
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
  editHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerBackButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  headerSaveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  headerSaveButtonDisabled: {
    backgroundColor: "#E5E5E5",
  },
  headerButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 13,
    color: Theme.colors.primary,
  },
  editHeaderTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
    flex: 1,
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },

  // Stepper
  stepper: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  stepperItem: {
    flex: 1,
    alignItems: "center",
  },
  stepperDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  stepperDotActive: {
    backgroundColor: Theme.colors.primary,
  },
  stepperNumber: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: "#999",
  },
  stepperNumberActive: {
    color: "#FFFFFF",
  },
  stepperLabel: {
    fontFamily: Theme.fonts.regular,
    fontSize: 11,
    color: Theme.colors.text,
    textAlign: "center",
  },

  // Step Content
  stepTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 20,
    color: Theme.colors.text,
    marginBottom: 16,
  },

  // Fields
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 13,
    color: Theme.colors.text,
    marginBottom: 8,
  },
  smallLabel: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: Theme.colors.text,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  textInputError: {
    borderColor: "#FF4444",
    borderWidth: 2,
  },
  errorText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: "#FF4444",
    marginTop: 4,
  },
  textAreaInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },

  // Row layout
  row1: {
    marginBottom: 16,
  },
  row2: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  flex1: {
    flex: 1,
  },

  // Dropdown
  dropdownButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownButtonText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  dropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownItemText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },

  // Mini Dropdown
  miniDropdown: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  miniDropdownText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: Theme.colors.text,
  },

  // Specifications
  specificationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  specText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.text,
  },
  addSpecificationForm: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },

  // Event Types
  eventTypesList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    padding: 8,
  },
  eventTypeItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 6,
    backgroundColor: "#F0F0F0",
  },
  eventTypeItemActive: {
    backgroundColor: Theme.colors.primary,
  },
  eventTypeText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.text,
  },
  eventTypeTextActive: {
    color: "#FFFFFF",
  },

  // Doors
  doorItem: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  doorTitle: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: 12,
  },

  // Gallery
  imageGallery: {
    marginBottom: 12,
    maxHeight: 120,
  },
  imageContainer: {
    position: "relative",
    marginRight: 12,
  },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },

  // Facilities
  facilityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  facilityText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.text,
  },
  addFacilityForm: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },

  // Packages
  packageItem: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  packageTitle: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: 12,
  },

  // Buttons
  addButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: "#FFFFFF",
  },
  smallAddButton: {
    width: 40,
    height: 40,
    backgroundColor: Theme.colors.primary,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#FF4444",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  deleteButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: "#FF4444",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: "center",
  },
  uploadButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.primary,
  },

  // Gallery Styles
  featuredImageContainer: {
    width: "100%",
    height: 220,
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#F0F0F0",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  featuredBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  featuredBadgeText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: "#FFFFFF",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  gridImageContainer: {
    width: "23%",
    aspectRatio: 1,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F0F0F0",
    borderWidth: 3,
    borderColor: "transparent",
  },
  gridImageContainerActive: {
    borderColor: Theme.colors.primary,
  },
  gridImageContainerSelected: {
    borderColor: "#333333",
    borderWidth: 3,
  },
  gridImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageActionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  imageActionButtonPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
  },
  imageActionButtonDanger: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FF4444",
    paddingVertical: 12,
    borderRadius: 8,
  },
  imageActionButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: "#FFFFFF",
  },

  // Navigation Buttons
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: "#FFFFFF",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
