export type FormatAction =
    | 'h1' | 'h2' | 'bold' | 'italic' | 'code'
    | 'codeblock' | 'bullet' | 'numbered' | 'quote'
    | 'wikilink' | 'hr'

interface FormatResult {
    value: string
    selectionStart: number
    selectionEnd: number
}

export function applyFormat(
    value: string,
    selectionStart: number,
    selectionEnd: number,
    action: FormatAction
): FormatResult {
    const before = value.slice(0, selectionStart)
    const selected = value.slice(selectionStart, selectionEnd)
    const after = value.slice(selectionEnd)

    // line-level actions — modify the current line
    const lineActions = ['h1', 'h2', 'bullet', 'numbered', 'quote', 'hr']
    if (lineActions.includes(action)) {
        const lineStart = before.lastIndexOf('\n') + 1
        const lineEnd = value.indexOf('\n', selectionStart)
        const end = lineEnd === -1 ? value.length : lineEnd
        const line = value.slice(lineStart, end)
        const beforeLine = value.slice(0, lineStart)
        const afterLine = value.slice(end)

        let newLine = line
        let cursorOffset = 0

        if (action === 'h1') {
            if (line.startsWith('# ')) { newLine = line.slice(2); cursorOffset = -2 }
            else { newLine = `# ${line}`; cursorOffset = 2 }
        } else if (action === 'h2') {
            if (line.startsWith('## ')) { newLine = line.slice(3); cursorOffset = -3 }
            else { newLine = `## ${line}`; cursorOffset = 3 }
        } else if (action === 'bullet') {
            if (line.startsWith('- ')) { newLine = line.slice(2); cursorOffset = -2 }
            else { newLine = `- ${line}`; cursorOffset = 2 }
        } else if (action === 'numbered') {
            if (line.match(/^\d+\.\s/)) { newLine = line.replace(/^\d+\.\s/, ''); cursorOffset = -3 }
            else { newLine = `1. ${line}`; cursorOffset = 3 }
        } else if (action === 'quote') {
            if (line.startsWith('> ')) { newLine = line.slice(2); cursorOffset = -2 }
            else { newLine = `> ${line}`; cursorOffset = 2 }
        } else if (action === 'hr') {
            newLine = `${line}\n---`; cursorOffset = 4
        }

        const newValue = `${beforeLine}${newLine}${afterLine}`
        const newCursor = selectionStart + cursorOffset
        return { value: newValue, selectionStart: newCursor, selectionEnd: newCursor }
    }

    // inline actions — wrap selection or insert placeholder
    const placeholders: Record<string, string> = {
        bold: 'bold text',
        italic: 'italic text',
        code: 'code',
        codeblock: 'code here',
        wikilink: 'note name',
    }

    const text = selected || placeholders[action] || ''

    let wrapped = ''
    let innerStart = 0
    let innerEnd = 0

    if (action === 'bold') {
        wrapped = `**${text}**`
        innerStart = selectionStart + 2
        innerEnd = innerStart + text.length
    } else if (action === 'italic') {
        wrapped = `_${text}_`
        innerStart = selectionStart + 1
        innerEnd = innerStart + text.length
    } else if (action === 'code') {
        wrapped = `\`${text}\``
        innerStart = selectionStart + 1
        innerEnd = innerStart + text.length
    } else if (action === 'codeblock') {
        wrapped = `\`\`\`\n${text}\n\`\`\``
        innerStart = selectionStart + 4
        innerEnd = innerStart + text.length
    } else if (action === 'wikilink') {
        wrapped = `[[${text}]]`
        innerStart = selectionStart + 2
        innerEnd = innerStart + text.length
    }

    const newValue = `${before}${wrapped}${after}`
    return { value: newValue, selectionStart: innerStart, selectionEnd: innerEnd }
}