export interface ImpactCategory {
  label: string
  count: number
}

export interface FormData {
  companyName: string
  companyLogo: string | null
  reportPeriodLabel: string
  generatedBy: string | null
  prsAnalyzed: number
  prsWithImplementedSuggestions: number
  implementedSuggestionsCount: number
  implementationRatePct: number
  impactCategories: ImpactCategory[]
  highlights: string[]
  nextSteps: string[]
  ctaQuestion: string
}
