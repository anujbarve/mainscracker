'use client'

import { useEffect, useState } from 'react'
import { LogoIcon } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import { createClient } from '@/utils/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const { resetPassword, loading, error, user, fetchUser } = useAuthStore()
  const [message, setMessage] = useState("")

  const searchParams = useSearchParams()
  const router = useRouter()

  // Step 1: Exchange token for a session when page loads
  useEffect(() => {
    const exchangeSession = async () => {
      const token_hash = searchParams.get("token_hash")
      const type = searchParams.get("type")

      if (token_hash && type === "recovery") {
        const supabase = createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(token_hash)
        if (error) {
          setMessage("Invalid or expired recovery link.")
        } else {
          await fetchUser()
        }
      }
    }
    exchangeSession()
  }, [searchParams, fetchUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")

    if (password !== confirmPassword) {
      setMessage("Passwords do not match")
      return
    }

    await resetPassword(password)

    if (error) {
      setMessage(error)
    } else if (user) {
      setMessage("Password updated successfully! Redirecting to login...")
      setTimeout(() => router.push("/login"), 2000)
    } else {
      setMessage("Something went wrong. Please try again.")
    }
  }

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <form
        onSubmit={handleSubmit}
        className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]"
      >
        <div className="p-8 pb-6">
          <div>
            <Link href="/" aria-label="go home">
              <LogoIcon />
            </Link>
            <h1 className="text-title mb-1 mt-4 text-xl font-semibold">Reset Password</h1>
            <p className="text-sm">Enter your new password below</p>
          </div>

          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="block text-sm">New Password</Label>
              <Input
                type="password"
                required
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="block text-sm">Confirm Password</Label>
              <Input
                type="password"
                required
                name="confirmPassword"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>

            {message && (
              <p className={`text-sm text-center mt-2 ${error ? 'text-red-500' : 'text-green-500'}`}>
                {message}
              </p>
            )}
          </div>
        </div>

        <div className="bg-muted rounded-(--radius) border p-3">
          <p className="text-accent-foreground text-center text-sm">
            Remembered your password?{" "}
            <Button asChild variant="link" className="px-2">
              <Link href="/login">Sign In</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  )
}
