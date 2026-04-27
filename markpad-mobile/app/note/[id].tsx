import { useState, useEffect, useRef } from 'react'
import { View, TextInput, TouchableOpacity, Text, StyleSheet, useColorScheme, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useNotesContext } from '../../context/NotesContext'
import { getColors } from '../index'

export default function NoteScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()
    const scheme = useColorScheme()
    const dark = scheme === 'dark'
    const colors = getColors(dark)
    const { notes, createNote, saveNote } = useNotesContext()

    const [body, setBody] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState('')
    const [dirty, setDirty] = useState(false)
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const noteRef = useRef<any>(null)

    useEffect(() => {
        const init = async () => {
            if (id === 'new') {
                const note = await createNote()
                if (note) {
                    noteRef.current = note
                    setBody(note.body)
                    setTags(note.tags)
                }
            } else {
                const note = notes.find(n => n.id === id)
                if (note) {
                    noteRef.current = note
                    setBody(note.body)
                    setTags(note.tags)
                }
            }
        }
        init()
    }, [id])

    const triggerSave = (newBody: string, newTags: string[]) => {
        if (saveTimer.current) clearTimeout(saveTimer.current)
        saveTimer.current = setTimeout(async () => {
            if (!noteRef.current) return
            const firstLine = newBody.split('\n')[0].replace(/^#+\s*/, '').trim()
            const updated = {
                ...noteRef.current,
                body: newBody,
                tags: newTags,
                title: firstLine || 'untitled'
            }
            noteRef.current = updated
            await saveNote(updated)
            setDirty(false)
        }, 800)
    }

    const handleBodyChange = (val: string) => {
        setBody(val)
        setDirty(true)
        triggerSave(val, tags)
    }

    const addTag = () => {
        const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        if (!t || tags.includes(t)) { setTagInput(''); return }
        const next = [...tags, t]
        setTags(next)
        setTagInput('')
        setDirty(true)
        triggerSave(body, next)
    }

    const removeTag = (tag: string) => {
        const next = tags.filter(t => t !== tag)
        setTags(next)
        triggerSave(body, next)
    }

    const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[styles.header, { borderBottomColor: colors.fg }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={[styles.backText, { color: colors.fg, fontFamily: colors.mono }]}>← back</Text>
                </TouchableOpacity>
                <Text style={[styles.status, { color: colors.muted, fontFamily: colors.mono }]}>
                    {dirty ? 'unsaved' : 'saved'} · {wordCount}w
                </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.tagBar, { borderBottomColor: colors.border }]} contentContainerStyle={styles.tagBarContent}>
                {tags.map(tag => (
                    <TouchableOpacity key={tag} style={[styles.tagPill, { borderColor: colors.fg }]} onPress={() => removeTag(tag)}>
                        <Text style={[styles.tagText, { color: colors.fg, fontFamily: colors.mono }]}>{tag} ×</Text>
                    </TouchableOpacity>
                ))}
                <TextInput
                    style={[styles.tagInput, { color: colors.fg, fontFamily: colors.mono }]}
                    placeholder="add tag..."
                    placeholderTextColor={colors.muted}
                    value={tagInput}
                    onChangeText={setTagInput}
                    onSubmitEditing={addTag}
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyType="done"
                />
            </ScrollView>

            <TextInput
                style={[styles.editor, { color: colors.fg, fontFamily: colors.mono, backgroundColor: colors.bg }]}
                multiline
                value={body}
                onChangeText={handleBodyChange}
                placeholder="start writing..."
                placeholderTextColor={colors.muted}
                autoCorrect={false}
                autoCapitalize="none"
                textAlignVertical="top"
            />
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12, borderBottomWidth: 1.5 },
    backBtn: { paddingVertical: 4 },
    backText: { fontSize: 12, letterSpacing: 1 },
    status: { fontSize: 10, letterSpacing: 1 },
    tagBar: { borderBottomWidth: 1, maxHeight: 44 },
    tagBarContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 6, alignItems: 'center' },
    tagPill: { paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1 },
    tagText: { fontSize: 10, letterSpacing: 0.5 },
    tagInput: { fontSize: 11, minWidth: 80 },
    editor: { flex: 1, padding: 20, fontSize: 13, lineHeight: 24 },
})