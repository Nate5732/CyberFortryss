'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

interface Assignment {
  id: string
  module_id: number
  status: string
  sent_at: string
  token: string
  modules: {
    title: string
    description: string
  }
}

interface Result {
  id: string
  score: number
  completed_at: string
  module_id: number
  modules: {
    title: string
  }
}

interface UserProfile {
  email: string
  full_name: string
  townships: {
    name: string
  } | {
    name: string
  }[] | null
}

export default function UserDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('email, full_name, townships(name)')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
      } else {
        setProfile(profileData)
      }

      // Get training assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('training_assignments')
        .select('*, modules(title, description)')
        .eq('email', user.email)
        .order('sent_at', { ascending: false })

      if (assignmentsError) {
        console.error('Assignments error:', assignmentsError)
      } else {
        setAssignments(assignmentsData || [])
      }

      // Get past results
      const { data: resultsData, error: resultsError } = await supabase
        .from('results')
        .select('*, modules(title)')
        .eq('email', user.email)
        .order('completed_at', { ascending: false })

      if (resultsError) {
        console.error('Results error:', resultsError)
      } else {
        setResults(resultsData || [])
      }

      setLoading(false)
    }

    loadDashboard()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const pendingAssignments = assignments.filter(a => a.status === 'pending')
  const completedAssignments = assignments.filter(a => a.status === 'completed')
  const completionRate = assignments.length > 0 
    ? Math.round((completedAssignments.length / assignments.length) * 100)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <rect x="8" y="20" width="24" height="16" fill="url(#gradient)" rx="2"/>
              <rect x="12" y="16" width="4" height="4" fill="currentColor" className="text-purple-500" opacity="0.8"/>
              <rect x="24" y="16" width="4" height="4" fill="currentColor" className="text-purple-500" opacity="0.8"/>
              <path d="M20 4L32 12V16H8V12L20 4Z" fill="url(#gradient2)"/>
              <rect x="16" y="26" width="8" height="10" fill="currentColor" className="text-white" opacity="0.3" rx="1"/>
              <defs>
                <linearGradient id="gradient" x1="8" y1="20" x2="32" y2="36">
                  <stop stopColor="#a855f7" />
                  <stop offset="1" stopColor="#ec4899" />
                </linearGradient>
                <linearGradient id="gradient2" x1="8" y1="4" x2="32" y2="16">
                  <stop stopColor="#ec4899" />
                  <stop offset="1" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-xl font-bold">CyberFortRYSS</span>
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/threats')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Threat Intelligence
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:opacity-90"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.full_name || user.email}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {Array.isArray(profile?.townships) 
              ? profile?.townships[0]?.name 
              : profile?.townships?.name || 'Your Township'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Completion Rate</h3>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-bold">{completionRate}%</p>
              <p className="text-gray-500 mb-1">
                {completedAssignments.length}/{assignments.length}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pending Trainings</h3>
            <p className="text-4xl font-bold">{pendingAssignments.length}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Completed</h3>
            <p className="text-4xl font-bold">{results.length}</p>
          </div>
        </div>

        {/* Pending Trainings */}
        {pendingAssignments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">📋 Pending Trainings</h2>
            <div className="grid gap-4">
              {pendingAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {assignment.modules.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {assignment.modules.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        Assigned: {new Date(assignment.sent_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => router.push(`/training/take?token=${assignment.token}`)}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:opacity-90 transition"
                    >
                      Start Training →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Results */}
        <div>
          <h2 className="text-2xl font-bold mb-4">📊 Training History</h2>
          {results.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow text-center">
              <p className="text-gray-500">No completed trainings yet</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Training Module
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Completed
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {results.map((result) => (
                    <tr key={result.id}>
                      <td className="px-6 py-4">
                        {result.modules?.title || 'Unknown Module'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {result.score} points
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {new Date(result.completed_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}