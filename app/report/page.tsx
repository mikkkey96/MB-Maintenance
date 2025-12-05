'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  address: string
  postcode: string
  startTime: string
  finishTime: string
  requiresFollowUp: boolean
}

export default function ReportPage() {
  const [photos, setPhotos] = useState<File[]>([])
  const [workItems, setWorkItems] = useState<string[]>([''])
  const [previews, setPreviews] = useState<string[]>([])
  const { register, handleSubmit } = useForm<FormData>()

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setPhotos([...photos, ...newFiles])
      
      // Создаём превью
      newFiles.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const addWorkItem = () => {
    setWorkItems([...workItems, ''])
  }

  const updateWorkItem = (index: number, value: string) => {
    const newItems = [...workItems]
    newItems[index] = value
    setWorkItems(newItems)
  }

  const removeWorkItem = (index: number) => {
    setWorkItems(workItems.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: FormData) => {
    console.log('Form data:', data)
    console.log('Work items:', workItems)
    console.log('Photos:', photos)
    
    // Создаём FormData для отправки файлов
    const formData = new FormData()
    
    // Добавляем фотки
    photos.forEach((photo) => {
      formData.append('photos', photo)
    })
    
    // Добавляем остальные данные как JSON
    const reportData = {
      address: data.address,
      postcode: data.postcode,
      workSummary: workItems.filter(item => item.trim() !== ''),
      startTime: data.startTime,
      finishTime: data.finishTime,
      requiresFollowUp: data.requiresFollowUp || false
    }
    
    formData.append('data', JSON.stringify(reportData))
    
    console.log('Uploading photos...')
    
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        body: formData // Отправляем FormData, не JSON!
      })
      
      console.log('Response status:', response.status)
      
      const result = await response.json()
      console.log('API Response:', result)
      
      if (result.success) {
        alert(`✅ Report saved! 
ID: ${result.report.id}
Photos uploaded: ${result.photoUrls?.length || 0}`)
        window.location.reload()
      } else {
        alert('❌ Error: ' + result.error)
      }
    } catch (error) {
      console.error('Network Error:', error)
      alert('❌ Network error: ' + error)
    }
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Work Report</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <input 
                  {...register('address', { required: true })}
                  type="text"
                  placeholder="18 Coronation Drive"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Postcode</label>
                <input 
                  {...register('postcode', { required: true })}
                  type="text"
                  placeholder="L23 3BN"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Photos</h2>
            
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              multiple 
              onChange={handlePhotoUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              {previews.map((preview, idx) => (
                <div key={idx} className="relative">
                  <img 
                    src={preview} 
                    alt={`Preview ${idx + 1}`}
                    className="rounded-lg h-40 w-full object-cover border-2 border-gray-200"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    Photo {idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Work Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Work Summary</h2>
            
            {workItems.map((item, idx) => (
              <div key={idx} className="mb-3">
                <div className="flex gap-2">
                  <textarea
                    value={item}
                    onChange={(e) => updateWorkItem(idx, e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe work performed..."
                    rows={3}
                  />
                  {workItems.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeWorkItem(idx)}
                      className="px-3 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            <button 
              type="button" 
              onClick={addWorkItem}
              className="text-blue-600 text-sm font-medium hover:text-blue-800"
            >
              + Add another item
            </button>
          </div>

          {/* Time Tracking */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Time</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Time</label>
                <input 
                  {...register('startTime', { required: true })}
                  type="time" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Finish Time</label>
                <input 
                  {...register('finishTime', { required: true })}
                  type="time" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Follow-up */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <input 
                {...register('requiresFollowUp')}
                type="checkbox" 
                id="followup"
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="followup" className="text-sm font-medium cursor-pointer">
                This job requires a follow-up inspection
              </label>
            </div>
          </div>

          {/* Submit */}
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white p-4 rounded-lg font-semibold text-lg hover:bg-blue-700 shadow-lg"
          >
            Submit Report
          </button>
        </form>
      </div>
    </div>
  )
}
