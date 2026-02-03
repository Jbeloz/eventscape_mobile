import { ModifierType, VenueSeasonalPricing } from "../models/types";

/**
 * Checks if a given date falls within a seasonal pricing period
 */
export function isDateInSeason(
  date: Date,
  season: VenueSeasonalPricing
): boolean {
  const startDate = new Date(season.start_date);
  const endDate = new Date(season.end_date);
  
  // Set time to midnight for consistent comparison
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  
  return checkDate >= startDate && checkDate <= endDate;
}

/**
 * Checks if a date range overlaps with a seasonal pricing period
 */
export function dateRangeOverlapsSeason(
  startDate: Date,
  endDate: Date,
  season: VenueSeasonalPricing
): boolean {
  const seasonStart = new Date(season.start_date);
  const seasonEnd = new Date(season.end_date);
  
  // Set times to midnight for consistent comparison
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  seasonStart.setHours(0, 0, 0, 0);
  seasonEnd.setHours(0, 0, 0, 0);
  
  // Check if ranges overlap
  return startDate <= seasonEnd && endDate >= seasonStart;
}

/**
 * Finds all active seasons that overlap with given date range
 */
export function findApplicableSeasons(
  startDate: Date,
  endDate: Date,
  seasons: VenueSeasonalPricing[]
): VenueSeasonalPricing[] {
  return seasons.filter(
    season => 
      season.is_active && 
      dateRangeOverlapsSeason(startDate, endDate, season)
  );
}

/**
 * Calculates the adjusted price based on seasonal modifiers
 * @param basePrice - Original base price
 * @param modifierType - Type of modifier: 'Fixed', 'Percentage'
 * @param modifierValue - The modifier value
 * @returns Adjusted price
 */
export function calculateAdjustedPrice(
  basePrice: number,
  modifierType: ModifierType,
  modifierValue: number
): number {
  if (modifierType === "Percentage") {
    // Positive value = percentage increase, negative = percentage decrease
    return basePrice * (1 + modifierValue / 100);
  } else if (modifierType === "Fixed") {
    // Fixed adjustment (can be positive or negative)
    return basePrice + modifierValue;
  }
  return basePrice;
}

/**
 * Interface for seasonal pricing calculation result
 */
export interface SeasonalPricingResult {
  basePrice: number;
  applicableSeasons: VenueSeasonalPricing[];
  adjustedPrice: number;
  totalAdjustment: number;
  adjustmentPercentage: number;
  description: string;
}

/**
 * Calculates the final price considering all applicable seasonal adjustments
 * @param basePrice - The original base price
 * @param startDate - Booking start date
 * @param endDate - Booking end date
 * @param applicableSeasons - Array of applicable seasonal pricing rules
 * @returns SeasonalPricingResult with detailed breakdown
 */
export function calculateSeasonalPrice(
  basePrice: number,
  startDate: Date,
  endDate: Date,
  applicableSeasons: VenueSeasonalPricing[]
): SeasonalPricingResult {
  if (applicableSeasons.length === 0) {
    return {
      basePrice,
      applicableSeasons: [],
      adjustedPrice: basePrice,
      totalAdjustment: 0,
      adjustmentPercentage: 0,
      description: "No seasonal adjustments applied",
    };
  }

  // For simplicity, we'll apply the first applicable season
  // In production, you might want to combine multiple seasons or use the most impactful one
  const season = applicableSeasons[0];
  const adjustedPrice = calculateAdjustedPrice(
    basePrice,
    season.modifier_type,
    season.modifier_value
  );
  
  const totalAdjustment = adjustedPrice - basePrice;
  const adjustmentPercentage = (totalAdjustment / basePrice) * 100;
  
  const description = generateSeasonalDescription(season, adjustmentPercentage);

  return {
    basePrice,
    applicableSeasons,
    adjustedPrice: Math.round(adjustedPrice * 100) / 100, // Round to 2 decimal places
    totalAdjustment: Math.round(totalAdjustment * 100) / 100,
    adjustmentPercentage: Math.round(adjustmentPercentage * 100) / 100,
    description,
  };
}

/**
 * Generates a human-readable description of the seasonal adjustment
 */
export function generateSeasonalDescription(
  season: VenueSeasonalPricing,
  adjustmentPercentage: number
): string {
  const seasonName = season.season_name;
  
  if (season.modifier_type === "Percentage") {
    if (season.modifier_value > 0) {
      return `${adjustmentPercentage.toFixed(1)}% ${seasonName} Surcharge Applied`;
    } else {
      return `${Math.abs(adjustmentPercentage).toFixed(1)}% ${seasonName} Discount Applied`;
    }
  } else {
    if (season.modifier_value > 0) {
      return `₱${season.modifier_value.toFixed(2)} ${seasonName} Surcharge Applied`;
    } else {
      return `₱${Math.abs(season.modifier_value).toFixed(2)} ${seasonName} Discount Applied`;
    }
  }
}

/**
 * Formats date to YYYY-MM-DD string
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parses date string (YYYY-MM-DD) to Date object
 */
export function parseStringToDate(dateString: string): Date {
  return new Date(dateString + "T00:00:00");
}
