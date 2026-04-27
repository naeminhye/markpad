import { useState, useEffect, useCallback } from 'react'
import { register } from '@tauri-apps/plugin-global-shortcut'
import { useKeyboard } from './hooks/useKeyboard'
import { useNotes } from './hooks/useNotes'
import { Note } from './lib/frontmatter'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import SearchOverlay from './components/SearchOverlay'
import Titlebar from './components/Titlebar'
import ShortcutGuide from './components/ShortcutGuide'

import './App.css'

export default function App() {
  const { folder, notes, loading, pickFolder, resetFolder, saveNote, createNote, deleteNote, renameNote } = useNotes()
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)

  useKeyboard({
    'mod+n': () => handleCreate(),
    'mod+s': () => { if (activeNote) saveNote(activeNote) },
    'mod+/': () => setGuideOpen(o => !o),
  })

  useEffect(() => {
    if (notes.length && !activeNote) setActiveNote(notes[0])
  }, [notes])

  useEffect(() => {
    let lastFired = 0

    register('CommandOrControl+K', () => {
      const now = Date.now()
      if (now - lastFired < 300) return
      lastFired = now
      setSearchOpen(o => !o)
    })

    return () => { }
  }, [])

  const handleCreate = async () => {
    const note = await createNote()
    if (note) setActiveNote(note)
  }

  const handleSave = useCallback(async (note: Note) => {
    await saveNote(note)
    if (activeNote?.id === note.id) setActiveNote(note)
  }, [activeNote, saveNote])

  const handleDelete = async (id: string) => {
    await deleteNote(id)
    setActiveNote(notes.find(n => n.id !== id) || null)
  }

  const handleRename = async (id: string, newTitle: string) => {
    const updated = await renameNote(id, newTitle)
    if (updated && activeNote?.id === id) setActiveNote(updated)
  }

  if (!folder) {
    return (
      <div className="empty-state">
        <p className="empty-title">markpad</p>
        <p className="empty-sub">no folder selected</p>
        <button className="pick-btn" onClick={pickFolder}>open folder</button>
      </div>
    )
  }

  return (
    <div className="app-root">
      <Titlebar onResetFolder={resetFolder} onShowGuide={() => setGuideOpen(true)} />
      <div className="app">
        {searchOpen && (
          <SearchOverlay
            notes={notes}
            onSelect={note => { setActiveNote(note); setSearchOpen(false) }}
            onClose={() => setSearchOpen(false)}
          />
        )}
        {guideOpen && <ShortcutGuide onClose={() => setGuideOpen(false)} />}

        <Sidebar
          notes={notes}
          loading={loading}
          activeId={activeNote?.id || null}
          folder={folder}
          onSelect={setActiveNote}
          onCreate={handleCreate}
          onDelete={handleDelete}
          onRename={handleRename}
        />
        <div className="main">
          {activeNote
            ? <Editor note={activeNote} onSave={handleSave} />
            : <div className="no-note">select or create a note</div>
          }
        </div>
      </div>
    </div>
  )
}