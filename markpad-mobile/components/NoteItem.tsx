import { useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActionSheetIOS, Platform
} from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
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

  const handleOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['cancel', 'rename', 'delete'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
          title: note.title,
        },
        index => {
          if (index === 1) promptRename()
          if (index === 2) confirmDelete()
        }
      )
    } else {
      // Android fallback — Alert with buttons
      Alert.alert(note.title, 'choose an action', [
        { text: 'cancel', style: 'cancel' },
        { text: 'rename', onPress: promptRename },
        { text: 'delete', style: 'destructive', onPress: confirmDelete },
      ])
    }
  }

  const promptRename = () => {
    Alert.prompt(
      'rename note',
      'enter new title',
      [
        { text: 'cancel', style: 'cancel' },
        { text: 'rename', onPress: (val: any) => { if (val?.trim()) onRename(note.id, val.trim()) } },
      ],
      'plain-text',
      note.title
    )
  }

  const confirmDelete = () => {
    Alert.alert('delete note', `delete "${note.title}"?`, [
      { text: 'cancel', style: 'cancel' },
      { text: 'delete', style: 'destructive', onPress: () => onDelete(note.id) },
    ])
  }

  const renderRightActions = (progress: any) => {
    return (
      <TouchableOpacity
        style={[styles.deleteAction, { backgroundColor: colors.fg }]}
        onPress={() => {
          swipeableRef.current?.close()
          confirmDelete()
        }}
      >
        <Text style={[styles.deleteActionText, { color: colors.bg, fontFamily: colors.mono }]}>
          delete
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={60}
      overshootRight={false}
    >
      <TouchableOpacity
        style={[styles.item, { borderBottomColor: colors.border, backgroundColor: colors.bg }]}
        onPress={() => onSelect(note)}
        activeOpacity={0.7}
      >
        <View style={styles.itemContent}>
          <Text
            style={[styles.title, { color: colors.fg, fontFamily: colors.monoBold }]}
            numberOfLines={1}
          >
            {note.title}
          </Text>
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