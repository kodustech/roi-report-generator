'use client'

import { useState } from 'react'
import { FormData } from '../types'

interface ROIPreviewProps {
  data: FormData
}

export default function ROIPreview({ data }: ROIPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [scale, setScale] = useState<'normal' | 'compact' | 'tiny'>('normal')

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getHighlights = (): string[] => {
    if (data.highlights && data.highlights.length > 0 && data.highlights.some(h => h.trim())) {
      return data.highlights.filter(h => h.trim())
    }

    const autoHighlights: string[] = []

    if (data.implementationRatePct >= 40) {
      autoHighlights.push('Value signal: the team is applying suggestions in the merge flow.')
    }

    if (data.prsWithImplementedSuggestions > 0) {
      autoHighlights.push('Kodus already influenced real merges (PRs with registered action).')
    }

    if (data.impactCategories && data.impactCategories.length > 0) {
      const top2 = data.impactCategories
        .sort((a, b) => b.count - a.count)
        .slice(0, 2)
        .map(c => c.label)
        .join(' and ')
      autoHighlights.push(`Main impact categories: ${top2}.`)
    }

    return autoHighlights.slice(0, 2)
  }

  const getNextSteps = (): string[] => {
    if (data.nextSteps && data.nextSteps.length > 0 && data.nextSteps.some(s => s.trim())) {
      return data.nextSteps.filter(s => s.trim())
    }

    return [
      'Reduce noise and focus on rules with higher return',
      'Define team baseline to standardize what is "must-fix"'
    ]
  }

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Kodus-Impacto-${data.companyName}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const scaleClasses = {
    normal: 'a4-page',
    compact: 'a4-page a4-page-compact',
    tiny: 'a4-page a4-page-tiny'
  }

  const highlights = getHighlights()
  const nextSteps = getNextSteps()

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-lg">
        <div className="flex gap-2">
          <button
            onClick={() => setScale('normal')}
            className={`px-4 py-2 rounded ${scale === 'normal' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Normal
          </button>
          <button
            onClick={() => setScale('compact')}
            className={`px-4 py-2 rounded ${scale === 'compact' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Compact
          </button>
          <button
            onClick={() => setScale('tiny')}
            className={`px-4 py-2 rounded ${scale === 'tiny' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Tiny
          </button>
        </div>

        <button
          onClick={generatePDF}
          disabled={isGenerating}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {isGenerating ? 'Generating PDF...' : '📄 Generate PDF'}
        </button>
      </div>

      <div className="flex justify-center">
        <div className={`${scaleClasses[scale]} bg-white shadow-2xl`}>
          <div className="font-sans text-gray-900">
            <div className="border-b-2 border-gray-900 pb-4 mb-6">
              <div className="flex items-start gap-4">
                {data.companyLogo ? (
                  <img
                    src={data.companyLogo}
                    alt={data.companyName}
                    className="h-16 w-16 object-contain"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600 rounded">
                    {getInitials(data.companyName)}
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">Kodus Observed Impact</h1>
                  <p className="text-gray-600 mt-1">
                    Based on real usage • {data.reportPeriodLabel}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {data.companyName}
                    {data.generatedBy && ` • Generated by ${data.generatedBy}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <MetricCard
                label="Implemented suggestions"
                value={data.implementedSuggestionsCount}
                highlight
              />
              <MetricCard
                label="Implementation rate"
                value={`${data.implementationRatePct}%`}
                highlight
              />
              <MetricCard label="PRs analyzed" value={data.prsAnalyzed} />
              <MetricCard
                label="PRs with Kodus action"
                value={data.prsWithImplementedSuggestions}
              />
            </div>

            {data.impactCategories && data.impactCategories.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Impact by Category</h2>
                <div className="bg-gray-50 rounded border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left px-4 py-2">Category</th>
                        <th className="text-right px-4 py-2">Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.impactCategories
                        .sort((a, b) => b.count - a.count)
                        .map((cat, index) => (
                          <tr key={index} className="border-b last:border-b-0">
                            <td className="px-4 py-2">{cat.label}</td>
                            <td className="px-4 py-2 text-right font-medium">{cat.count}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Automatic classification based on accepted/implemented suggestions.
                </p>
              </div>
            )}

            {highlights.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Quick Read</h2>
                <ul className="space-y-2">
                  {highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {nextSteps.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Next Level of Impact</h2>
                <ul className="space-y-2">
                  {nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">→</span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-t-2 border-gray-900 pt-4 mt-8">
              <p className="font-medium text-gray-900 mb-2">We want to hear from you:</p>
              <p className="text-gray-700 mb-4">{data.ctaQuestion}</p>
              <div className="flex justify-end">
                <img
                  src="/kodus_light.png"
                  alt="Kodus"
                  className="h-8 opacity-70"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, highlight }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div className={`p-3 rounded border ${highlight ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
      <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  )
}
