import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
    theme: Theme
    resolvedTheme: 'light' | 'dark'
    cycleTheme: () => void
    colors: ReturnType<typeof getColors>
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function getColors(dark: boolean) {
    return {
        bg: dark ? '#0f0f0f' : '#fafafa',
        bg2: dark ? '#1a1a1a' : '#f0f0f0',
        fg: dark ? '#e8e8e8' : '#0f0f0f',
        muted: dark ? '#888' : '#666',
        border: dark ? '#333' : '#ddd',
        mono: 'JetBrainsMono_400Regular',
        monoBold: 'JetBrainsMono_500Medium',
    }
}

const STORAGE_KEY = 'markpad_theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemScheme = useColorScheme()
    const [theme, setTheme] = useState<Theme>('system')

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY).then(val => {
            if (val) setTheme(val as Theme)
        })
    }, [])

    const resolvedTheme: 'light' | 'dark' =
        theme === 'system'
            ? (systemScheme === 'dark' ? 'dark' : 'light')
            : theme

    const cycleTheme = () => {
        setTheme(t => {
            const next = t === 'system' ? 'dark' : t === 'dark' ? 'light' : 'system'
            AsyncStorage.setItem(STORAGE_KEY, next)
            return next
        })
    }

    const colors = getColors(resolvedTheme === 'dark')

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, cycleTheme, colors }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
    return ctx
}