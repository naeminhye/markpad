import { useState } from 'react'
import { Note } from '../../lib/frontmatter'
import './style.css'

interface Props {
    notes: Note[]
    loading: boolean
    activeId: string | null
    folder: string | null
    onSelect: (note: Note) => void
    onCreate: () => void
    onDelete: (id: string) => void
    onRename: (id: string, newTitle: string) => void
}

export default function Sidebar({ notes, loading, activeId, folder, onSelect, onCreate, onDelete, onRename }: Props) {
    const [search, setSearch] = useState('')
    const [activeTag, setActiveTag] = useState<string | null>(null)
    const [renamingId, setRenamingId] = useState<string | null>(null)
    const [renameValue, setRenameValue] = useState('')

    const allTags = Array.from(new Set(notes.flatMap(n => n.tags))).sort()

    const filtered = notes.filter(n => {
        const matchesTag = !activeTag || n.tags.includes(activeTag)
        const matchesSearch = !search ||
            n.title.toLowerCase().includes(search.toLowerCase()) ||
            n.body.toLowerCase().includes(search.toLowerCase())
        return matchesTag && matchesSearch
    })

    return (
        <div className="sidebar">
            <div className="sidebar-top">
                <span className="sidebar-label" title={folder || ''}>
                    {folder ? folder.split('/').pop() : 'markpad'}
                </span>
                <button className="new-btn" onClick={onCreate}>+</button>
            </div>

            <div className="search-wrap">
                <input
                    className="search-input"
                    placeholder="search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    spellCheck={false}
                />
            </div>

            {allTags.length > 0 && (
                <div className="tags-row">
                    <button
                        className={`tag-btn ${!activeTag ? 'active' : ''}`}
                        onClick={() => setActiveTag(null)}
                    >all</button>
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            className={`tag-btn ${activeTag === tag ? 'active' : ''}`}
                            onClick={() => setActiveTag(t => t === tag ? null : tag)}
                        >{tag}</button>
                    ))}
                </div>
            )}

            <div className="note-list">
                {loading && <p className="list-hint">loading...</p>}
                {!loading && filtered.length === 0 && (
                    <p className="list-hint">no notes</p>
                )}
                {filtered.map(note => (
                    <div
                        key={note.id}
                        className={`note-item ${note.id === activeId ? 'active' : ''}`}
                        onClick={() => !renamingId && onSelect(note)}
                        onDoubleClick={() => {
                            setRenamingId(note.id)
                            setRenameValue(note.title)
                        }}
                    >
                        {renamingId === note.id ? (
                            <input
                                className="rename-input"
                                value={renameValue}
                                autoFocus
                                onChange={e => setRenameValue(e.target.value)}
                                onKeyDown={async e => {
                                    if (e.key === 'Enter') {
                                        await onRename(note.id, renameValue)
                                        setRenamingId(null)
                                    }
                                    if (e.key === 'Escape') setRenamingId(null)
                                }}
                                onBlur={() => setRenamingId(null)}
                                onClick={e => e.stopPropagation()}
                            />
                        ) : (
                            <>
                                <div className="note-item-title">{note.title}</div>
                                <div className="note-item-meta">
                                    {note.tags.length > 0 && <span>{note.tags.join(', ')} · </span>}
                                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                                </div>
                                <button
                                    className="delete-btn"
                                    onClick={async e => {
                                        e.stopPropagation()
                                        const { confirm } = await import('@tauri-apps/plugin-dialog')
                                        const yes = await confirm(`delete "${note.title}"?`, {
                                            title: 'markpad',
                                            kind: 'warning'
                                        })
                                        if (yes) onDelete(note.id)
                                    }}
                                >×</button>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}