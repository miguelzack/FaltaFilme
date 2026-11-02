import {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Alert} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from 'styled-components/native';
import {router} from 'expo-router';
import HomeLogo from '../../assets/icons/HomeLogo';
import BottomNavigation from '../../components/BottomNavigation';
import FeaturedCarousel from '../../components/FeaturedCarousel';
import MovieSection from '../../components/MovieSection';
import {getHomeMovies} from '../../services/movieService';
import {
    StatusText, Center, Content, LogoFrame, LogoScale, Retry, RetryText, Root, Scroll, Subtitle
} from './styles';

const FAMILY = [{id: 16, name: 'Animação'}, {id: 12, name: 'Aventura'}, {id: 35, name: 'Comédia'}];
const DISCOVERY = [{id: 18, name: 'Drama'}, {id: 53, name: 'Suspense'}, {id: 28, name: 'Ação'}];

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const [movies, setMovies] = useState(/** @type {{ popular: import('../../services/movieService').Movie[], family: import('../../services/movieService').Movie[], discovery: import('../../services/movieService').Movie[] } | null} */ (null));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        getHomeMovies(controller.signal)
            .then((result) => {
                if (!controller.signal.aborted) setMovies(result);
            })
            .catch(() => {
                if (!controller.signal.aborted) setError('Não foi possível carregar os filmes. Tente novamente.');
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [attempt]);

    const unavailable = useCallback((/** @type {string} */ name) => {
        if (name.toLowerCase().includes('sobre')) {
            router.replace('/about');
            return;
        }
        Alert.alert(name, 'Em breve.');
    }, []);
    const openMovie = useCallback(() => unavailable('Detalhes do filme'), [unavailable]);

    return (<Root>
        <Scroll contentContainerStyle={{paddingTop: Math.max(insets.top, 24), paddingBottom: 32}}>
            <Content>
                <LogoFrame accessibilityRole="image"
                           accessibilityLabel="FaltaFilme"><LogoScale><HomeLogo/></LogoScale></LogoFrame>
                <Subtitle>Cinema, mas FaltaFilme.</Subtitle>
                {loading ? <Center><ActivityIndicator size="large" color={theme.colors.primary}/><StatusText>Carregando
                    filmes...</StatusText></Center> : error ?
                    <Center><StatusText>{error}</StatusText><Retry accessibilityRole="button"
                                                                   onPress={() => {
                                                                       setLoading(true);
                                                                       setError('');
                                                                       setAttempt((current) => current + 1);
                                                                   }}><RetryText>Tentar
                        novamente</RetryText></Retry></Center> : movies && movies.popular.length === 0 ?
                        <Center><StatusText>Nenhum filme em cartaz no
                            momento.</StatusText></Center> : movies && <>
                        <FeaturedCarousel movies={movies.popular} onMoviePress={openMovie}/>
                        <MovieSection title="Mais populares" movies={movies.popular} onMoviePress={openMovie}/>
                        <MovieSection title="Para ver com a família" movies={movies.family} genres={FAMILY}
                                      onMoviePress={openMovie}/>
                        <MovieSection title="Descubra algo novo" movies={movies.discovery} genres={DISCOVERY}
                                      onMoviePress={openMovie}/>
                    </>}
            </Content>
        </Scroll>
        <BottomNavigation onUnavailable={unavailable}/>
    </Root>);
}