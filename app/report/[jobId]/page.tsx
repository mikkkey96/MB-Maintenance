'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

type Job = {
  id: string
  address: string
  postcode: string
  problem: string
}

type FormData = {
  startTime: string
  finishTime: string
  requiresFollowUp: boolean
  postponed: boolean
  postponedDate?: string
  postponedReason?: string
}

export default function JobReportPage() {
  const params = useParams()
  const router = useRouter()
  
  // Добавь дебаг
  console.log('Params:', params)
  const jobId = params?.jobId as string
  console.log('Job ID:', jobId)
  
  const [job, setJob] = useState<Job | null>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [workItems, setWorkItems] = useState<string[]>([''])
  const [previews, setPreviews] = useState<string[]>([])
  const { register, handleSubmit, watch } = useForm<FormData>()

  const isPostponed = watch('postponed')

  useEffect(() => {
    if (!jobId) {
      console.error('No job ID!')
      return
    }
    
    console.log('Fetching job:', jobId)
    
    // Загрузить информацию о работе
    fetch(`/api/jobs/${jobId}`)
      .then(res => res.json())
      .then(data => {
        console.log('Job data:', data)
        if (data.success) {
          setJob(data.job)
        }
      })
      .catch(err => console.error('Fetch error:', err))
  }, [jobId])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setPhotos([...photos, ...newFiles])
      
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
    const formData = new FormData()
    
    photos.forEach((photo) => {
      formData.append('photos', photo)
    })
    
    const reportData = {
      jobId: jobId,
      workSummary: workItems.filter(item => item.trim() !== ''),
      startTime: data.startTime,
      finishTime: data.finishTime,
      requiresFollowUp: data.requiresFollowUp || false,
      postponed: data.postponed || false,
      postponedDate: data.postponedDate || null,
      postponedReason: data.postponedReason || null
    }
    
    formData.append('data', JSON.stringify(reportData))
    
    console.log('Uploading report...')
    
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert(`✅ Report saved! 
Photos uploaded: ${result.photoUrls?.length || 0}`)
        router.push('/jobs')
      } else {
        alert('❌ Error: ' + result.error)
      }
    } catch (error) {
      console.error('Network Error:', error)
      alert('❌ Network error: ' + error)
    }
  }

  if (!job) {
    return (
      <div className="p-8 text-center">
        <p>Loading job...</p>
        <p className="text-xs text-gray-500 mt-2">Job ID: {jobId || 'undefined'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-blue-900">Job Details</h2>
          <p className="text-blue-800 mt-1">{job.address}, {job.postcode}</p>
          <p className="text-sm text-blue-600 mt-1">Problem: {job.problem}</p>
        </div>

        <h1 className="text-3xl font-bold mb-6">Work Report</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
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

          {/* Postponed Option */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <input 
                {...register('postponed')}
                type="checkbox" 
                id="postponed"
                className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
              />
              <label htmlFor="postponed" className="text-sm font-medium cursor-pointer">
                ⏰ Work will be completed on another day
              </label>
            </div>

            {isPostponed && (
              <div className="space-y-4 pl-8 border-l-2 border-orange-300">
                <div>
                  <label className="block text-sm font-medium mb-2">Postponed Date</label>
                  <input
                    {...register('postponedDate')}
                    type="date"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Reason for Postponement</label>
                  <textarea
                    {...register('postponedReason')}
                    placeholder="Why is this work postponed?"
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Time Tracking - только если не отложено */}
          {!isPostponed && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Time</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Time</label>
                  <input 
                    {...register('startTime', { required: !isPostponed })}
                    type="time" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Finish Time</label>
                  <input 
                    {...register('finishTime', { required: !isPostponed })}
                    type="time" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Follow-up */}
          {!isPostponed && (
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
          )}

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
