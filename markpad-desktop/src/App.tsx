import { useState, useEffect, useCallback } from 'react'
import { register } from '@tauri-apps/plugin-global-shortcut'
import { useKeyboard } from './hooks/useKeyboard'
import { useNotes } from './hooks/useNotes'
import { useSidebarResize } from './hooks/useSidebarResize'
import { useTheme } from './hooks/useTheme'
import { Note } from './lib/frontmatter'
import { exportNotePDF } from './lib/pdf'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import SearchOverlay from './components/SearchOverlay'
import Titlebar from './components/Titlebar'
import ShortcutGuide from './components/ShortcutGuide'

import './App.css'

export default function App() {
  const { folder, notes, loading, pickFolder, resetFolder, saveNote, createNote, createNoteWithContent, deleteNote, renameNote } = useNotes()
  const { width: sidebarWidth, dragging, startDrag } = useSidebarResize()
  const { theme, cycleTheme } = useTheme()

  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)

  useKeyboard({
    'mod+n': () => handleCreate(),
    'mod+s': () => { if (activeNote) saveNote(activeNote) },
    'mod+/': () => setGuideOpen(o => !o),
    'mod+p': () => { if (activeNote) exportNotePDF(activeNote) },
    'mod+k': () => setSearchOpen(o => !o),
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
    }).catch(() => {
      // hotkey already registered by another app, fallback to window-level only
      console.warn('Cmd+K global shortcut unavailable, using window listener only')
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

  const handleNavigate = async (id: string, title: string) => {
    const existing = notes.find(n => n.id === id)
    if (existing) {
      setActiveNote(existing)
      return
    }
    const note = await createNoteWithContent(id, title, `# ${title}\n`)
    if (note) setActiveNote(note)
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
      <Titlebar
        onResetFolder={resetFolder}
        onShowGuide={() => setGuideOpen(true)}
        theme={theme}
        onToggleTheme={cycleTheme}
      />
      <div className="app">
        {searchOpen && (
          <SearchOverlay
            notes={notes}
            onSelect={note => { setActiveNote(note); setSearchOpen(false) }}
            onClose={() => setSearchOpen(false)}
          />
        )}
        {guideOpen && <ShortcutGuide onClose={() => setGuideOpen(false)} />}
        <div style={{ width: sidebarWidth, flexShrink: 0 }}>
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
        </div>
        <div
          className={`resize-handle ${dragging ? 'dragging' : ''}`}
          onMouseDown={startDrag}
        />
        <div className="main">
          {activeNote
            ?
            <Editor
              note={activeNote}
              notes={notes}
              onSave={handleSave}
              onNavigate={handleNavigate}
            />
            : (
              <div className="no-note">
                {notes.length === 0
                  ? (
                    <div className="empty-state-inner">
                      <p className="empty-state-title">no notes yet</p>
                      <p className="empty-state-hint">press <kbd>Cmd+N</kbd> to create your first note</p>
                      <p className="empty-state-hint">or click <span>+</span> in the sidebar</p>
                    </div>
                  )
                  : <p>select a note</p>
                }
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}