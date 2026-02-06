'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

interface AdminUser {
  id: string
  email: string
  role: string
  township_id: string | null
  townships?: {
    name: string
  }
}

export default function AdminDashboard() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
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

      if (profile.role !== 'admin' && profile.role !== 'super_admin') {
        alert('Access denied: Admin only')
        router.push('/dashboard')
        return
      }

      setAdminUser(profile)

      // If super_admin, show different dashboard
      if (profile.role === 'super_admin') {
        // Stay on this page, we'll show super admin content
        setLoading(false)
        return
      }

      // For township admins, continue with normal flow
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

  // SUPER ADMIN DASHBOARD
  if (adminUser.role === 'super_admin') {
    return (
      <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-semibold">🔑 Super Admin Dashboard</h1>
              <p className="text-gray-500 mt-1">System Administrator - {adminUser.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:opacity-90"
            >
              Logout
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-sm text-gray-500 mb-1">Total Townships</h3>
              <p className="text-3xl font-semibold">Coming Soon</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-sm text-gray-500 mb-1">Total Users</h3>
              <p className="text-3xl font-semibold">Coming Soon</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-sm text-gray-500 mb-1">Total Completions</h3>
              <p className="text-3xl font-semibold">Coming Soon</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => alert('Coming soon: Create Township')}
                className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 transition"
              >
                <span className="text-2xl mb-2 block">🏛️</span>
                <span className="font-medium">Create New Township</span>
              </button>
              <button
                onClick={() => alert('Coming soon: View All Users')}
                className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 transition"
              >
                <span className="text-2xl mb-2 block">👥</span>
                <span className="font-medium">Manage All Users</span>
              </button>
              <button
                onClick={() => alert('Coming soon: System Analytics')}
                className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 transition"
              >
                <span className="text-2xl mb-2 block">📊</span>
                <span className="font-medium">System Analytics</span>
              </button>
              <button
                onClick={() => alert('Coming soon: Billing Management')}
                className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 transition"
              >
                <span className="text-2xl mb-2 block">💳</span>
                <span className="font-medium">Billing & Subscriptions</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // TOWNSHIP ADMIN DASHBOARD (existing code)
  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold">Township Admin Dashboard</h1>
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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Township admin features coming soon...</p>
          <p className="text-sm text-gray-400 mt-2">Results tracking, user management, etc.</p>
        </div>
      </div>
    </div>
  )
}