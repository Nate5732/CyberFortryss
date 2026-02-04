'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'

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

export default function TrainingPage() {
  const { moduleId } = useParams()
  const router = useRouter()
  const [module, setModule] = useState<Module | null>(null)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!moduleId) return
    supabase
      .from('modules')
      .select('*')
      .eq('id', moduleId)
      .single()
      .then(({ data, error }) => {
        if (error) console.log(error)
        else {
          setModule(data)
          setUserAnswers(Array(data.questions.length).fill(-1))
        }
      })
  }, [moduleId])

  const handleSelectAnswer = (index: number, optionIndex: number) => {
    const newAnswers = [...userAnswers]
    newAnswers[index] = optionIndex
    setUserAnswers(newAnswers)
  }

  const handleSubmitQuiz = async () => {
    if (!module) return
    setSubmitting(true)

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        alert('You must be logged in to submit')
        return
      }

      // Get user's township from users table
      const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('township_id, email')
      .eq('id', user.id)
      .single()

      console.log('User ID:', user.id)
      console.log('User Data:', userData)
      console.log('User Data Error:', userDataError)

      if (userDataError || !userData) {
      alert('Error: User profile not found')
      console.error(userDataError)
      return
      }

      // Calculate score
      const score = module.questions.reduce((acc, q, i) => {
        return acc + (userAnswers[i] === q.answer ? 1 : 0)
      }, 0)

      // Save results with ALL required fields
      const { data: resultData, error: insertError } = await supabase
        .from('results')
        .insert([
          {
            user_id: user.id,
            module_id: module.id,
            township_id: userData.township_id,
            email: userData.email,
            score,
            answers: userAnswers,
            completed_at: new Date().toISOString(),
          },
        ])
        .select()

      if (insertError) {
        console.error('Insert error:', insertError)
        alert('Error saving results: ' + insertError.message)
        return
      }

      alert(`✅ Quiz submitted! Your score: ${score} / ${module.questions.length}`)
      console.log('Saved result:', resultData)
      router.push('/dashboard')
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (!module) return <p>Loading module...</p>

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl font-semibold mb-4">{module.title}</h1>
      <p className="mb-4">{module.description}</p>

      {/* Video */}
      <div className="mb-6">
        <video
          src={module.video_url}
          controls
          className="w-full max-w-lg rounded shadow"
        />
      </div>

      {/* Quiz */}
      <div className="space-y-4">
        {module.questions.map((q, i) => (
          <div key={i} className="p-4 bg-white dark:bg-gray-800 rounded shadow">
            <p className="font-medium mb-2">{q.question}</p>
            <div className="space-y-1">
              {q.options.map((option, j) => (
                <label key={j} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`question-${i}`}
                    checked={userAnswers[i] === j}
                    onChange={() => handleSelectAnswer(i, j)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmitQuiz}
        disabled={submitting}
        className="mt-4 px-4 py-2 bg-black text-white rounded disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Quiz'}
      </button>
    </div>
  )
}