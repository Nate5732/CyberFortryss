'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

interface Module {
  id: number
  title: string
}

interface Township {
  id: string
  name: string
}

export default function AdminAssignmentsPage() {
  const router = useRouter()
  const [modules, setModules] = useState<Module[]>([])
  const [township, setTownship] = useState<Township | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  
  // Form state
  const [email, setEmail] = useState('')
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null)

  useEffect(() => {
    const loadData = async () => {
      // Get current admin user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push('/login')
        return
      }

      // Get admin profile and township
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*, townships(id, name)')
        .eq('id', user.id)
        .single()

      if (profileError || !profile || profile.role !== 'admin') {
        alert('Access denied: Admin only')
        router.push('/dashboard')
        return
      }

      setTownship(profile.townships)

      // Load modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('id, title')
        .order('id')

      if (modulesError) {
        console.error('Error loading modules:', modulesError)
      } else {
        setModules(modulesData || [])
        if (modulesData && modulesData.length > 0) {
          setSelectedModuleId(modulesData[0].id)
        }
      }

      setLoading(false)
    }

    loadData()
  }, [router])

  const handleSendAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !selectedModuleId || !township) {
      alert('Please fill in all fields')
      return
    }

    setSending(true)

    try {
      // Create assignment in database
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('training_assignments')
        .insert([
          {
            email,
            module_id: selectedModuleId,
            township_id: township.id,
            status: 'pending',
          },
        ])
        .select()
        .single()

      if (assignmentError) {
        console.error('Error creating assignment:', assignmentError)
        alert('Error creating assignment: ' + assignmentError.message)
        setSending(false)
        return
      }

      // Get module name
      const selectedModule = modules.find(m => m.id === selectedModuleId)

      // Send email via API
      const response = await fetch('/api/send-training-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          moduleName: selectedModule?.title || 'Training Module',
          token: assignmentData.token,
          townshipName: township.name,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert('Error sending email: ' + (error.error || 'Unknown error'))
        setSending(false)
        return
      }

      // Update assignment status to sent
      await supabase
        .from('training_assignments')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', assignmentData.id)

      alert(`✅ Training assignment sent to ${email}!`)
      setEmail('')
      setSending(false)
    } catch (error) {
      console.error('Error:', error)
      alert('An unexpected error occurred')
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold">Send Training Assignment</h1>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:opacity-90"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
          <p className="text-gray-500 mb-6">
            Township: <span className="font-medium text-gray-900 dark:text-white">{township?.name}</span>
          </p>

          <form onSubmit={handleSendAssignment} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Recipient Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Training Module <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedModuleId || ''}
                onChange={(e) => setSelectedModuleId(Number(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                required
              >
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full px-6 py-3 bg-black text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send Training Assignment'}
            </button>
          </form>

          {sending && (
            <p className="text-sm text-gray-500 text-center mt-4">
              Creating assignment and sending email...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}