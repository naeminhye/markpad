import { getCurrentWindow } from '@tauri-apps/api/window'
import './style.css'

interface Props {
    onResetFolder: () => void
    onShowGuide: () => void
    theme: 'light' | 'dark' | 'system'
    onToggleTheme: () => void
}

const themeIcon = {
    light: '○',
    dark: '●',
    system: '◐',
}

export default function Titlebar({ onResetFolder, onShowGuide, theme, onToggleTheme }: Props) {
    const win = getCurrentWindow()

    return (
        <div className="titlebar" data-tauri-drag-region>
            <span className="titlebar-name" data-tauri-drag-region>markpad</span>
            <div className="titlebar-controls">
                <button className="folder-btn" onClick={onResetFolder} title="change folder">⌂</button>
                <button className="guide-btn" onClick={onShowGuide} title="shortcuts">?</button>
                <button
                    className="theme-btn"
                    onClick={onToggleTheme}
                    title={`theme: ${theme} (click to cycle)`}
                >{themeIcon[theme]}</button>
                <button onClick={() => win.minimize()}>−</button>
                <button onClick={() => win.toggleMaximize()}>□</button>
                <button className="close-btn" onClick={() => win.close()}>×</button>
            </div>
        </div>
    )
}