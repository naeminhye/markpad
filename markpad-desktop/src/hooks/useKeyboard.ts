import { useEffect } from 'react'

type ShortcutMap = {
    [key: string]: (e: KeyboardEvent) => void
}

export function useKeyboard(shortcuts: ShortcutMap) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const meta = e.metaKey || e.ctrlKey
            const key = `${meta ? 'mod+' : ''}${e.key.toLowerCase()}`
            if (shortcuts[key]) {
                e.preventDefault()
                shortcuts[key](e)
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [shortcuts])
}