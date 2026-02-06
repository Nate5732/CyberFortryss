'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser()
      setIsLoggedIn(!!data.user)
    }
    checkAuth()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/20 backdrop-blur-md z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect x="8" y="20" width="24" height="16" fill="url(#gradient)" rx="2"/>
            <rect x="12" y="16" width="4" height="4" fill="white" opacity="0.8"/>
            <rect x="24" y="16" width="4" height="4" fill="white" opacity="0.8"/>
            <path d="M20 4L32 12V16H8V12L20 4Z" fill="url(#gradient2)"/>
            <rect x="16" y="26" width="8" height="10" fill="white" opacity="0.3" rx="1"/>
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
          <span className="text-2xl font-bold text-white">CyberFortRYSS</span>
        </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.push('/threats')}
              className="text-white/80 hover:text-white transition"
            >
              Threat Intelligence
            </button>
            {isLoggedIn ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition"
              >
                Login/Signup
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full">
            <span className="text-purple-200 text-sm font-medium">
              Trusted by Municipal Governments
            </span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Protect Your Township<br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              From Cyber Threats
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Comprehensive cyber awareness training for municipal employees. 
            Stay ahead of threats with our AI-powered training platform.
          </p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-4 bg-white text-black rounded-lg font-bold text-lg hover:bg-gray-100 transition transform hover:scale-105"
            >
              Get Started
            </button>
            <button
              onClick={() => router.push('/threats')}
              className="px-8 py-4 bg-white/10 text-white rounded-lg font-bold text-lg hover:bg-white/20 transition border border-white/20"
            >
              View Threats
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Why Choose CyberFortRYSS?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Targeted Training
              </h3>
              <p className="text-gray-300">
                Customized cyber awareness modules designed specifically for municipal government employees.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Real-Time Analytics
              </h3>
              <p className="text-gray-300">
                Track completion rates, scores, and identify knowledge gaps across your organization.
              </p>
            </div>

            {/* Feature 3 */}
            <button
              onClick={() => router.push('/threats')}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition text-left w-full cursor-pointer"
            >
              <div className="text-5xl mb-4">🔔</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Threat Intelligence
              </h3>
              <p className="text-gray-300">
                Stay informed with up-to-date cyber threat news and actionable security insights.
              </p>
            </button>

            {/* Feature 4 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition">
              <div className="text-5xl mb-4">✉️</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Automated Delivery
              </h3>
              <p className="text-gray-300">
                Send training assignments via email with one click. No manual follow-ups needed.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition">
              <div className="text-5xl mb-4">🎓</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Engaging Content
              </h3>
              <p className="text-gray-300">
                Video-based training with interactive quizzes that employees actually want to complete.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition">
              <div className="text-5xl mb-4">🏛️</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Government-Ready
              </h3>
              <p className="text-gray-300">
                Built for townships and municipalities with compliance and security in mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Secure Your Township?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join municipalities protecting their employees from cyber threats.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-4 bg-white text-purple-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition transform hover:scale-105"
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p className="mb-2">© 2026 CyberFortRYSS. All rights reserved.</p>
          <p className="text-sm">Protecting municipal governments from cyber threats.</p>
        </div>
      </footer>
    </div>
  )
}