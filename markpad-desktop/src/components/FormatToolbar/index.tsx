import { FormatAction } from '../../lib/formatting'
import './style.css'

type ToolbarAction = FormatAction | 'undo' | 'redo'

interface Props {
    onAction: (action: FormatAction) => void
    onUndo: () => void
    onRedo: () => void
}


const buttons: { label: string; action: ToolbarAction; title: string }[] = [
    { label: '↩', action: 'undo', title: 'undo (Cmd+Z)' },
    { label: '↪', action: 'redo', title: 'redo (Cmd+Shift+Z)' },
    { label: 'H1', action: 'h1', title: 'heading 1' },
    { label: 'H2', action: 'h2', title: 'heading 2' },
    { label: 'B', action: 'bold', title: 'bold' },
    { label: 'I', action: 'italic', title: 'italic' },
    { label: '`', action: 'code', title: 'inline code' },
    { label: '```', action: 'codeblock', title: 'code block' },
    { label: '—', action: 'bullet', title: 'bullet list' },
    { label: '1.', action: 'numbered', title: 'numbered list' },
    { label: '>', action: 'quote', title: 'blockquote' },
    { label: '[[', action: 'wikilink', title: 'wikilink' },
    { label: '---', action: 'hr', title: 'horizontal rule' },
]

export default function FormatToolbar({ onAction, onUndo, onRedo }: Props) {
    return (
        <div className="format-toolbar">
            {buttons.map((btn, i) => (
                <button
                    key={i}
                    className={`fmt-btn ${btn.action === 'undo' || btn.action === 'redo' ? 'fmt-btn-history' : ''}`}
                    title={btn.title}
                    onMouseDown={e => {
                        e.preventDefault()
                        if (btn.action === 'undo') onUndo()
                        else if (btn.action === 'redo') onRedo()
                        else onAction(btn.action as FormatAction)
                    }}
                >{btn.label}</button>
            ))}
        </div>
    )
}
