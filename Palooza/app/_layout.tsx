import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect, useState, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import PlayerContextProvider, { PlayerContext, usePlayerContext } from '../components/DataContext';
import { DropdownSchema } from '../components/DropdownComponent';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

interface NamesData {
  data: Array<DropdownSchema>
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }


  return (
    <PaperProvider>
      <PlayerContextProvider>
        <RootLayoutNav />
      </PlayerContextProvider>
    </PaperProvider>
);
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  const playerContext = useContext(PlayerContext);
  const myPlayerDataSet = playerContext['setPlayerData'];

  useEffect(() => {
    getNames()
    .then(data => {
      myPlayerDataSet(data);
    });
  }, [])

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}

async function getNames() {
  const names = await getNamesJson('http://127.0.0.1:5000/record-match/get-player-data')
  console.log("getNames:", names);
  return names;
  // TODO use [(id, name)] instead of [name]
}

async function getNamesJson(url: string): Promise<NamesData> {
  return fetch(url)
  .then(response => {
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    return response.json() as Promise<NamesData>
  })
}