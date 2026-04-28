import { useState, useEffect, useRef, useCallback } from 'react'
import { Note } from '../../lib/frontmatter'
import { renderMarkdownWithWikilinks } from '../../lib/markdown'
import { exportNote, } from '../../lib/export'
import { applyFormat, FormatAction } from '../../lib/formatting'

import FormatToolbar from '../FormatToolbar'

import './style.css'

type Mode = 'edit' | 'split' | 'preview'

interface Props {
    note: Note
    notes: Note[]
    onSave: (note: Note) => void
    onNavigate: (id: string, title: string) => void
}

export default function Editor({ note, notes, onSave, onNavigate }: Props) {
    const [body, setBody] = useState(note.body)
    const [tags, setTags] = useState<string[]>(note.tags)
    const [tagInput, setTagInput] = useState('')
    const [mode, setMode] = useState<Mode>('edit')
    const [dirty, setDirty] = useState(false)
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        setBody(note.body)
        setTags(note.tags)
        setDirty(false)
    }, [note.id])

    const triggerSave = useCallback((newBody: string, newTags: string[]) => {
        if (saveTimer.current) clearTimeout(saveTimer.current)
        saveTimer.current = setTimeout(() => {
            const firstLine = newBody.split('\n')[0].replace(/^#+\s*/, '').trim()
            onSave({ ...note, body: newBody, tags: newTags, title: firstLine || 'untitled' })
            setDirty(false)
        }, 800)
    }, [note, onSave])

    const handleBodyChange = useCallback((val: string) => {
        setBody(val)
        setDirty(true)
        triggerSave(val, tags)
    }, [tags, triggerSave])

    const addTag = () => {
        const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
        if (!t || tags.includes(t)) { setTagInput(''); return }
        const next = [...tags, t]
        setTags(next)
        setTagInput('')
        setDirty(true)
        triggerSave(body, next)
    }

    const removeTag = (tag: string) => {
        const next = tags.filter(t => t !== tag)
        setTags(next)
        setDirty(true)
        triggerSave(body, next)
    }

    const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement
        const wikilink = target.closest('.wikilink') as HTMLElement | null
        if (wikilink) {
            const id = wikilink.dataset.noteId || ''
            const title = wikilink.dataset.noteTitle || ''
            onNavigate(id, title)
        }
    }

    const handleFormat = (action: FormatAction) => {
        const ta = textareaRef.current
        if (!ta) return

        const { value, selectionStart, selectionEnd } = applyFormat(
            ta.value,
            ta.selectionStart,
            ta.selectionEnd,
            action
        )

        // update state
        handleBodyChange(value)

        // restore selection after React re-render
        requestAnimationFrame(() => {
            ta.focus()
            ta.setSelectionRange(selectionStart, selectionEnd)
        })
    }

    const handleUndo = () => {
        textareaRef.current?.focus()
        document.execCommand('undo')
    }

    const handleRedo = () => {
        textareaRef.current?.focus()
        document.execCommand('redo')
    }

    const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0
    const lineCount = body.split('\n').length
    const previewHtml = renderMarkdownWithWikilinks(body, notes)

    return (
        <div className="editor-root">
            <div className="editor-toolbar">
                <span className="editor-title">{note.title}</span>
                <div className="toolbar-right">
                    <div className="mode-btns">
                        {(['edit', 'split', 'preview'] as Mode[]).map(m => (
                            <button
                                key={m}
                                className={`mode-btn ${mode === m ? 'active' : ''}`}
                                onClick={() => setMode(m)}
                            >{m}</button>
                        ))}
                    </div>
                    <div className="export-btns">
                        <span className="export-label">export</span>
                        <button className="tb-btn" onClick={() => exportNote(note, 'html')} title="export as HTML">html</button>
                        <button className="tb-btn" onClick={() => exportNote(note, 'txt')} title="export as TXT">txt</button>
                        <button className="tb-btn" onClick={() => exportNote(note, 'docx')} title="export as DOCX">docx</button>
                        <button className="tb-btn" onClick={() => exportNote(note, 'pdf')} title="export as PDF">pdf</button>
                    </div>
                </div>
            </div>

            <div className="tag-bar">
                {tags.map(tag => (
                    <span key={tag} className="tag-pill">
                        {tag}
                        <button className="tag-remove" onClick={() => removeTag(tag)}>×</button>
                    </span>
                ))}
                <input
                    className="tag-input"
                    placeholder="add tag..."
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() }
                        if (e.key === 'Backspace' && !tagInput && tags.length) removeTag(tags[tags.length - 1])
                    }}
                    spellCheck={false}
                />
            </div>

            <FormatToolbar
                onAction={handleFormat}
                onUndo={handleUndo}
                onRedo={handleRedo}
            />

            <div className="editor-body">
                {(mode === 'edit' || mode === 'split') && (
                    <textarea
                        ref={textareaRef}
                        className="editor-textarea"
                        value={body}
                        onChange={e => handleBodyChange(e.target.value)}
                        spellCheck={false}
                    />
                )}
                {(mode === 'preview' || mode === 'split') && (
                    <div
                        className="editor-preview"
                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                        onClick={handlePreviewClick}
                    />
                )}
            </div>

            <div className="editor-statusbar">
                <span>{wordCount} words</span>
                <span>{lineCount} lines</span>
                <span>{note.tags.length > 0 ? note.tags.join(', ') : 'no tags'}</span>
                <span>{dirty ? 'unsaved' : 'saved'}</span>
            </div>
        </div>
    )
}