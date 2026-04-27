import { View, TextInput, TouchableOpacity, Text, ScrollView, StyleSheet } from 'react-native'

interface Props {
    query: string
    onQueryChange: (q: string) => void
    tags: string[]
    activeTag: string | null
    onTagPress: (tag: string) => void
    colors: any
}

export default function SearchBar({ query, onQueryChange, tags, activeTag, onTagPress, colors }: Props) {
    return (
        <View>
            <View style={[styles.searchWrap, { borderBottomColor: colors.border }]}>
                <TextInput
                    style={[styles.input, { color: colors.fg, fontFamily: colors.mono }]}
                    placeholder="search..."
                    placeholderTextColor={colors.muted}
                    value={query}
                    onChangeText={onQueryChange}
                    autoCorrect={false}
                    autoCapitalize="none"
                />
            </View>
            {tags.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.tagRow, { borderBottomColor: colors.border }]} contentContainerStyle={{ paddingHorizontal: 12, gap: 6 }}>
                    <TouchableOpacity
                        style={[styles.tagBtn, { borderColor: !activeTag ? colors.fg : colors.muted }]}
                        onPress={() => onTagPress('')}
                    >
                        <Text style={[styles.tagText, { color: !activeTag ? colors.fg : colors.muted, fontFamily: colors.mono }]}>all</Text>
                    </TouchableOpacity>
                    {tags.map(tag => (
                        <TouchableOpacity
                            key={tag}
                            style={[styles.tagBtn, { borderColor: activeTag === tag ? colors.fg : colors.muted }]}
                            onPress={() => onTagPress(tag)}
                        >
                            <Text style={[styles.tagText, { color: activeTag === tag ? colors.fg : colors.muted, fontFamily: colors.mono }]}>{tag}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    searchWrap: { paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1 },
    input: { fontSize: 13, paddingVertical: 4 },
    tagRow: { borderBottomWidth: 1, paddingVertical: 8 },
    tagBtn: { paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1 },
    tagText: { fontSize: 10, letterSpacing: 1 },
})