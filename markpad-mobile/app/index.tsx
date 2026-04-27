import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native'
import { useRouter } from 'expo-router'
import { useSearch } from '../hooks/useSearch'
import NoteList from '../components/NoteList'
import SearchBar from '../components/SearchBar'
import { useNotesContext } from '../context/NotesContext'

export default function Index() {
    const router = useRouter()
    const scheme = useColorScheme()
    const dark = scheme === 'dark'
    const { folder, notes, loading, pickFolder, deleteNote, renameNote } = useNotesContext()
    const { query, setQuery, activeTag, setActiveTag, allTags, results } = useSearch(notes)

    const colors = getColors(dark)

    if (!folder) {
        return (
            <View style={[styles.emptyState, { backgroundColor: colors.bg }]}>
                <Text style={[styles.appName, { color: colors.fg }]}>markpad</Text>
                <Text style={[styles.emptyHint, { color: colors.muted }]}>no folder selected</Text>
                <TouchableOpacity style={[styles.pickBtn, { borderColor: colors.fg }]} onPress={pickFolder}>
                    <Text style={[styles.pickBtnText, { color: colors.fg }]}>open notes folder</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={[styles.root, { backgroundColor: colors.bg }]}>
            <View style={[styles.header, { borderBottomColor: colors.fg }]}>
                <Text style={[styles.appName, { color: colors.fg }]}>markpad</Text>
                <TouchableOpacity
                    onPress={() => router.push('/note/new')}
                    style={[styles.newBtn, { borderColor: colors.fg }]}
                >
                    <Text style={[styles.newBtnText, { color: colors.fg }]}>+</Text>
                </TouchableOpacity>
            </View>

            <SearchBar
                query={query}
                onQueryChange={setQuery}
                tags={allTags}
                activeTag={activeTag}
                onTagPress={tag => setActiveTag(t => t === tag ? null : tag)}
                colors={colors}
            />

            <NoteList
                notes={results}
                loading={loading}
                onSelect={note => router.push(`/note/${note.id}`)}
                onDelete={deleteNote}
                onRename={(id, title) => renameNote(id, title)}
                colors={colors}
            />
        </View>
    )
}

export function getColors(dark: boolean) {
    return {
        bg: dark ? '#0f0f0f' : '#fafafa',
        bg2: dark ? '#1a1a1a' : '#f0f0f0',
        fg: dark ? '#e8e8e8' : '#0f0f0f',
        muted: dark ? '#888' : '#666',
        border: dark ? '#333' : '#ddd',
        mono: 'JetBrainsMono_400Regular',
        monoBold: 'JetBrainsMono_500Medium',
    }
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12, borderBottomWidth: 1.5 },
    appName: { fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'JetBrainsMono_500Medium' },
    emptyHint: { fontSize: 12, fontFamily: 'JetBrainsMono_400Regular' },
    pickBtn: { marginTop: 8, paddingVertical: 10, paddingHorizontal: 24, borderWidth: 1.5 },
    pickBtnText: { fontSize: 12, fontFamily: 'JetBrainsMono_400Regular', letterSpacing: 1 },
    newBtn: { width: 32, height: 32, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    newBtnText: { fontSize: 20, lineHeight: 24, fontFamily: 'JetBrainsMono_400Regular' },
})