
import { useEffect } from 'react'
import './style.css'

interface Props {
    onClose: () => void
}

const shortcuts = [
    { keys: ['⌘', 'N'], description: 'new note' },
    { keys: ['⌘', 'S'], description: 'force save' },
    { keys: ['⌘', 'K'], description: 'search overlay' },
    { keys: ['⌘', 'P'], description: 'export note as PDF' },
    { keys: ['⌘', 'W'], description: 'close window' },
    { keys: ['Esc'], description: 'close overlay / cancel rename' },
    { keys: ['Enter'], description: 'confirm rename' },
    { keys: [','], description: 'add tag (in tag input)' },
    { keys: ['Backspace'], description: 'remove last tag (when input empty)' },
    { keys: ['Double click'], description: 'rename note' },
]

export default function ShortcutGuide({ onClose }: Props) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    return (
        <div className="guide-backdrop" onClick={onClose}>
            <div className="guide-box" onClick={e => e.stopPropagation()}>
                <div className="guide-header">
                    <span>keyboard shortcuts</span>
                    <button className="guide-close" onClick={onClose}>×</button>
                </div>
                <div className="guide-list">
                    {shortcuts.map((s, i) => (
                        <div key={i} className="guide-row">
                            <div className="guide-keys">
                                {s.keys.map((k, j) => (
                                    <kbd key={j}>{k}</kbd>
                                ))}
                            </div>
                            <span className="guide-desc">{s.description}</span>
                        </div>
                    ))}
                </div>
                <div className="guide-hint">press esc or click outside to close</div>
            </div>
        </div>
    )
}