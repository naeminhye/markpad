export interface NoteMeta {
    title: string
    tags: string[]
    createdAt: string
    updatedAt: string
}

export interface Note extends NoteMeta {
    id: string       // filename without .md
    body: string     // content without frontmatter
    raw: string      // full file content
}

const FM_REGEX = /^---\n([\s\S]*?)\n---\n?/

export function parseFrontmatter(raw: string, filename: string): Note {
    const match = raw.match(FM_REGEX)
    let meta: Partial<NoteMeta> = {}
    let body = raw

    if (match) {
        body = raw.slice(match[0].length)
        match[1].split('\n').forEach(line => {
            const [key, ...rest] = line.split(':')
            const val = rest.join(':').trim()
            if (key === 'title') meta.title = val
            if (key === 'tags') meta.tags = val.replace(/[\[\]]/g, '').split(',').map(t => t.trim()).filter(Boolean)
            if (key === 'createdAt') meta.createdAt = val
            if (key === 'updatedAt') meta.updatedAt = val
        })
    }

    const id = filename.replace(/\.md$/, '')
    return {
        id,
        body,
        raw,
        title: meta.title || id,
        tags: meta.tags || [],
        createdAt: meta.createdAt || new Date().toISOString(),
        updatedAt: meta.updatedAt || new Date().toISOString(),
    }
}

export function serializeNote(note: Note): string {
    return `---
title: ${note.title}
tags: [${note.tags.join(', ')}]
createdAt: ${note.createdAt}
updatedAt: ${new Date().toISOString()}
---
${note.body}`
}