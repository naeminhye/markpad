import { useState, useEffect, useCallback } from 'react'
import { open as openDialog } from '@tauri-apps/plugin-dialog'
import { readDir, readTextFile, writeTextFile, remove } from '@tauri-apps/plugin-fs'
import { parseFrontmatter, serializeNote, Note } from '../lib/frontmatter'

const FOLDER_KEY = 'markpad_folder'

export function useNotes() {
    const [folder, setFolder] = useState<string | null>(
        localStorage.getItem(FOLDER_KEY)
    )
    const [notes, setNotes] = useState<Note[]>([])
    const [loading, setLoading] = useState(false)

    const loadNotes = useCallback(async (dir: string) => {
        setLoading(true)
        try {
            const entries = await readDir(dir)
            const mdFiles = entries.filter(e => e.name?.endsWith('.md'))
            const loaded = await Promise.all(
                mdFiles.map(async entry => {
                    const raw = await readTextFile(`${dir}/${entry.name}`)
                    return parseFrontmatter(raw, entry.name!)
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
        try {
            const selected = await openDialog({
                directory: true,
                multiple: false,
                title: 'select notes folder'
            })
            if (selected !== null && selected !== undefined) {
                const path = typeof selected === 'string' ? selected : selected[0]
                localStorage.setItem(FOLDER_KEY, path)
                setFolder(path)
            }
        } catch (err) {
            console.error('dialog error:', err)
        }
    }

    const saveNote = async (note: Note) => {
        if (!folder) return
        const content = serializeNote(note)
        await writeTextFile(`${folder}/${note.id}.md`, content)
        setNotes(prev =>
            prev.map(n => n.id === note.id ? { ...note, raw: content } : n)
        )
    }

    const createNote = async () => {
        if (!folder) return null
        const id = `note-${Date.now()}`
        const now = new Date().toISOString()
        const note: Note = {
            id,
            title: 'untitled',
            tags: [],
            body: '',
            raw: '',
            createdAt: now,
            updatedAt: now,
        }
        const content = serializeNote(note)
        await writeTextFile(`${folder}/${id}.md`, content)
        setNotes(prev => [note, ...prev])
        return note
    }

    const deleteNote = async (id: string) => {
        if (!folder) return
        await remove(`${folder}/${id}.md`)
        setNotes(prev => prev.filter(n => n.id !== id))
    }

    const resetFolder = () => {
        localStorage.removeItem(FOLDER_KEY)
        setFolder(null)
        setNotes([])
    }

    const renameNote = async (id: string, newTitle: string) => {
        if (!folder) return
        const note = notes.find(n => n.id === id)
        if (!note) return

        const newId = newTitle.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        if (!newId || newId === id) return

        const newPath = `${folder}/${newId}.md`
        const oldPath = `${folder}/${id}.md`

        // check if filename already exists
        const exists = notes.some(n => n.id === newId)
        if (exists) return

        const updated = { ...note, id: newId, title: newTitle.trim() }
        const content = serializeNote(updated)

        await writeTextFile(newPath, content)
        await remove(oldPath)

        setNotes(prev => prev.map(n => n.id === id ? updated : n))
        return updated
    }

    return { folder, notes, loading, pickFolder, resetFolder, saveNote, createNote, deleteNote, renameNote, reload: () => folder && loadNotes(folder) }
}