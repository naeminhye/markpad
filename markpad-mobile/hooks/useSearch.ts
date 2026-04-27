import { useMemo, useState } from 'react'
import { Note } from '../lib/frontmatter'

export function useSearch(notes: Note[]) {
    const [query, setQuery] = useState('')
    const [activeTag, setActiveTag] = useState<string | null>(null)

    const allTags = useMemo(() =>
        Array.from(new Set(notes.flatMap(n => n.tags))).sort()
        , [notes])

    const results = useMemo(() => notes.filter(n => {
        const matchesTag = !activeTag || n.tags.includes(activeTag)
        const matchesSearch = !query ||
            n.title.toLowerCase().includes(query.toLowerCase()) ||
            n.body.toLowerCase().includes(query.toLowerCase())
        return matchesTag && matchesSearch
    }), [notes, query, activeTag])

    return { query, setQuery, activeTag, setActiveTag, allTags, results }
}