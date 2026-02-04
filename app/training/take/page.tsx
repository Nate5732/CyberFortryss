'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useSearchParams } from 'next/navigation'

interface Question {
  question: string
  options: string[]
  answer: number
}

interface Module {
  id: number
  title: string
  video_url: string
  description: string
  questions: Question[]
}

interface Assignment {
  id: string
  email: string
  module_id: number
  township_id: string
  status: string
}

export default function TakeTrainingPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [module, setModule] = useState<Module | null>(null)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const loadTraining = async () => {
      if (!token) {
        setError('Invalid training link - missing token')
        setLoading(false)
        return
      }

      // Look up assignment by token
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('training_assignments')
        .select('*')
        .eq('token', token)
        .single()

      if (assignmentError || !assignmentData) {
        setError('Training assignment not found or link expired')
        setLoading(false)
        return
      }

      // Check if already completed
      if (assignmentData.status === 'completed') {
        setError('This training has already been completed')
        setLoading(false)
        return
      }

      setAssignment(assignmentData)

      // Load the module
      const { data: moduleData, error: moduleError } = await supabase
        .from('modules')
        .select('*')
        .eq('id', assignmentData.module_id)
        .single()

      if (moduleError || !moduleData) {
        setError('Training module not found')
        setLoading(false)
        return
      }

      setModule(moduleData)
      setUserAnswers(Array(moduleData.questions.length).fill(-1))
      setLoading(false)
    }

    loadTraining()
  }, [token])

  const handleSelectAnswer = (index: number, optionIndex: number) => {
    const newAnswers = [...userAnswers]
    newAnswers[index] = optionIndex
    setUserAnswers(newAnswers)
  }

  const handleSubmitQuiz = async () => {
    if (!module || !assignment) return

    // Check all questions answered
    if (userAnswers.includes(-1)) {
      alert('Please answer all questions before submitting')
      return
    }

    setSubmitting(true)

    try {
      // Calculate score
      const score = module.questions.reduce((acc, q, i) => {
        return acc + (userAnswers[i] === q.answer ? 1 : 0)
      }, 0)

      // Save result
      const { error: insertError } = await supabase
        .from('results')
        .insert([
          {
            module_id: module.id,
            township_id: assignment.township_id,
            email: assignment.email,
            score,
            answers: userAnswers,
            completed_at: new Date().toISOString(),
            user_id: null, // No auth user for token-based submissions
          },
        ])

      if (insertError) {
        console.error('Error saving result:', insertError)
        alert('Error saving your results. Please try again.')
        setSubmitting(false)
        return
      }

      // Update assignment status
      const { error: updateError } = await supabase
        .from('training_assignments')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', assignment.id)

      if (updateError) {
        console.error('Error updating assignment:', updateError)
      }

      setSuccess(true)
      setSubmitting(false)
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('An unexpected error occurred')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500">Loading your training...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">❌ {error}</p>
          <p className="text-gray-500">Please contact your administrator if you believe this is an error.</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-semibold mb-2">Training Complete!</h1>
          <p className="text-gray-500 mb-4">
            Thank you for completing the training. Your results have been recorded.
          </p>
          <p className="text-sm text-gray-400">
            You may now close this window.
          </p>
        </div>
      </div>
    )
  }

  if (!module || !assignment) return null

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h1 className="text-2xl font-semibold mb-2">{module.title}</h1>
          <p className="text-gray-500 mb-4">{module.description}</p>
          <p className="text-sm text-gray-400">
            Training for: <span className="font-medium">{assignment.email}</span>
          </p>
        </div>

        {/* Video */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Training Video</h2>
          <video
            src={module.video_url}
            controls
            className="w-full rounded shadow"
          />
        </div>

        {/* Quiz */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Knowledge Check</h2>
          
          <div className="space-y-6">
            {module.questions.map((q, i) => (
              <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                <p className="font-medium mb-3">
                  {i + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((option, j) => (
                    <label 
                      key={j} 
                      className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`question-${i}`}
                        checked={userAnswers[i] === j}
                        onChange={() => handleSelectAnswer(i, j)}
                        className="w-4 h-4"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmitQuiz}
            disabled={submitting || userAnswers.includes(-1)}
            className="mt-6 w-full px-6 py-3 bg-black text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>

          {userAnswers.includes(-1) && (
            <p className="text-sm text-gray-500 text-center mt-2">
              Please answer all questions to submit
            </p>
          )}
        </div>
      </div>
    </div>
  )
}