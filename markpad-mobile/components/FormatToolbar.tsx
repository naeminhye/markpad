import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { FormatAction } from '../lib/formatting'

type ToolbarAction = FormatAction | 'undo' | 'redo'

interface Props {
    onAction: (action: FormatAction) => void
    onUndo: () => void
    onRedo: () => void
    canUndo: boolean
    canRedo: boolean
    colors: any
}

const buttons: { label: string; action: ToolbarAction }[] = [
    { label: '↩', action: 'undo' },
    { label: '↪', action: 'redo' },
    { label: 'H1', action: 'h1' },
    { label: 'H2', action: 'h2' },
    { label: 'B', action: 'bold' },
    { label: 'I', action: 'italic' },
    { label: '`', action: 'code' },
    { label: '```', action: 'codeblock' },
    { label: '—', action: 'bullet' },
    { label: '1.', action: 'numbered' },
    { label: '>', action: 'quote' },
    { label: '[[', action: 'wikilink' },
    { label: '---', action: 'hr' },
]

export default function FormatToolbar({ onAction, onUndo, onRedo, canUndo, canRedo, colors }: Props) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.toolbar, { borderTopColor: colors.border, backgroundColor: colors.bg2 }]}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="always"
        >
            {buttons.map((btn, i) => {
                const isUndo = btn.action === 'undo'
                const isRedo = btn.action === 'redo'
                const disabled = (isUndo && !canUndo) || (isRedo && !canRedo)

                return (
                    <TouchableOpacity
                        key={i}
                        style={[
                            styles.btn,
                            { borderColor: colors.border },
                            isRedo && styles.historyRight,
                            disabled && styles.btnDisabled,
                        ]}
                        onPress={() => {
                            if (isUndo) onUndo()
                            else if (isRedo) onRedo()
                            else onAction(btn.action as FormatAction)
                        }}
                        disabled={disabled}
                    >
                        <Text style={[
                            styles.btnText,
                            { color: disabled ? colors.muted : colors.fg, fontFamily: 'JetBrainsMono_400Regular' }
                        ]}>
                            {btn.label}
                        </Text>
                    </TouchableOpacity>
                )
            })}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    toolbar: { borderTopWidth: 1, maxHeight: 44, flexShrink: 0 },
    content: { paddingHorizontal: 8, paddingVertical: 6, gap: 4, alignItems: 'center' },
    btn: { paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, minWidth: 32, alignItems: 'center' },
    btnText: { fontSize: 11, letterSpacing: 0.5 },
    btnDisabled: { opacity: 0.35 },
    historyRight: { marginRight: 8 },
})