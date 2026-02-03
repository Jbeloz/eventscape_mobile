/**
 * Seasonal Pricing Utility Functions
 */

export interface PricingBreakdown {
  basePrice: number
  seasonalAdjustment: number
  seasonalName?: string
  modifierType?: string // 'percentage' | 'fixed'
  finalPrice: number
}

/**
 * Calculate the final price based on base rate and seasonal pricing
 * @param basePrice The base price from venue_base_rates
 * @param eventDate The event date to check against seasonal pricing
 * @param seasonalPricings Array of seasonal pricing records for the venue
 * @returns PricingBreakdown object with base, adjustment, and final price
 */
export function calculateSeasonalPrice(
  basePrice: number,
  eventDate: string,
  seasonalPricings: any[] = []
): PricingBreakdown {
  let seasonalAdjustment = 0
  let seasonalName: string | undefined
  let modifierType: string | undefined

  // Check if event date falls within any seasonal pricing range
  const eventDateTime = new Date(eventDate)
  
  const applicableSeason = seasonalPricings.find((season) => {
    if (!season.is_active) return false
    
    const startDate = new Date(season.start_date)
    const endDate = new Date(season.end_date)
    
    // Set end date to end of day for inclusive comparison
    endDate.setHours(23, 59, 59, 999)
    
    return eventDateTime >= startDate && eventDateTime <= endDate
  })

  if (applicableSeason) {
    seasonalName = applicableSeason.season_name
    modifierType = applicableSeason.modifier_type

    if (applicableSeason.modifier_type === 'percentage') {
      // Apply percentage modifier (positive = markup, negative = discount)
      seasonalAdjustment = basePrice * (applicableSeason.modifier_value / 100)
    } else if (applicableSeason.modifier_type === 'fixed') {
      // Apply fixed modifier amount
      seasonalAdjustment = applicableSeason.modifier_value
    }
  }

  const finalPrice = basePrice + seasonalAdjustment

  return {
    basePrice,
    seasonalAdjustment,
    seasonalName,
    modifierType,
    finalPrice: Math.max(0, finalPrice), // Ensure price doesn't go negative
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  })
  return formatter.format(amount)
}

/**
 * Format price breakdown for display
 */
export function formatPriceBreakdown(breakdown: PricingBreakdown): string {
  const base = formatCurrency(breakdown.basePrice)
  
  if (breakdown.seasonalName && breakdown.seasonalAdjustment !== 0) {
    const adjustment = formatCurrency(breakdown.seasonalAdjustment)
    const sign = breakdown.seasonalAdjustment > 0 ? '+' : ''
    const percentage = breakdown.modifierType === 'percentage' 
      ? ` (${breakdown.modifierType === 'percentage' ? breakdown.seasonalAdjustment.toFixed(1) : ''}%)`
      : ''
    
    return `Base: ${base}\n${breakdown.seasonalName}: ${sign}${adjustment}${percentage}\nTotal: ${formatCurrency(breakdown.finalPrice)}`
  }
  
  return `Base: ${base}\nTotal: ${formatCurrency(breakdown.finalPrice)}`
}
