'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { LogoIcon } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

// ✅ Zod schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      // Example: Replace with Supabase auth logic
      console.log('Login data', data)

      // fake success
      toast.success('Signed in successfully 🎉')
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    }
  }

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]">
        <div className="p-8 pb-6">
          <div>
            <Link href="/" aria-label="go home">
              <LogoIcon />
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold">Sign In to Mains Cracker</h1>
            <p className="text-sm">Welcome back! Sign in to continue</p>
          </div>

          {/* Social Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button type="button" variant="outline">
              Google
            </Button>
            <Button type="button" variant="outline">
              Microsoft
            </Button>
          </div>

          <hr className="my-4 border-dashed" />

          <div className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm">
                Email
              </Label>
              <Input type="email" id="email" {...register('email')} />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-title text-sm">
                  Password
                </Label>
                <Button asChild variant="link" size="sm">
                  <Link href="#" className="link intent-info variant-ghost text-sm">
                    Forgot your Password ?
                  </Link>
                </Button>
              </div>
              <Input type="password" id="password" {...register('password')} />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>
        </div>

        <div className="bg-muted rounded-(--radius) border p-3">
          <p className="text-accent-foreground text-center text-sm">
            Don't have an account ?
            <Button asChild variant="link" className="px-2">
              <Link href="#">Create account</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  )
}
