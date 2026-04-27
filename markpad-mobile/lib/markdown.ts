export function stripMarkdown(md: string): string {
    return md
        .replace(/^#+\s*/gm, '')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/`(.+?)`/g, '$1')
        .trim()
}