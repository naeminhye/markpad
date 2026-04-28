import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useFonts, JetBrainsMono_400Regular, JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono'
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { NotesProvider } from '../context/NotesContext'
import { ThemeProvider, useTheme } from '../context/ThemeContext'

SplashScreen.preventAutoHideAsync()

function RootLayoutInner() {
    const { resolvedTheme } = useTheme()

    return (
        <>
            <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
            <Stack screenOptions={{ headerShown: false }} />
        </>
    )
}

export default function RootLayout() {
    const [loaded] = useFonts({
        JetBrainsMono_400Regular,
        JetBrainsMono_500Medium,
    })

    useEffect(() => {
        if (loaded) SplashScreen.hideAsync()
    }, [loaded])

    if (!loaded) return null

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
                <NotesProvider>
                    <RootLayoutInner />
                </NotesProvider>
            </ThemeProvider>
        </GestureHandlerRootView>
    )
}