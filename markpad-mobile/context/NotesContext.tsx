import { createContext, useContext, ReactNode } from 'react'
import { useNotes } from '../hooks/useNotes'
import { Note } from '../lib/frontmatter'

type NotesContextType = ReturnType<typeof useNotes>

const NotesContext = createContext<NotesContextType | null>(null)

export function NotesProvider({ children }: { children: ReactNode }) {
    const notes = useNotes()
    return <NotesContext.Provider value={notes}>{children}</NotesContext.Provider>
}

export function useNotesContext() {
    const ctx = useContext(NotesContext)
    if (!ctx) throw new Error('useNotesContext must be used within NotesProvider')
    return ctx
}