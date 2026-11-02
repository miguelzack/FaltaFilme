import {useEffect} from 'react';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import {NavigationBar} from 'expo-navigation-bar';
import {useFonts} from 'expo-font';
import {Montserrat_400Regular} from '@expo-google-fonts/montserrat/400Regular';
import {Montserrat_500Medium} from '@expo-google-fonts/montserrat/500Medium';
import {Montserrat_600SemiBold} from '@expo-google-fonts/montserrat/600SemiBold';
import {ThemeProvider} from 'styled-components/native';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import theme from '../theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold});

    useEffect(() => {
        if (loaded || error) SplashScreen.hideAsync();
    }, [loaded, error]);

    if (!loaded && !error) return null;

    return (<KeyboardProvider statusBarTranslucent><ThemeProvider theme={theme}>
        <StatusBar style="light"/>
        <NavigationBar hidden/>
        <Stack screenOptions={{headerShown: false, contentStyle: {backgroundColor: theme.colors.background}}}/>
    </ThemeProvider></KeyboardProvider>);
}
