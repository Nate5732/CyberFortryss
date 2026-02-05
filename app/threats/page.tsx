'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ThreatsPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser()
      setIsLoggedIn(!!data.user)
    }
    checkAuth()
  }, [])

  const threats = [
    {
      id: 1,
      level: 'critical',
      title: 'Ransomware Targeting Municipal Governments',
      date: '2026-02-04',
      description: 'New ransomware variant specifically targeting small to mid-size municipalities. Attackers are exploiting outdated VPN software to gain initial access.',
      impact: 'City operations shutdown, citizen data at risk, recovery costs averaging $500K+',
      mitigation: [
        'Update all VPN software immediately',
        'Implement multi-factor authentication',
        'Conduct employee phishing awareness training',
        'Maintain offline, encrypted backups'
      ]
    },
    {
      id: 2,
      level: 'high',
      title: 'Phishing Campaign Mimicking State Government',
      date: '2026-02-03',
      description: 'Sophisticated phishing emails impersonating state IT departments requesting credential updates. Emails contain legitimate-looking logos and formatting.',
      impact: 'Credential theft, unauthorized access to internal systems, data breaches',
      mitigation: [
        'Verify all IT requests through known phone numbers',
        'Never click links in unexpected emails',
        'Check sender email addresses carefully',
        'Report suspicious emails to IT immediately'
      ]
    },
    {
      id: 3,
      level: 'medium',
      title: 'Microsoft Exchange Server Vulnerability',
      date: '2026-02-01',
      description: 'Critical vulnerability discovered in Microsoft Exchange Server. Patch available but many municipalities running outdated versions.',
      impact: 'Email system compromise, data exfiltration, lateral network movement',
      mitigation: [
        'Apply Microsoft security patches immediately',
        'Audit Exchange Server versions',
        'Monitor for unusual email activity',
        'Consider migration to cloud-based email'
      ]
    },
    {
      id: 4,
      level: 'medium',
      title: 'Social Engineering Attacks on Finance Departments',
      date: '2026-01-30',
      description: 'Attackers posing as vendors requesting payment information updates via phone and email.',
      impact: 'Wire fraud, financial losses, vendor relationship damage',
      mitigation: [
        'Verify all payment changes through established channels',
        'Implement dual-approval for wire transfers',
        'Train staff on social engineering tactics',
        'Use vendor portals for sensitive updates'
      ]
    }
  ]

  const securityTips = [
    {
      icon: '🔑',
      title: 'Use Strong, Unique Passwords',
      tip: 'Create passwords with 12+ characters mixing letters, numbers, and symbols. Never reuse passwords across sites. Use a password manager.'
    },
    {
      icon: '🛡️',
      title: 'Enable Multi-Factor Authentication',
      tip: 'Add an extra layer of security to your accounts. Even if your password is compromised, MFA prevents unauthorized access.'
    },
    {
      icon: '📧',
      title: 'Think Before You Click',
      tip: 'Verify sender addresses, hover over links before clicking, and be suspicious of urgent requests for sensitive information.'
    },
    {
      icon: '💾',
      title: 'Keep Software Updated',
      tip: 'Enable automatic updates for your operating system and applications. Patches fix security vulnerabilities that attackers exploit.'
    },
    {
      icon: '🔒',
      title: 'Secure Your Devices',
      tip: 'Use device encryption, screen locks, and remote wipe capabilities. Never leave devices unattended in public.'
    },
    {
      icon: '📱',
      title: 'Be Careful on Public WiFi',
      tip: 'Avoid accessing sensitive information on public networks. Use a VPN if you must access work systems remotely.'
    }
  ]

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300 dark:border-red-700'
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-300 dark:border-orange-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700'
    }
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
            {isLoggedIn ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded hover:opacity-90"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded hover:opacity-90"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Cyber Threat Intelligence
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Stay informed about the latest cyber threats targeting municipal governments
          </p>
        </div>

        {/* Threat Level Indicator */}
        <div className="mb-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">🚨 Current Threat Level: ELEVATED</h2>
              <p className="text-white/90">
                Increased ransomware activity targeting municipalities. Enhanced vigilance recommended.
              </p>
            </div>
            <div className="text-6xl font-bold opacity-50">HIGH</div>
          </div>
        </div>

        {/* Active Threats */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">⚠️ Active Threats</h2>
          <div className="space-y-6">
            {threats.map((threat) => (
              <div
                key={threat.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-purple-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getLevelColor(threat.level)}`}>
                        {threat.level}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(threat.date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{threat.title}</h3>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {threat.description}
                </p>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2 text-red-600 dark:text-red-400">⚡ Impact:</h4>
                  <p className="text-gray-700 dark:text-gray-300">{threat.impact}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-green-600 dark:text-green-400">✅ Recommended Actions:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    {threat.mitigation.map((action, idx) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Tips */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">💡 Security Best Practices</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityTips.map((tip, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <div className="text-4xl mb-3">{tip.icon}</div>
                <h3 className="text-lg font-bold mb-2">{tip.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{tip.tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Protect Your Organization</h2>
          <p className="text-xl mb-6 text-white/90">
            Train your employees to recognize and prevent cyber threats
          </p>
          <button
            onClick={() => router.push(isLoggedIn ? '/dashboard' : '/login')}
            className="px-8 py-4 bg-white text-purple-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
          >
            {isLoggedIn ? 'Go to Dashboard' : 'Get Started'}
          </button>
        </div>
      </div>
    </div>
  )
}