'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Job = {
  id: string
  address: string
  postcode: string
  problem: string
  status: string
  createdAt: string
  report?: {
    postponed: boolean
    postponedDate: string | null
    postponedReason: string | null
  }
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    console.log('Fetching jobs...')
    fetch('/api/jobs')
      .then(res => {
        console.log('Response status:', res.status)
        return res.json()
      })
      .then(data => {
        console.log('Jobs data:', data)
        if (data.success) {
          setJobs(data.jobs)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching jobs:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="p-8 text-center">Loading jobs...</div>
  }

  const pendingJobs = jobs.filter(j => j.status === 'PENDING')
  const completedJobs = jobs.filter(j => j.status === 'COMPLETED')

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 rounded-lg p-2 w-12 h-12 flex items-center justify-center">
              <span className="text-white text-xl font-bold">MB</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Mersey Bathrooms</h1>
              <p className="text-xs text-gray-500">My Jobs</p>
            </div>
          </div>
        </div>

        {/* Pending Jobs */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Pending Jobs ({pendingJobs.length})
          </h2>
          {pendingJobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              No pending jobs
            </div>
          ) : (
            <div className="space-y-4">
              {pendingJobs.map(job => (
                <div key={job.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{job.address}</h3>
                      <p className="text-gray-600">{job.postcode}</p>
                      <p className="text-sm text-gray-500 mt-2">{job.problem}</p>
                      
                      {job.report?.postponed && (
                        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-sm font-medium text-orange-800">
                            ⏰ Postponed to: {job.report.postponedDate}
                          </p>
                          {job.report.postponedReason && (
                            <p className="text-xs text-orange-600 mt-1">
                              Reason: {job.report.postponedReason}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                      Pending
                    </span>
                  </div>
                  
                  <button
                    onClick={() => {
                      console.log('Navigating to:', `/report/${job.id}`)
                      router.push(`/report/${job.id}`)
                    }}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 cursor-pointer"
                  >
                    {job.report?.postponed ? 'Complete Job' : 'Start Report'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Jobs */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Completed Jobs ({completedJobs.length})
          </h2>
          {completedJobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              No completed jobs yet
            </div>
          ) : (
            <div className="space-y-4">
              {completedJobs.map(job => (
                <div key={job.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">{job.address}</h3>
                      <p className="text-gray-600">{job.postcode}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
