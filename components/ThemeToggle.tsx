'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // avoid hydration mismatch — only render icon after client mount
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-8 h-8" />

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-8 h-8 rounded-lg border flex items-center justify-center
                 hover:bg-accent transition-colors text-sm"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  )
}
