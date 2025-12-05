'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

type Job = {
  id: string
  address: string
  postcode: string
  problem: string
  status: string
  customerPhone: string
  scheduledDate: string | null
  timeFrom: string | null
  timeTo: string | null
  createdAt: string
  report?: {
    id: string
    workSummary: string
    photos: string
    startTime: string | null
    finishTime: string | null
    requiresFollowUp: boolean
    postponed: boolean
    postponedDate: string | null
    postponedReason: string | null
  }
}

type FormData = {
  address: string
  postcode: string
  problem: string
  customerPhone: string
  scheduledDate: string
  timeFrom: string
  timeTo: string
}

export default function BossPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset } = useForm<FormData>()

  const loadJobs = async () => {
    try {
      const response = await fetch('/api/jobs')
      const data = await response.json()
      if (data.success) {
        setJobs(data.jobs)
      }
    } catch (e) {
      console.error('Error loading jobs', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [])

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        scheduledDate: data.scheduledDate || null,
        timeFrom: data.timeFrom || null,
        timeTo: data.timeTo || null,
      }

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        alert('✅ Job created!')
        reset()
        setShowForm(false)
        loadJobs()
      } else {
        alert('❌ Error: ' + result.error)
      }
    } catch (error) {
      alert('❌ Network error: ' + error)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 rounded-lg p-2 w-12 h-12 flex items-center justify-center">
              <span className="text-white text-xl font-bold">MB</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mersey Bathrooms</h1>
              <p className="text-xs text-gray-500">Boss Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 font-semibold"
          >
            {showForm ? 'Cancel' : '+ Create New Job'}
          </button>
        </div>

        {/* Create Job Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Job</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <input
                  {...register('address', { required: true })}
                  type="text"
                  placeholder="18 Coronation Drive"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Postcode</label>
                <input
                  {...register('postcode', { required: true })}
                  type="text"
                  placeholder="L23 3BN"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Customer phone</label>
                <input
                  {...register('customerPhone', { required: true })}
                  type="tel"
                  placeholder="+44 7..."
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    {...register('scheduledDate')}
                    type="date"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">From</label>
                  <input
                    {...register('timeFrom')}
                    type="time"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">To</label>
                  <input
                    {...register('timeTo')}
                    type="time"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Problem Description</label>
                <textarea
                  {...register('problem', { required: true })}
                  placeholder="Describe the issue..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 font-semibold"
              >
                Create Job
              </button>
            </form>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-4 mb-4">
          <div className="bg-blue-100 rounded-lg p-4 flex-1">
            <div className="text-2xl font-bold text-blue-800">
              {jobs.filter(j => j.status === 'PENDING').length}
            </div>
            <div className="text-sm text-blue-600">Pending</div>
          </div>
          <div className="bg-yellow-100 rounded-lg p-4 flex-1">
            <div className="text-2xl font-bold text-yellow-800">
              {jobs.filter(j => j.status === 'IN_PROGRESS').length}
            </div>
            <div className="text-sm text-yellow-600">In Progress</div>
          </div>
          <div className="bg-green-100 rounded-lg p-4 flex-1">
            <div className="text-2xl font-bold text-green-800">
              {jobs.filter(j => j.status === 'COMPLETED').length}
            </div>
            <div className="text-sm text-green-600">Completed</div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="grid gap-4">
          {jobs.map(job => {
            const photos = job.report ? JSON.parse(job.report.photos) : []
            const workSummary = job.report ? JSON.parse(job.report.workSummary) : []

            return (
              <div key={job.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{job.address}</h3>
                    <p className="text-gray-600">{job.postcode}</p>
                    <p className="text-sm text-gray-500 mt-2">{job.problem}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Client phone: {job.customerPhone}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {job.scheduledDate
                        ? `When: ${new Date(job.scheduledDate).toLocaleDateString()} ${job.timeFrom || ''}–${job.timeTo || ''}`
                        : 'When: not scheduled'}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : job.status === 'IN_PROGRESS'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                {job.report && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold mb-2">Work Report:</h4>
                    <ul className="space-y-1 mb-3">
                      {workSummary.map((item: string, idx: number) => (
                        <li key={idx} className="text-gray-700">
                          • {item}
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                      {job.report.startTime && job.report.finishTime && (
                        <span>
                          ⏱️ {job.report.startTime} - {job.report.finishTime}
                        </span>
                      )}
                      {job.report.requiresFollowUp && (
                        <span className="text-orange-600 font-medium">
                          ⚠️ Requires follow-up
                        </span>
                      )}
                      {job.report.postponed && (
                        <span className="text-orange-600 font-medium">
                          ⏰ Postponed to {job.report.postponedDate || '-'}
                        </span>
                      )}
                    </div>

                    {photos.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium mb-2">Photos:</p>
                        <div className="grid grid-cols-4 gap-2">
                          {photos.map((url: string, idx: number) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative group"
                            >
                              <img
                                src={url}
                                alt={`Photo ${idx + 1}`}
                                className="rounded-lg h-24 w-full object-cover border-2 border-gray-200 hover:border-orange-500 transition"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Кнопка Download PDF */}
                    <a
                      href={`/api/reports/${job.report.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 text-sm"
                    >
                      Download PDF
                    </a>
                  </div>
                )}

                <div className="text-xs text-gray-500 mt-4">
                  Created: {new Date(job.createdAt).toLocaleString()}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
