export const CALCULATOR_PROFILE_CODES = {
  STANDARD_EU: "STANDARD_EU",
  US_CLIENTS: "US_CLIENTS",
} as const

export type CalculatorProfileCode =
  (typeof CALCULATOR_PROFILE_CODES)[keyof typeof CALCULATOR_PROFILE_CODES]
