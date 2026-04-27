import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useFonts, JetBrainsMono_400Regular, JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono'
import * as SplashScreen from 'expo-splash-screen'
import { NotesProvider } from '../context/NotesContext'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

SplashScreen.preventAutoHideAsync()

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
            <NotesProvider>
                <StatusBar style="auto" />
                <Stack screenOptions={{ headerShown: false }} />
            </NotesProvider>
        </GestureHandlerRootView>
    )
}