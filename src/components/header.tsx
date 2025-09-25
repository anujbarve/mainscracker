'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { ModeToggle } from './theme-toggle'
import { useAuthStore } from '@/stores/auth'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const menuItems = [
  { name: 'Features', href: '#features' },
  { name: 'Samples', href: '#samples' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Contact', href: '#contact' },
]

export function Navbar() {
  const [menuState, setMenuState] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, profile, fetchUser } = useAuthStore()

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const getDashboardPath = () => {
    if (!profile) return '/login'
    if (profile.role === 'admin') return '/admin/dashboard'
    if (profile.role === 'faculty') return '/faculty/dashboard'
    return '/student/dashboard'
  }

  const menuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } },
    exit: { opacity: 0, y: -20 },
  }

  const menuItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <header>
      <nav
        className={cn(
          'fixed z-50 w-full transition-colors duration-300',
          scrolled
            ? 'border-b border-border/60 bg-background/80 backdrop-blur-xl'
            : 'bg-transparent'
        )}
      >
        <div className="m-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link href="/" aria-label="home" className="flex items-center space-x-2">
                <b className="text-lg tracking-wide">MAINS CRACKER</b>
              </Link>
              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                className="relative z-20 block lg:hidden"
              >
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={menuState ? 'x' : 'menu'}
                    initial={{ rotate: menuState ? 90 : 0, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: menuState ? 0 : 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {menuState ? <X /> : <Menu />}
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex lg:items-center lg:gap-x-12">
              <ul className="flex gap-x-8 text-sm">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="group relative text-muted-foreground transition-colors hover:text-primary"
                    >
                      {item.name}
                      <span className="absolute bottom-[-4px] left-0 h-[2px] w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-3">
                {user && profile ? (
                  <Button asChild size="sm">
                    <Link href={getDashboardPath()}>Dashboard</Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/login">Login</Link>
                  </Button>
                )}
                <ModeToggle />
              </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {menuState && (
                <motion.div
                  variants={menuVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute left-0 top-full w-full origin-top lg:hidden"
                >
                  <div className="mx-6 mt-2 rounded-2xl border bg-background p-6 shadow-xl">
                    <ul className="space-y-6">
                      {menuItems.map((item) => (
                        <motion.li key={item.name} variants={menuItemVariants}>
                          <Link
                            href={item.href}
                            onClick={() => setMenuState(false)}
                            className="block text-muted-foreground hover:text-primary"
                          >
                            {item.name}
                          </Link>
                        </motion.li>
                      ))}
                    </ul>
                    <hr className="my-6 border-dashed" />
                    <div className="flex items-center justify-between">
                       {user && profile ? (
                        <Button asChild size="sm" className="w-[calc(100%-4rem)]">
                          <Link href={getDashboardPath()} onClick={() => setMenuState(false)}>Dashboard</Link>
                        </Button>
                      ) : (
                        <Button asChild variant="outline" size="sm" className="w-[calc(100%-4rem)]">
                          <Link href="/login" onClick={() => setMenuState(false)}>Login</Link>
                        </Button>
                      )}
                      <ModeToggle />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>
    </header>
  )
}