import { createClient } from '@/utils/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth exchange error:', error)
        return NextResponse.redirect(`${origin}/login?error=Authentication failed`)
      }

      // Get user profile to determine role-based redirect
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
              phone_number: user.user_metadata?.phone_number || null,
              role: 'student', // Default role for new users
              is_available: true,
              gs_credit_balance: 0,
              specialized_credit_balance: 0,
              mentorship_credit_balance: 0,
            })
          
          if (insertError) {
            console.error('Error creating profile:', insertError)
            return NextResponse.redirect(`${origin}/login?error=Failed to create profile`)
          }
          
          // After creating profile, redirect to student dashboard
          return NextResponse.redirect(`${origin}/student`)
        }
        
        // Profile exists, redirect based on role
        const role = profile?.role ?? 'student'
        let redirectUrl = '/student'
        if (role === 'admin') redirectUrl = '/admin'
        else if (role === 'faculty') redirectUrl = '/faculty'
        
        return NextResponse.redirect(`${origin}${redirectUrl}`)
      }
    } catch (error) {
      console.error('Callback error:', error)
      return NextResponse.redirect(`${origin}/login?error=Authentication failed`)
    }
  }

  // If there's no code, redirect to login
  return NextResponse.redirect(`${origin}/login?error=No authentication code provided`)
}
