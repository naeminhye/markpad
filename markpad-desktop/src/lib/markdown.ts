import { marked } from 'marked'
import { Note } from './frontmatter'
import { processWikilinks } from './wikilinks'

marked.setOptions({ gfm: true, breaks: true })

export function renderMarkdown(md: string): string {
  return marked(md) as string
}

export function renderMarkdownWithWikilinks(md: string, notes: Note[]): string {
  const html = marked(md) as string
  return processWikilinks(html, notes, () => {})
}