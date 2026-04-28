import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useNotesContext } from '../context/NotesContext'
import { useTheme } from '../context/ThemeContext'
import { useSearch } from '../hooks/useSearch'
import NoteList from '../components/NoteList'
import SearchBar from '../components/SearchBar'

const themeIcon = { light: '○', dark: '●', system: '◐' }

export default function Index() {
    const router = useRouter()
    const { theme, cycleTheme, colors } = useTheme()
    const { folder, notes, loading, pickFolder, deleteNote, renameNote } = useNotesContext()
    const { query, setQuery, activeTag, setActiveTag, allTags, results } = useSearch(notes)

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
                <View style={styles.headerRight}>
                    <TouchableOpacity onPress={cycleTheme} style={styles.iconBtn}>
                        <Text style={[styles.iconBtnText, { color: colors.muted }]}>{themeIcon[theme]}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push('/note/new')}
                        style={[styles.newBtn, { borderColor: colors.fg }]}
                    >
                        <Text style={[styles.newBtnText, { color: colors.fg }]}>+</Text>
                    </TouchableOpacity>
                </View>
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

const styles = StyleSheet.create({
    root: { flex: 1 },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12, borderBottomWidth: 1.5 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    appName: { fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'JetBrainsMono_500Medium' },
    emptyHint: { fontSize: 12, fontFamily: 'JetBrainsMono_400Regular' },
    pickBtn: { marginTop: 8, paddingVertical: 10, paddingHorizontal: 24, borderWidth: 1.5 },
    pickBtnText: { fontSize: 12, fontFamily: 'JetBrainsMono_400Regular', letterSpacing: 1 },
    newBtn: { width: 32, height: 32, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    newBtnText: { fontSize: 20, lineHeight: 24, fontFamily: 'JetBrainsMono_400Regular' },
    iconBtn: { padding: 4 },
    iconBtnText: { fontSize: 16, fontFamily: 'JetBrainsMono_400Regular' },
})