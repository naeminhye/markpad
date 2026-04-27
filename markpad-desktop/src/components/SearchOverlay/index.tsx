import { useState, useEffect, useRef } from 'react'
import { Note } from '../../lib/frontmatter'
import './style.css'

interface Props {
    notes: Note[]
    onSelect: (note: Note) => void
    onClose: () => void
}

export default function SearchOverlay({ notes, onSelect, onClose }: Props) {
    const [query, setQuery] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => { inputRef.current?.focus() }, [])

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    const results = !query ? [] : notes.filter(n =>
        n.title.toLowerCase().includes(query.toLowerCase()) ||
        n.body.toLowerCase().includes(query.toLowerCase()) ||
        n.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 8)

    return (
        <div className="overlay-backdrop" onClick={onClose}>
            <div className="overlay-box" onClick={e => e.stopPropagation()}>
                <input
                    ref={inputRef}
                    className="overlay-input"
                    placeholder="search notes..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    spellCheck={false}
                />
                <div className="overlay-results">
                    {results.length === 0 && query && (
                        <p className="overlay-empty">no results for "{query}"</p>
                    )}
                    {results.map(note => (
                        <div key={note.id} className="overlay-item" onClick={() => onSelect(note)}>
                            <span className="overlay-item-title">{note.title}</span>
                            {note.tags.length > 0 && (
                                <span className="overlay-item-tags">{note.tags.join(', ')}</span>
                            )}
                        </div>
                    ))}
                </div>
                <div className="overlay-hint">esc to close · enter to open</div>
            </div>
        </div>
    )
}