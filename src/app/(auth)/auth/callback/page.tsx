"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth'

export default function AuthCallback() {
  const [status, setStatus] = useState('Processing authentication...')
  const router = useRouter()
  const { fetchUser } = useAuthStore()

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
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create one
          setStatus('Creating user profile...')
          
          const { data: newProfile, error: insertError } = await supabase
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
            .select()
            .single()

          if (insertError) {
            console.error('Error creating profile:', insertError)
            toast.error('Failed to create user profile')
            router.push('/login')
            return
          }

          // Manually update auth store
          useAuthStore.setState({ user: session.user, profile: newProfile, loading: false, error: null })
          
          toast.success('Profile created successfully!')
          // Small delay to ensure auth store is updated
          setTimeout(() => {
            router.push('/student/dashboard')
          }, 100)
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
        let redirectUrl = '/student/dashboard'
        if (role === 'admin') redirectUrl = '/admin/dashboard'
        else if (role === 'faculty') redirectUrl = '/faculty/dashboard'

        // Manually update auth store
        useAuthStore.setState({ user: session.user, profile, loading: false, error: null })
        
        toast.success('Login successful!')
        // Small delay to ensure auth store is updated
        setTimeout(() => {
          router.push(redirectUrl)
        }, 100)

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