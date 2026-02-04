'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

interface Result {
  id: string
  email: string
  score: number
  completed_at: string
  module_id: number
  modules: {
    title: string
  }
}

interface AdminUser {
  id: string
  email: string
  role: string
  township_id: string
  townships: {
    name: string
  }
}

export default function AdminDashboard() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadAdminData = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push('/login')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*, townships(name)')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        alert('Error loading profile')
        return
      }

      if (profile.role !== 'admin') {
        alert('Access denied: Admin only')
        router.push('/dashboard')
        return
      }

      setAdminUser(profile)

      console.log('Querying results for township:', profile.township_id)

      const { data: resultsData, error: resultsError } = await supabase
        .from('results')
        .select('*, modules(title)')
        .eq('township_id', profile.township_id)
        .order('completed_at', { ascending: false })
      
      console.log('Results data:', resultsData)
      console.log('Results error full:', resultsError)

      if (resultsError) {
        console.error('Error loading results:', resultsError)
      } else {
        setResults(resultsData || [])
      }

      setLoading(false)
    }

    loadAdminData()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading admin dashboard...</p>
      </div>
    )
  }

  if (!adminUser) return null

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
                <p className="text-gray-500 mt-1">
                {adminUser.townships?.name || 'Township'} - {adminUser.email}
                </p>
            </div>
            <div className="flex gap-3">
                <button
                onClick={() => router.push('/admin/assignments')}
                className="px-4 py-2 bg-black text-white rounded hover:opacity-90"
                >
                Send Training Assignment
                </button>
                <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:opacity-90"
                >
                Logout
                </button>
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 mb-1">Total Completions</h3>
            <p className="text-3xl font-semibold">{results.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 mb-1">Average Score</h3>
            <p className="text-3xl font-semibold">
              {results.length > 0
                ? Math.round((results.reduce((sum, r) => sum + r.score, 0) / results.length) * 100) / 100
                : 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 mb-1">Unique Users</h3>
            <p className="text-3xl font-semibold">
              {new Set(results.map(r => r.email)).size}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Training Results</h2>
          </div>
          
          {results.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No training results yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {results.map((result) => (
                    <tr key={result.id}>
                      <td className="px-6 py-4 text-sm">{result.email}</td>
                      <td className="px-6 py-4 text-sm">{result.modules?.title || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm font-medium">{result.score}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
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