"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function AuthCallback() {
  const [status, setStatus] = useState('Processing authentication...')
  const router = useRouter()

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        const supabase = await createClient()
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          toast.error('Authentication failed')
          router.push('/login')
          return
        }

        if (!session?.user) {
          setStatus('No user session found')
          router.push('/login')
          return
        }

        setStatus('Checking user profile...')

        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create one
          setStatus('Creating user profile...')
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
              phone_number: session.user.user_metadata?.phone_number || null,
              role: 'student', // Default role for new users
              is_available: true,
              gs_credit_balance: 0,
              specialized_credit_balance: 0,
              mentorship_credit_balance: 0,
            })

          if (insertError) {
            console.error('Error creating profile:', insertError)
            toast.error('Failed to create user profile')
            router.push('/login')
            return
          }

          toast.success('Profile created successfully!')
          router.push('/student')
          return
        }

        if (profileError) {
          console.error('Profile error:', profileError)
          toast.error('Failed to check user profile')
          router.push('/login')
          return
        }

        // Profile exists, redirect based on role
        const role = profile?.role ?? 'student'
        let redirectUrl = '/student'
        if (role === 'admin') redirectUrl = '/admin'
        else if (role === 'faculty') redirectUrl = '/faculty'

        toast.success('Login successful!')
        router.push(redirectUrl)

      } catch (error) {
        console.error('Auth callback error:', error)
        toast.error('Authentication failed')
        router.push('/login')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg font-medium">{status}</p>
        <p className="text-sm text-gray-500 mt-2">Please wait...</p>
      </div>
    </div>
  )
}
