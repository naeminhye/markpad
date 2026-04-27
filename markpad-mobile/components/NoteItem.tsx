import { Platform, View, Text, TouchableOpacity, StyleSheet, Alert, ActionSheetIOS } from 'react-native'
import { useState } from 'react'
import { Swipeable } from 'react-native-gesture-handler'
import { useRef } from 'react'
import { Note } from '../lib/frontmatter'

interface Props {
    note: Note
    onSelect: (note: Note) => void
    onDelete: (id: string) => void
    onRename: (id: string, newTitle: string) => void
    colors: any
}

export default function NoteItem({ note, onSelect, onDelete, onRename, colors }: Props) {
    const swipeableRef = useRef<Swipeable>(null)
    const [renaming, setRenaming] = useState(false)
    const [renameValue, setRenameValue] = useState('')

    const confirmDelete = () => {
        if (Platform.OS === 'web') {
            if (window.confirm(`delete "${note.title}"?`)) onDelete(note.id)
            return
        }
        Alert.alert('delete note', `delete "${note.title}"?`, [
            { text: 'cancel', style: 'cancel' },
            { text: 'delete', style: 'destructive', onPress: () => onDelete(note.id) },
        ])
    }

    const promptRename = () => {
        if (Platform.OS === 'web') {
            setRenameValue(note.title)
            setRenaming(true)
            return
        }
        if (Platform.OS === 'ios') {
            Alert.prompt(
                'rename note', 'enter new title',
                [
                    { text: 'cancel', style: 'cancel' },
                    { text: 'rename', onPress: (val?: string) => { if (val?.trim()) onRename(note.id, val.trim()) } },

                ],
                'plain-text', note.title
            )
        } else {
            setRenameValue(note.title)
            setRenaming(true)
        }
    }

    const handleOptions = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                { options: ['cancel', 'rename', 'delete'], destructiveButtonIndex: 2, cancelButtonIndex: 0, title: note.title },
                index => {
                    if (index === 1) promptRename()
                    if (index === 2) confirmDelete()
                }
            )
        } else {
            Alert.alert(note.title, 'choose an action', [
                { text: 'cancel', style: 'cancel' },
                { text: 'rename', onPress: promptRename },
                { text: 'delete', style: 'destructive', onPress: confirmDelete },
            ])
        }
    }

    const renderRightActions = () => (
        <TouchableOpacity
            style={[styles.deleteAction, { backgroundColor: colors.fg }]}
            onPress={() => { swipeableRef.current?.close(); confirmDelete() }}
        >
            <Text style={[styles.deleteActionText, { color: colors.bg, fontFamily: colors.mono }]}>delete</Text>
        </TouchableOpacity>
    )

    // web inline rename input
    if (renaming && (Platform.OS === 'web' || Platform.OS === 'android')) {
        return (
            <View style={[styles.item, { borderBottomColor: colors.border, backgroundColor: colors.bg }]}>
                <input
                    style={{ flex: 1, fontFamily: colors.mono, fontSize: 13, background: 'transparent', border: 'none', borderBottom: `1px solid ${colors.fg}`, color: colors.fg, outline: 'none', padding: '4px 0' }}
                    value={renameValue}
                    autoFocus
                    onChange={(e: any) => setRenameValue(e.target.value)}
                    onKeyDown={(e: any) => {
                        if (e.key === 'Enter') { onRename(note.id, renameValue); setRenaming(false) }
                        if (e.key === 'Escape') setRenaming(false)
                    }}
                    onBlur={() => setRenaming(false)}
                />
            </View>
        )
    }

    return (
        <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} rightThreshold={60} overshootRight={false}>
            <TouchableOpacity
                style={[styles.item, { borderBottomColor: colors.border, backgroundColor: colors.bg }]}
                onPress={() => onSelect(note)}
                activeOpacity={0.7}
            >
                <View style={styles.itemContent}>
                    <Text style={[styles.title, { color: colors.fg, fontFamily: colors.monoBold }]} numberOfLines={1}>{note.title}</Text>
                    <Text style={[styles.meta, { color: colors.muted, fontFamily: colors.mono }]}>
                        {note.tags.length > 0 ? note.tags.join(', ') + ' · ' : ''}
                        {new Date(note.updatedAt).toLocaleDateString()}
                    </Text>
                </View>
                <TouchableOpacity style={styles.menuBtn} onPress={handleOptions} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={[styles.menuDots, { color: colors.muted }]}>•••</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        </Swipeable>
    )
}

const styles = StyleSheet.create({
    item: { flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 8, paddingVertical: 12, borderBottomWidth: 1 },
    itemContent: { flex: 1, marginRight: 8 },
    title: { fontSize: 13, marginBottom: 3 },
    meta: { fontSize: 11 },
    menuBtn: { padding: 6 },
    menuDots: { fontSize: 14, letterSpacing: 1 },
    deleteAction: { justifyContent: 'center', alignItems: 'center', width: 80 },
    deleteActionText: { fontSize: 11, letterSpacing: 1 },
})