'use client'

import ROIForm from './components/ROIForm'
import ROIPreview from './components/ROIPreview'
import { FormData } from './types'
import { useState } from 'react'

export default function Home() {
  const [formData, setFormData] = useState<FormData | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">ROI Page Generator</h1>
        
        {!showPreview ? (
          <ROIForm
            onSubmit={(data) => {
              setFormData(data)
              setShowPreview(true)
            }}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                ← Back to form
              </button>
            </div>
            
            <ROIPreview data={formData!} />
          </div>
        )}
      </div>
    </main>
  )
}
