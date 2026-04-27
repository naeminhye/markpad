import { useState, useEffect, useCallback } from 'react'
import { Platform } from 'react-native'
import { parseFrontmatter, serializeNote, Note } from '../lib/frontmatter'

const FOLDER_KEY = 'markpad_folder'
const WEB_NOTES_KEY = 'markpad_notes'

// ─── web storage helpers ───────────────────────────────────────
function webGetNotes(): Note[] {
    try {
        const raw = localStorage.getItem(WEB_NOTES_KEY)
        return raw ? JSON.parse(raw) : []
    } catch { return [] }
}

function webSaveNotes(notes: Note[]) {
    localStorage.setItem(WEB_NOTES_KEY, JSON.stringify(notes))
}

// ─── native imports (lazy to avoid web bundling errors) ────────
async function getNativeModules() {
    const fs = await import('expo-file-system/legacy')
    const storage = await import('@react-native-async-storage/async-storage')
    return { fs, AsyncStorage: storage.default }
}

export function useNotes() {
    const [folder, setFolder] = useState<string | null>(
        Platform.OS === 'web' ? 'web' : null
    )
    const [notes, setNotes] = useState<Note[]>([])
    const [loading, setLoading] = useState(false)

    // ─── web ──────────────────────────────────────────────────────
    const loadNotesWeb = useCallback(() => {
        setLoading(true)
        const loaded = webGetNotes()
        loaded.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        setNotes(loaded)
        setLoading(false)
    }, [])

    // ─── native ───────────────────────────────────────────────────
    const loadNotesNative = useCallback(async (dir: string) => {
        setLoading(true)
        try {
            const { fs } = await getNativeModules()
            const result = await fs.readDirectoryAsync(dir)
            const mdFiles = result.filter((f: string) => f.endsWith('.md'))
            const loaded = await Promise.all(
                mdFiles.map(async (filename: string) => {
                    const raw = await fs.readAsStringAsync(`${dir}/${filename}`)
                    return parseFrontmatter(raw, filename)
                })
            )
            loaded.sort((a: Note, b: Note) => b.updatedAt.localeCompare(a.updatedAt))
            setNotes(loaded)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (Platform.OS === 'web') {
            loadNotesWeb()
        } else {
            getNativeModules().then(({ AsyncStorage }) => {
                AsyncStorage.getItem(FOLDER_KEY).then(val => {
                    if (val) setFolder(val)
                })
            })
        }
    }, [])

    useEffect(() => {
        if (Platform.OS !== 'web' && folder) loadNotesNative(folder)
    }, [folder])

    // ─── pickFolder ───────────────────────────────────────────────
    const pickFolder = async () => {
        if (Platform.OS === 'web') {
            setFolder('web')
            return
        }
        const { fs, AsyncStorage } = await getNativeModules()
        const dir = fs.documentDirectory + 'markpad-notes/'
        const info = await fs.getInfoAsync(dir)
        if (!info.exists) await fs.makeDirectoryAsync(dir)
        await AsyncStorage.setItem(FOLDER_KEY, dir)
        setFolder(dir)
    }

    const resetFolder = async () => {
        if (Platform.OS === 'web') {
            localStorage.removeItem(WEB_NOTES_KEY)
            setNotes([])
            return
        }
        const { AsyncStorage } = await getNativeModules()
        await AsyncStorage.removeItem(FOLDER_KEY)
        setFolder(null)
        setNotes([])
    }

    // ─── saveNote ─────────────────────────────────────────────────
    const saveNote = async (note: Note) => {
        if (Platform.OS === 'web') {
            const current = webGetNotes()
            const exists = current.findIndex(n => n.id === note.id)
            const updated = exists >= 0
                ? current.map(n => n.id === note.id ? note : n)
                : [note, ...current]
            webSaveNotes(updated)
            setNotes(updated)
            return
        }
        if (!folder) return
        const { fs } = await getNativeModules()
        const content = serializeNote(note)
        await fs.writeAsStringAsync(`${folder}/${note.id}.md`, content)
        setNotes(prev => prev.map(n => n.id === note.id ? { ...note, raw: content } : n))
    }

    // ─── createNote ───────────────────────────────────────────────
    const createNote = async () => {
        const id = `note-${Date.now()}`
        const now = new Date().toISOString()
        const note: Note = {
            id, title: 'untitled', tags: [], body: '', raw: '',
            createdAt: now, updatedAt: now,
        }

        if (Platform.OS === 'web') {
            const current = webGetNotes()
            const updated = [note, ...current]
            webSaveNotes(updated)
            setNotes(updated)
            return note
        }

        if (!folder) return null
        const { fs } = await getNativeModules()
        const content = serializeNote(note)
        await fs.writeAsStringAsync(`${folder}/${note.id}.md`, content)
        setNotes(prev => [note, ...prev])
        return note
    }

    // ─── deleteNote ───────────────────────────────────────────────
    const deleteNote = async (id: string) => {
        if (Platform.OS === 'web') {
            const updated = webGetNotes().filter(n => n.id !== id)
            webSaveNotes(updated)
            setNotes(updated)
            return
        }
        if (!folder) return
        const { fs } = await getNativeModules()
        await fs.deleteAsync(`${folder}/${id}.md`)
        setNotes(prev => prev.filter(n => n.id !== id))
    }

    // ─── renameNote ───────────────────────────────────────────────
    const renameNote = async (id: string, newTitle: string) => {
        const note = notes.find(n => n.id === id)
        if (!note) return
        const newId = newTitle.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        if (!newId || newId === id) return
        if (notes.some(n => n.id === newId)) return
        const updated = { ...note, id: newId, title: newTitle.trim() }

        if (Platform.OS === 'web') {
            const current = webGetNotes()
            const updatedList = current.map(n => n.id === id ? updated : n)
            webSaveNotes(updatedList)
            setNotes(updatedList)
            return updated
        }

        if (!folder) return
        const { fs } = await getNativeModules()
        const content = serializeNote(updated)
        await fs.writeAsStringAsync(`${folder}/${newId}.md`, content)
        await fs.deleteAsync(`${folder}/${id}.md`)
        setNotes(prev => prev.map(n => n.id === id ? updated : n))
        return updated
    }

    return {
        folder,
        notes,
        loading,
        pickFolder,
        resetFolder,
        saveNote,
        createNote,
        deleteNote,
        renameNote,
        reload: () => {
            if (Platform.OS === 'web') loadNotesWeb()
            else if (folder) loadNotesNative(folder)
        }
    }
}