'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

interface Module {
  id: number
  title: string
  video_url: string
  description: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }
      setUser(data.user)
    }

    loadUser()
  }, [router])

  useEffect(() => {
    const loadModules = async () => {
      const { data, error } = await supabase.from('modules').select('*')
      if (error) console.error(error)
      else setModules(data || [])
      setLoading(false)
    }

    loadModules()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading your training dashboard...
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold">
            Welcome back{user.email ? `, ${user.email}` : ''} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Complete your assigned cybersecurity training modules below.
          </p>
        </header>

        <section>
          <h2 className="text-xl font-medium mb-4">
            Training Modules
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {modules.map((module) => (
              <div
                key={module.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold">
                    {module.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {module.description}
                  </p>
                </div>

                <button
                  className="mt-4 px-4 py-2 bg-black text-white rounded hover:opacity-90 transition"
                  onClick={() => router.push(`/training/${module.id}`)}
                >
                  Start Training →
                </button>
              </div>
            ))}
          </div>

          {modules.length === 0 && (
            <p className="text-gray-500">
              No training modules available yet.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
