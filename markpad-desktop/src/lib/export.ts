import { save } from '@tauri-apps/plugin-dialog'
import { writeTextFile, writeFile } from '@tauri-apps/plugin-fs'
import { Note } from './frontmatter'
import { renderMarkdown } from './markdown'
import { exportNotePDF } from './pdf'
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx'

export type ExportFormat = 'html' | 'txt' | 'docx' | 'pdf'

export async function exportNote(note: Note, format: ExportFormat) {
    if (format === 'pdf') {
        await exportNotePDF(note)
        return
    }

    const filters: Record<string, { name: string; extensions: string[] }> = {
        html: { name: 'HTML File', extensions: ['html'] },
        txt: { name: 'Text File', extensions: ['txt'] },
        docx: { name: 'Word Document', extensions: ['docx'] },
    }

    const path = await save({
        title: `export "${note.title}"`,
        defaultPath: `${note.title}.${format}`,
        filters: [filters[format]],
    })

    if (!path) return

    if (format === 'html') await exportHTML(note, path)
    if (format === 'txt') await exportTXT(note, path)
    if (format === 'docx') await exportDOCX(note, path)
}

// ─── HTML ──────────────────────────────────────────────────────
async function exportHTML(note: Note, path: string) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${note.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.8; color: #0f0f0f; padding: 48px 56px; max-width: 720px; margin: 0 auto; }
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
  </style>
</head>
<body>
  <div class="meta">${note.tags.length ? note.tags.join(', ') + ' · ' : ''}${new Date(note.updatedAt).toLocaleDateString()}</div>
  ${renderMarkdown(note.body)}
</body>
</html>`
    await writeTextFile(path, html)
}

// ─── TXT ──────────────────────────────────────────────────────
async function exportTXT(note: Note, path: string) {
    const text = [
        note.title,
        '='.repeat(note.title.length),
        '',
        note.tags.length ? `tags: ${note.tags.join(', ')}` : '',
        note.tags.length ? '' : '',
        note.body,
    ].filter((line, i) => !(i === 3 && !note.tags.length)).join('\n')

    await writeTextFile(path, text)
}

// ─── DOCX ─────────────────────────────────────────────────────
async function exportDOCX(note: Note, path: string) {
    const lines = note.body.split('\n')
    const children: Paragraph[] = []

    // meta line
    if (note.tags.length) {
        children.push(new Paragraph({
            children: [new TextRun({
                text: `tags: ${note.tags.join(', ')} · ${new Date(note.updatedAt).toLocaleDateString()}`,
                size: 18,
                color: '666666',
                font: 'Courier New',
            })]
        }))
        children.push(new Paragraph({ text: '' }))
    }

    for (const line of lines) {
        if (line.startsWith('# ')) {
            children.push(new Paragraph({
                text: line.slice(2),
                heading: HeadingLevel.HEADING_1,
            }))
        } else if (line.startsWith('## ')) {
            children.push(new Paragraph({
                text: line.slice(3),
                heading: HeadingLevel.HEADING_2,
            }))
        } else if (line.startsWith('### ')) {
            children.push(new Paragraph({
                text: line.slice(4),
                heading: HeadingLevel.HEADING_3,
            }))
        } else if (line.startsWith('> ')) {
            children.push(new Paragraph({
                children: [new TextRun({
                    text: line.slice(2),
                    italics: true,
                    color: '666666',
                    font: 'Courier New',
                })]
            }))
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
            children.push(new Paragraph({
                text: line.slice(2),
                bullet: { level: 0 },
            }))
        } else {
            // handle inline bold/italic
            const text = line
                .replace(/\*\*(.+?)\*\*/g, '$1')
                .replace(/\*(.+?)\*/g, '$1')
                .replace(/`(.+?)`/g, '$1')
            children.push(new Paragraph({
                children: [new TextRun({
                    text,
                    font: 'Courier New',
                    size: 22,
                })]
            }))
        }
    }

    const doc = new Document({
        sections: [{ children }]
    })

    const buffer = await Packer.toBuffer(doc)
    await writeFile(path, buffer)
}