import { useState, useEffect, useCallback } from 'react'
import * as FileSystem from 'expo-file-system/legacy'
import * as DocumentPicker from 'expo-document-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { parseFrontmatter, serializeNote, Note } from '../lib/frontmatter'

const FOLDER_KEY = 'markpad_folder'

export function useNotes() {
    const [folder, setFolder] = useState<string | null>(null)
    const [notes, setNotes] = useState<Note[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        AsyncStorage.getItem(FOLDER_KEY).then(val => {
            if (val) setFolder(val)
        })
    }, [])

    const loadNotes = useCallback(async (dir: string) => {
        setLoading(true)
        try {
            const result = await FileSystem.readDirectoryAsync(dir)
            const mdFiles = result.filter(f => f.endsWith('.md'))
            const loaded = await Promise.all(
                mdFiles.map(async filename => {
                    const raw = await FileSystem.readAsStringAsync(`${dir}/${filename}`)
                    return parseFrontmatter(raw, filename)
                })
            )
            loaded.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
            setNotes(loaded)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (folder) loadNotes(folder)
    }, [folder, loadNotes])

    const pickFolder = async () => {
        // on mobile we use the app's document directory
        // user can point this to iCloud/Google Drive via Files app
        const dir = FileSystem.documentDirectory + 'markpad-notes/'
        const info = await FileSystem.getInfoAsync(dir)
        if (!info.exists) await FileSystem.makeDirectoryAsync(dir)
        await AsyncStorage.setItem(FOLDER_KEY, dir)
        setFolder(dir)
    }

    const saveNote = async (note: Note) => {
        if (!folder) return
        const content = serializeNote(note)
        await FileSystem.writeAsStringAsync(`${folder}/${note.id}.md`, content)
        setNotes(prev => prev.map(n => n.id === note.id ? { ...note, raw: content } : n))
    }

    const createNote = async () => {
        if (!folder) return null
        const id = `note-${Date.now()}`
        const now = new Date().toISOString()
        const note: Note = {
            id, title: 'untitled', tags: [], body: '', raw: '',
            createdAt: now, updatedAt: now,
        }
        const content = serializeNote(note)
        await FileSystem.writeAsStringAsync(`${folder}/${id}.md`, content)
        setNotes(prev => [note, ...prev])
        return note
    }

    const deleteNote = async (id: string) => {
        if (!folder) return
        await FileSystem.deleteAsync(`${folder}/${id}.md`)
        setNotes(prev => prev.filter(n => n.id !== id))
    }

    const renameNote = async (id: string, newTitle: string) => {
        if (!folder) return
        const note = notes.find(n => n.id === id)
        if (!note) return
        const newId = newTitle.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        if (!newId || newId === id) return
        const exists = notes.some(n => n.id === newId)
        if (exists) return
        const updated = { ...note, id: newId, title: newTitle.trim() }
        const content = serializeNote(updated)
        await FileSystem.writeAsStringAsync(`${folder}/${newId}.md`, content)
        await FileSystem.deleteAsync(`${folder}/${id}.md`)
        setNotes(prev => prev.map(n => n.id === id ? updated : n))
        return updated
    }

    const resetFolder = async () => {
        await AsyncStorage.removeItem(FOLDER_KEY)
        setFolder(null)
        setNotes([])
    }

    return { folder, notes, loading, pickFolder, resetFolder, saveNote, createNote, deleteNote, renameNote, reload: () => folder && loadNotes(folder) }
}