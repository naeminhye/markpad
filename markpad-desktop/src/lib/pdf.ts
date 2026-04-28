import { Note } from './frontmatter'
import { renderMarkdown } from './markdown'
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'

export async function exportNotePDF(note: Note) {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${note.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 13px; line-height: 1.8; color: #0f0f0f; padding: 48px 56px; max-width: 720px; margin: 0 auto; }
    h1 { font-size: 18px; font-weight: 500; border-bottom: 1.5px solid #0f0f0f; padding-bottom: 8px; margin-bottom: 16px; }
    h2 { font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; margin: 20px 0 8px; }
    p { margin-bottom: 10px; }
    code { font-size: 11px; background: #f0f0f0; padding: 1px 5px; border: 1px solid #ddd; }
    pre { background: #f0f0f0; border: 1.5px solid #0f0f0f; padding: 14px; margin: 12px 0; }
    pre code { background: transparent; border: none; }
    blockquote { border-left: 3px solid #0f0f0f; padding-left: 14px; color: #666; margin: 10px 0; }
    ul, ol { padding-left: 20px; margin-bottom: 10px; }
    li { margin-bottom: 4px; }
    .meta { font-size: 10px; color: #666; margin-bottom: 24px; letter-spacing: 0.08em; }
    .print-btn { position: fixed; bottom: 24px; right: 24px; padding: 10px 20px; font-family: 'JetBrains Mono', monospace; font-size: 12px; background: #0f0f0f; color: #fafafa; border: none; cursor: pointer; letter-spacing: 0.08em; }
    .print-btn:hover { background: #333; }
    @media print { .print-btn { display: none; } }
  </style>
</head>
<body>
  <div class="meta">${note.tags.length ? note.tags.join(', ') + ' · ' : ''}${new Date(note.updatedAt).toLocaleDateString()}</div>
  ${renderMarkdown(note.body)}
  <button class="print-btn" onclick="window.print()">save as PDF</button>
</body>
</html>`

    const encoded = encodeURIComponent(html)
    const dataUrl = `data:text/html;charset=utf-8,${encoded}`

    const label = `print-${Date.now()}`
    const printWin = new WebviewWindow(label, {
        url: dataUrl,
        title: `${note.title} — export`,
        width: 820,
        height: 960,
        focus: true,
    })

    printWin.once('tauri://error', (e: any) => {
        console.error('print window error', e)
    })
}