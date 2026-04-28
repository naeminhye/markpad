import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'markpad_theme'

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(STORAGE_KEY) as Theme) || 'system'
    )

    useEffect(() => {
        const root = document.documentElement

        const apply = (dark: boolean) => {
            root.setAttribute('data-theme', dark ? 'dark' : 'light')
        }

        if (theme === 'system') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)')
            apply(mq.matches)
            const handler = (e: MediaQueryListEvent) => apply(e.matches)
            mq.addEventListener('change', handler)
            return () => mq.removeEventListener('change', handler)
        } else {
            apply(theme === 'dark')
        }
    }, [theme])

    const cycleTheme = () => {
        setTheme(t => {
            const next = t === 'system' ? 'dark' : t === 'dark' ? 'light' : 'system'
            localStorage.setItem(STORAGE_KEY, next)
            return next
        })
    }

    return { theme, cycleTheme }
}