import { Note } from '../lib/frontmatter'

interface ScoredNote {
    note: Note
    score: number
}

export function scoreNote(note: Note, query: string): number {
    if (!query) return 0
    const q = query.toLowerCase()
    let score = 0

    // exact title match — highest
    if (note.title.toLowerCase() === q) score += 100

    // title starts with query
    if (note.title.toLowerCase().startsWith(q)) score += 60

    // title contains query
    if (note.title.toLowerCase().includes(q)) score += 40

    // tag exact match
    if (note.tags.some(t => t === q)) score += 30

    // tag contains query
    if (note.tags.some(t => t.includes(q))) score += 15

    // body contains query — count occurrences, cap at 20pts
    const bodyMatches = (note.body.toLowerCase().match(new RegExp(q, 'g')) || []).length
    score += Math.min(bodyMatches * 2, 20)

    // recency bonus — notes updated in last 7 days get +5
    const daysSinceUpdate = (Date.now() - new Date(note.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceUpdate < 7) score += 5

    return score
}

export function searchNotes(notes: Note[], query: string, activeTag: string | null): Note[] {
    let results = notes

    // filter by tag first
    if (activeTag) {
        results = results.filter(n => n.tags.includes(activeTag))
    }

    if (!query) return results

    // filter to matches only, then sort by score descending
    return results
        .map(note => ({ note, score: scoreNote(note, query) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ note }) => note)
}