import { FlatList, Text, StyleSheet } from 'react-native'
import { Note } from '../lib/frontmatter'
import NoteItem from './NoteItem'

interface Props {
    notes: Note[]
    loading: boolean
    onSelect: (note: Note) => void
    onDelete: (id: string) => void
    onRename: (id: string, newTitle: string) => void
    colors: any
}

export default function NoteList({ notes, loading, onSelect, onDelete, onRename, colors }: Props) {
    if (loading) {
        return <Text style={[styles.hint, { color: colors.muted, fontFamily: colors.mono }]}>loading...</Text>
    }

    if (notes.length === 0) {
        return <Text style={[styles.hint, { color: colors.muted, fontFamily: colors.mono }]}>no notes</Text>
    }

    return (
        <FlatList
            data={notes}
            keyExtractor={n => n.id}
            renderItem={({ item }) => (
                <NoteItem
                    note={item}
                    onSelect={onSelect}
                    onDelete={onDelete}
                    onRename={onRename}
                    colors={colors}
                />
            )}
        />
    )
}

const styles = StyleSheet.create({
    hint: { padding: 16, fontSize: 12 },
})