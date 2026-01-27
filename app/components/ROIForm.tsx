'use client'

import { useState } from 'react'
import { FormData } from '../types'

interface ROIFormProps {
  onSubmit: (data: FormData) => void
}

export default function ROIForm({ onSubmit }: ROIFormProps) {
  const [formData, setFormData] = useState<Partial<FormData>>({
    companyName: '',
    companyLogo: null,
    reportPeriodLabel: 'Last 14 days',
    generatedBy: '',
    prsAnalyzed: 0,
    prsWithImplementedSuggestions: 0,
    implementedSuggestionsCount: 0,
    implementationRatePct: 0,
    impactCategories: [],
    highlights: [],
    nextSteps: [],
    ctaQuestion: 'Does this align with what you are seeing? What is missing to make this standard for the team?'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.companyName?.trim()) {
      newErrors.companyName = 'Company name is required'
    }

    if (formData.prsAnalyzed === undefined || formData.prsAnalyzed <= 0) {
      newErrors.prsAnalyzed = 'PRs analyzed must be greater than 0'
    }

    if (formData.implementedSuggestionsCount === undefined) {
      newErrors.implementedSuggestionsCount = 'Required field'
    }

    if (formData.implementationRatePct === undefined || formData.implementationRatePct < 0 || formData.implementationRatePct > 100) {
      newErrors.implementationRatePct = 'Must be between 0 and 100'
    }

    if (formData.highlights && formData.highlights.length > 3) {
      newErrors.highlights = 'Maximum of 3 highlights'
    }

    if (formData.nextSteps && formData.nextSteps.length > 3) {
      newErrors.nextSteps = 'Maximum of 3 next steps'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    let logoBase64: string | null = formData.companyLogo ?? null
    if (logoFile) {
      logoBase64 = await fileToBase64(logoFile)
    }

    onSubmit({
      companyName: formData.companyName!,
      companyLogo: logoBase64,
      reportPeriodLabel: formData.reportPeriodLabel!,
      generatedBy: formData.generatedBy ?? null,
      prsAnalyzed: formData.prsAnalyzed!,
      prsWithImplementedSuggestions: formData.prsWithImplementedSuggestions || 0,
      implementedSuggestionsCount: formData.implementedSuggestionsCount!,
      implementationRatePct: formData.implementationRatePct!,
      impactCategories: formData.impactCategories || [],
      highlights: formData.highlights?.filter(h => h.trim()) || [],
      nextSteps: formData.nextSteps?.filter(s => s.trim()) || [],
      ctaQuestion: formData.ctaQuestion!
    })
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const addImpactCategory = () => {
    setFormData(prev => ({
      ...prev,
      impactCategories: [...(prev.impactCategories || []), { label: '', count: 0 }]
    }))
  }

  const removeImpactCategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      impactCategories: (prev.impactCategories || []).filter((_, i) => i !== index)
    }))
  }

  const updateImpactCategory = (index: number, field: 'label' | 'count', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      impactCategories: (prev.impactCategories || []).map((cat, i) =>
        i === index ? { ...cat, [field]: value } : cat
      )
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Fill in the data to generate the ROI Page</h2>

      {/* Company Section */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Company</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company name *
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Acme Corp"
          />
          {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company logo (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setLogoFile(file)
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <p className="text-sm text-gray-500 mt-1">Or paste the logo URL:</p>
          <input
            type="url"
            value={formData.companyLogo || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, companyLogo: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://company.com/logo.png"
          />
        </div>
      </div>

      {/* Report Metadata */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Report Metadata</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Report period *
          </label>
          <input
            type="text"
            value={formData.reportPeriodLabel}
            onChange={(e) => setFormData(prev => ({ ...prev, reportPeriodLabel: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Last 14 days or Jan 1 2026 – Jan 15 2026"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Generated by (optional)
          </label>
          <input
            type="text"
            value={formData.generatedBy || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, generatedBy: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your name"
          />
        </div>
      </div>

      {/* Core Usage Metrics */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Usage Metrics</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PRs analyzed *
            </label>
            <input
              type="number"
              min="1"
              value={formData.prsAnalyzed}
              onChange={(e) => setFormData(prev => ({ ...prev, prsAnalyzed: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.prsAnalyzed && <p className="text-red-500 text-sm mt-1">{errors.prsAnalyzed}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PRs with Kodus action
            </label>
            <input
              type="number"
              min="0"
              value={formData.prsWithImplementedSuggestions}
              onChange={(e) => setFormData(prev => ({ ...prev, prsWithImplementedSuggestions: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Implemented suggestions *
            </label>
            <input
              type="number"
              min="0"
              value={formData.implementedSuggestionsCount}
              onChange={(e) => setFormData(prev => ({ ...prev, implementedSuggestionsCount: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.implementedSuggestionsCount && <p className="text-red-500 text-sm mt-1">{errors.implementedSuggestionsCount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Implementation rate (%) *
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.implementationRatePct}
              onChange={(e) => setFormData(prev => ({ ...prev, implementationRatePct: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.implementationRatePct && <p className="text-red-500 text-sm mt-1">{errors.implementationRatePct}</p>}
          </div>
        </div>
      </div>

      {/* Impact by Category */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Impact by Category</h3>

        {formData.impactCategories?.map((cat, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="text"
              value={cat.label}
              onChange={(e) => updateImpactCategory(index, 'label', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Logical bugs"
            />
            <input
              type="number"
              min="0"
              value={cat.count}
              onChange={(e) => updateImpactCategory(index, 'count', parseInt(e.target.value) || 0)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Qty"
            />
            <button
              type="button"
              onClick={() => removeImpactCategory(index)}
              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addImpactCategory}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          + Add category
        </button>
      </div>

      {/* Highlights */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Quick Read (up to 3 highlights)</h3>

        {formData.highlights?.slice(0, 3).map((highlight, index) => (
          <div key={index} className="flex gap-2 items-center">
            <span className="text-gray-500">•</span>
            <input
              type="text"
              value={highlight}
              onChange={(e) => {
                const newHighlights = [...(formData.highlights || [])]
                newHighlights[index] = e.target.value
                setFormData(prev => ({ ...prev, highlights: newHighlights }))
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Strong trust signal..."
            />
          </div>
        ))}

        {(!formData.highlights || formData.highlights.length < 3) && (
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, highlights: [...(prev.highlights || []), ''] }))}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            + Add highlight
          </button>
        )}
        {errors.highlights && <p className="text-red-500 text-sm">{errors.highlights}</p>}
        <p className="text-sm text-gray-500">If left blank, they will be generated automatically based on metrics.</p>
      </div>

      {/* Next Steps */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Next Level of Impact (up to 3)</h3>

        {formData.nextSteps?.slice(0, 3).map((step, index) => (
          <div key={index} className="flex gap-2 items-center">
            <span className="text-gray-500">→</span>
            <input
              type="text"
              value={step}
              onChange={(e) => {
                const newNextSteps = [...(formData.nextSteps || [])]
                newNextSteps[index] = e.target.value
                setFormData(prev => ({ ...prev, nextSteps: newNextSteps }))
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Reduce noise..."
            />
          </div>
        ))}

        {(!formData.nextSteps || formData.nextSteps.length < 3) && (
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, nextSteps: [...(prev.nextSteps || []), ''] }))}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            + Add next step
          </button>
        )}
        {errors.nextSteps && <p className="text-red-500 text-sm">{errors.nextSteps}</p>}
        <p className="text-sm text-gray-500">If left blank, default suggestions will be used.</p>
      </div>

      {/* CTA Question */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Footer / CTA</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conversation invitation question
          </label>
          <textarea
            value={formData.ctaQuestion}
            onChange={(e) => setFormData(prev => ({ ...prev, ctaQuestion: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
      >
        ROI Page Preview →
      </button>
    </form>
  )
}
