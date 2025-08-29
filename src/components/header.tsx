'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { ModeToggle } from './theme-toggle'
import { useAuthStore } from '@/stores/auth'

const menuItems = [
  { name: 'Features', href: '#' },
  { name: 'Notes', href: '#' },
  { name: 'Solution', href: '#' },
  { name: 'Pricing', href: '#' },
  { name: 'About', href: '#' },
]

export function Navbar() {
  const [menuState, setMenuState] = useState(false)

  const { user, profile, fetchUser } = useAuthStore()

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const getDashboardPath = () => {
    if (!profile) return '/login'
    if (profile.role === 'admin') return '/admin'
    if (profile.role === 'faculty') return '/faculty'
    return '/student'
  }

  return (
    <header>
      <nav
        data-state={menuState ? 'active' : 'inactive'}
        className="fixed z-20 w-full border-b border-dashed bg-white backdrop-blur md:relative dark:bg-zinc-950/50 lg:dark:bg-transparent"
      >
        <div className="m-auto max-w-5xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            {/* Logo + Toggle */}
            <div className="flex w-full justify-between lg:w-auto">
              <Link href="/" aria-label="home" className="flex items-center space-x-2">
                <b>MAINS CRACKER</b>
              </Link>

              {/* Mobile toggle */}
              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                data-state={menuState ? 'active' : 'inactive'}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="m-auto size-6 duration-200 in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0" />
                <X className="absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200 in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100" />
              </button>
            </div>

            {/* Menu */}
            <div
              data-state={menuState ? 'active' : 'inactive'}
              className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent"
            >
              {/* Links */}
              <div className="lg:pr-4">
                <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuState(false)} // close menu on click (mobile UX)
                        className="block text-muted-foreground hover:text-accent-foreground duration-150"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Auth + Mode Toggle */}
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
                {user && profile ? (
                  <Button
                    asChild
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-white dark:hover:bg-primary/80"
                  >
                    <Link href={getDashboardPath()} onClick={() => setMenuState(false)}>
                      Dashboard
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/login" onClick={() => setMenuState(false)}>
                      Login
                    </Link>
                  </Button>
                )}
                <ModeToggle />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
