"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Button size="sm" variant="outline" onClick={toggleTheme}>
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </Button>
  )
}
