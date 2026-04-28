import { useState, useEffect, useRef } from 'react'
import {
    View, TextInput, TouchableOpacity, Text, StyleSheet,
    ScrollView, KeyboardAvoidingView, Platform
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Markdown from 'react-native-markdown-display'
import { useNotesContext } from '../../context/NotesContext'
import { useTheme } from '../../context/ThemeContext'
import FormatToolbar from '../../components/FormatToolbar'
import { applyFormat, FormatAction } from '../../lib/formatting'
import { useUndoRedo } from '../../hooks/useUndoRedo'

type Mode = 'edit' | 'preview'

export default function NoteScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()
    const { notes, createNote, saveNote } = useNotesContext()
    const { colors } = useTheme()

    const { value: body, push: pushHistory, undo, redo, reset: resetHistory, canUndo, canRedo, selection: undoSelection } = useUndoRedo('')
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState('')
    const [dirty, setDirty] = useState(false)
    const [mode, setMode] = useState<Mode>('edit')
    const [selection, setSelection] = useState({ start: 0, end: 0 })

    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const noteRef = useRef<any>(null)

    useEffect(() => {
        const init = async () => {
            if (id === 'new') {
                const note = await createNote()
                if (note) {
                    noteRef.current = note
                    resetHistory(note.body)
                    setTags(note.tags)
                }
            } else {
                const note = notes.find(n => n.id === id)
                if (note) {
                    noteRef.current = note
                    resetHistory(note.body)
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

    const handleBodyChange = (val: string, sel?: { start: number; end: number }) => {
        pushHistory({
            value: val,
            selectionStart: sel?.start ?? 0,
            selectionEnd: sel?.end ?? 0,
        })
        setDirty(true)
        triggerSave(val, tags)
    }

    const handleFormat = (action: FormatAction) => {
        const result = applyFormat(body, selection.start, selection.end, action)
        handleBodyChange(result.value, { start: result.selectionStart, end: result.selectionEnd })
        setTimeout(() => {
            setSelection({ start: result.selectionStart, end: result.selectionEnd })
        }, 50)
    }

    const handleUndo = () => {
        const prev = undo()
        if (prev) {
            setDirty(true)
            triggerSave(prev.value, tags)
            setSelection({ start: prev.selectionStart, end: prev.selectionEnd })
        }
    }

    const handleRedo = () => {
        const next = redo()
        if (next) {
            setDirty(true)
            triggerSave(next.value, tags)
            setSelection({ start: next.selectionStart, end: next.selectionEnd })
        }
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

    const markdownStyles = {
        body: { color: colors.fg, fontFamily: colors.mono, fontSize: 13, lineHeight: 22 },
        heading1: { color: colors.fg, fontFamily: colors.monoBold, fontSize: 16, borderBottomWidth: 1.5, borderBottomColor: colors.fg, paddingBottom: 6, marginBottom: 12 },
        heading2: { color: colors.fg, fontFamily: colors.monoBold, fontSize: 13, marginTop: 16, marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: 1 },
        code_inline: { fontFamily: colors.mono, fontSize: 11, backgroundColor: colors.bg2, color: colors.fg },
        fence: { backgroundColor: colors.bg2, padding: 12, marginVertical: 8 },
        blockquote: { borderLeftWidth: 3, borderLeftColor: colors.fg, paddingLeft: 12, marginVertical: 8 },
        bullet_list_icon: { color: colors.fg, fontFamily: colors.mono },
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.bg }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={[styles.header, { borderBottomColor: colors.fg }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={[styles.backText, { color: colors.fg, fontFamily: colors.mono }]}>← back</Text>
                </TouchableOpacity>
                <View style={styles.modeBtns}>
                    {(['edit', 'preview'] as Mode[]).map(m => (
                        <TouchableOpacity
                            key={m}
                            style={[styles.modeBtn, { borderColor: mode === m ? colors.fg : colors.border }]}
                            onPress={() => setMode(m)}
                        >
                            <Text style={[styles.modeBtnText, {
                                color: mode === m ? colors.fg : colors.muted,
                                fontFamily: colors.mono
                            }]}>{m}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <Text style={[styles.status, { color: colors.muted, fontFamily: colors.mono }]}>
                    {dirty ? 'unsaved' : 'saved'} · {wordCount}w
                </Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={[styles.tagBar, { borderBottomColor: colors.border }]}
                contentContainerStyle={styles.tagBarContent}
            >
                {tags.map(tag => (
                    <TouchableOpacity
                        key={tag}
                        style={[styles.tagPill, { borderColor: colors.fg }]}
                        onPress={() => removeTag(tag)}
                    >
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

            {mode === 'edit' && (
                <FormatToolbar
                    onAction={handleFormat}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    colors={colors}
                />
            )}

            {mode === 'edit' ? (
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
                    onSelectionChange={e => setSelection({
                        start: e.nativeEvent.selection.start,
                        end: e.nativeEvent.selection.end
                    })}
                    selection={selection.start !== selection.end ? selection : undefined}
                />
            ) : (
                <ScrollView style={[styles.preview, { backgroundColor: colors.bg }]} contentContainerStyle={styles.previewContent}>
                    {body.trim()
                        ? <Markdown style={markdownStyles}>{body}</Markdown>
                        : <Text style={[styles.emptyPreview, { color: colors.muted, fontFamily: colors.mono }]}>nothing to preview</Text>
                    }
                </ScrollView>
            )}
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12, borderBottomWidth: 1.5 },
    backBtn: { paddingVertical: 4 },
    backText: { fontSize: 12, letterSpacing: 1 },
    modeBtns: { flexDirection: 'row', gap: 6 },
    modeBtn: { paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1 },
    modeBtnText: { fontSize: 10, letterSpacing: 1 },
    status: { fontSize: 10, letterSpacing: 1 },
    tagBar: { borderBottomWidth: 1, maxHeight: 44 },
    tagBarContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 6, alignItems: 'center' },
    tagPill: { paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1 },
    tagText: { fontSize: 10, letterSpacing: 0.5 },
    tagInput: { fontSize: 11, minWidth: 80 },
    editor: { flex: 1, padding: 20, fontSize: 13, lineHeight: 24 },
    preview: { flex: 1 },
    previewContent: { padding: 20 },
    emptyPreview: { fontSize: 12, letterSpacing: 0.5 },
})