'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  })
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
  
    // Validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }
  
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
  
    if (!formData.firstName || !formData.lastName) {
      setError('Please enter your first and last name')
      setLoading(false)
      return
    }
  
    try {
      // Create auth user (Supabase handles password hashing)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            user_name: formData.firstName,
          }
        }
      })
  
      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }
  
      if (!authData.user) {
        setError('Signup failed. Please try again.')
        setLoading(false)
        return
      }

      // Create user profile in users table
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: formData.email,
            full_name: `${formData.firstName} ${formData.lastName}`,
            role: 'user',
          },
        ])

      if (profileError) {
        console.error('Profile creation error:', profileError)
        setError(`Account created but profile failed: ${profileError.message}`)
        setLoading(false)
        return // Stop here so you can see the error
      }
      // Show success message
      setSuccess(true)
      setLoading(false)
    } catch (err) {
      console.error('Signup error:', err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <button 
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition"
          >
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <rect x="8" y="20" width="24" height="16" fill="url(#gradient)" rx="2"/>
              <rect x="12" y="16" width="4" height="4" fill="currentColor" className="text-purple-500" opacity="0.8"/>
              <rect x="24" y="16" width="4" height="4" fill="currentColor" className="text-purple-500" opacity="0.8"/>
              <path d="M20 4L32 12V16H8V12L20 4Z" fill="url(#gradient2)"/>
              <rect x="16" y="26" width="8" height="10" fill="currentColor" className="text-purple-500" opacity="0.3" rx="1"/>
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
          </button>
          <h1 className="text-2xl font-semibold mb-2">
            {success ? 'Check Your Email' : 'Create Account'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {success ? 'Verify your email to continue' : 'Join CyberFortRYSS'}
          </p>
        </div>
  
        {success ? (
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">📧</div>
            <p className="text-gray-700 dark:text-gray-300">
              We've sent a confirmation email to:
            </p>
            <p className="font-semibold text-purple-600 dark:text-purple-400">
              {formData.email}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click the link in the email to verify your account and get started.
            </p>
            <div className="pt-4">
              <button
                onClick={() => router.push('/login')}
                className="text-purple-600 dark:text-purple-400 font-medium hover:underline"
              >
                Return to Login
              </button>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
  
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    className="w-full px-3 py-2 pr-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
  
              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pr-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
  
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
  
            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
              <button
                onClick={() => router.push('/login')}
                className="text-purple-600 dark:text-purple-400 font-medium hover:underline"
              >
                Log in
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}