import { useState, useCallback, useRef } from 'react'

interface HistoryEntry {
    value: string
    selectionStart: number
    selectionEnd: number
}

const MAX_HISTORY = 100

export function useUndoRedo(initial: string) {
    const [current, setCurrent] = useState<HistoryEntry>({
        value: initial,
        selectionStart: 0,
        selectionEnd: 0,
    })

    const past = useRef<HistoryEntry[]>([])
    const future = useRef<HistoryEntry[]>([])
    const skipNextPush = useRef(false)

    const push = useCallback((entry: HistoryEntry) => {
        if (skipNextPush.current) {
            skipNextPush.current = false
            setCurrent(entry)
            return
        }
        past.current = [...past.current.slice(-MAX_HISTORY), current]
        future.current = []
        setCurrent(entry)
    }, [current])

    const undo = useCallback(() => {
        if (past.current.length === 0) return null
        const prev = past.current[past.current.length - 1]
        past.current = past.current.slice(0, -1)
        future.current = [current, ...future.current]
        skipNextPush.current = true
        setCurrent(prev)
        return prev
    }, [current])

    const redo = useCallback(() => {
        if (future.current.length === 0) return null
        const next = future.current[0]
        future.current = future.current.slice(1)
        past.current = [...past.current, current]
        skipNextPush.current = true
        setCurrent(next)
        return next
    }, [current])

    const reset = useCallback((value: string) => {
        past.current = []
        future.current = []
        setCurrent({ value, selectionStart: 0, selectionEnd: 0 })
    }, [])

    return {
        value: current.value,
        selection: { start: current.selectionStart, end: current.selectionEnd },
        push,
        undo,
        redo,
        reset,
        canUndo: past.current.length > 0,
        canRedo: future.current.length > 0,
    }
}