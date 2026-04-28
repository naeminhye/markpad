import { useState, useCallback, useEffect } from 'react'

const MIN = 160
const MAX = 400
const DEFAULT = 220
const STORAGE_KEY = 'markpad_sidebar_width'

export function useSidebarResize() {
    const [width, setWidth] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        return saved ? parseInt(saved) : DEFAULT
    })
    const [dragging, setDragging] = useState(false)

    const startDrag = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        setDragging(true)

        const startX = e.clientX
        const startWidth = width

        const onMove = (e: MouseEvent) => {
            const next = Math.min(MAX, Math.max(MIN, startWidth + (e.clientX - startX)))
            setWidth(next)
        }

        const onUp = () => {
            setDragging(false)
            document.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseup', onUp)
            setWidth(w => { localStorage.setItem(STORAGE_KEY, String(w)); return w })
        }

        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
    }, [width])

    useEffect(() => {
        if (dragging) {
            document.body.style.cursor = 'col-resize'
            document.body.style.userSelect = 'none'
        } else {
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
        }
    }, [dragging])

    return { width, dragging, startDrag }
}