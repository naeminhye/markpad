import { Note } from './frontmatter'

// finds all [[note name]] patterns in a string
export function extractWikilinks(body: string): string[] {
    const matches = body.match(/\[\[([^\]]+)\]\]/g) || []
    return matches.map(m => m.slice(2, -2).trim().toLowerCase())
}

// replaces [[note name]] with clickable spans in rendered HTML
export function processWikilinks(html: string, notes: Note[], onNavigate: (id: string) => void): string {
    return html.replace(/\[\[([^\]]+)\]\]/g, (_, title) => {
        const target = notes.find(n =>
            n.title.toLowerCase() === title.trim().toLowerCase() ||
            n.id.toLowerCase() === title.trim().toLowerCase().replace(/\s+/g, '-')
        )
        const id = target ? target.id : title.trim().toLowerCase().replace(/\s+/g, '-')
        const exists = !!target
        return `<span 
      class="wikilink ${exists ? 'wikilink-exists' : 'wikilink-missing'}" 
      data-note-id="${id}"
      data-note-title="${title.trim()}"
    >[[${title.trim()}]]</span>`
    })
}