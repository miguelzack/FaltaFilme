import {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Image} from 'react-native';
import {router, useLocalSearchParams} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from 'styled-components/native';
import HomeLogo from '../../assets/icons/HomeLogo';
import PosterGlow from '../../assets/icons/PosterGlow';
import ActionButton from '../../components/ActionButton';
import BackButton from '../../components/BackButton';
import BottomNavigation from '../../components/BottomNavigation';
import {getMovieDetails, imageUrl} from '../../services/movieService';
import {
    Actions,
    Body,
    Center,
    Content,
    CreditLabel,
    CreditText,
    Header,
    Heading,
    InfoBox,
    InfoLabel,
    InfoRow,
    InfoValue,
    LogoFrame,
    LogoScale,
    Overview,
    Poster,
    PosterArea,
    PosterFallback,
    PosterGlowFrame,
    PosterShadow,
    Rating,
    RatingStar,
    Root,
    Scroll,
    SectionTitle,
    Title,
    TitleRow
} from './styles';

/** @param {{label: string, value: string, weight: number}} props */
function MovieFact({label, value, weight}) {
    return <InfoBox style={{flex: weight}}><InfoLabel numberOfLines={1}
                                                      adjustsFontSizeToFit>{label}</InfoLabel><InfoValue>{value}</InfoValue></InfoBox>;
}

export default function MovieDetailsScreen() {
    const {id} = useLocalSearchParams();
    const movieId = typeof id === 'string' ? id : '';
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const [movie, setMovie] = useState(/** @type {any} */ (null));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const [imageFailed, setImageFailed] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        getMovieDetails(movieId, controller.signal).then((result) => {
            if (!controller.signal.aborted) setMovie(result);
        }).catch(() => {
            if (!controller.signal.aborted) setError(true);
        }).finally(() => {
            if (!controller.signal.aborted) setLoading(false);
        });
        return () => controller.abort();
    }, [movieId, attempt]);

    const goBack = useCallback(() => router.canGoBack() ? router.back() : router.replace('/home'), []);
    const poster = movie && imageUrl(movie.poster_path, 'w342');
    const cast = movie?.credits?.cast?.slice(0, 3).map((/** @type {{name: string}} */ person) => person.name).join('  •  ');
    const directors = movie?.credits?.crew?.filter((/** @type {{job: string}} */ person) => person.job === 'Director').map((/** @type {{name: string}} */ person) => person.name).join('  •  ');
    const brazil = movie?.release_dates?.results?.find((/** @type {{iso_3166_1: string}} */ country) => country.iso_3166_1 === 'BR');
    const certificate = brazil?.release_dates?.find((/** @type {{certification: string}} */ release) => release.certification)?.certification;
    const classification = certificate === 'L' ? 'Livre' : certificate ? `${certificate} anos` : 'Não informada';
    const genres = movie?.genres?.slice(0, 2).map((/** @type {{name: string}} */ genre) => genre.name).join(' / ');

    return <Root>
        <Content><Scroll contentContainerStyle={{
            paddingTop: Math.max(insets.top, 24) + 8, paddingBottom: !loading && !error && movie ? 72 : 0
        }}>
            <Body>
                <Header><BackButton onPress={goBack}/><LogoFrame><LogoScale><HomeLogo/></LogoScale></LogoFrame></Header>
                {loading ? <Center><ActivityIndicator size="large" color={theme.colors.primary}/><Overview>Carregando
                    filme...</Overview></Center> : error ?
                    <Center><Overview>Não foi possível carregar os detalhes do filme.</Overview><ActionButton
                        label="Tentar novamente" darkText onPress={() => {
                        setLoading(true);
                        setError(false);
                        setAttempt((value) => value + 1);
                    }}/></Center> : movie && <>
                    <PosterArea><PosterGlowFrame pointerEvents="none"><PosterGlow/></PosterGlowFrame><PosterShadow
                        style={{boxShadow: '0px 4px 24px rgba(8, 209, 173, 0.22), 0px 22px 34px rgba(3, 5, 20, 0.78)'}}><Poster>{poster && !imageFailed ?
                        <Image source={{uri: poster}} style={{width: '100%', height: '100%'}} resizeMode="cover"
                               onError={() => setImageFailed(true)}/> :
                        <PosterFallback>Imagem indisponível</PosterFallback>}</Poster></PosterShadow></PosterArea>
                    <TitleRow><Title>{movie.title}</Title><Rating><RatingStar>★</RatingStar> {movie.vote_average > 0 ? (movie.vote_average / 2).toFixed(1).replace('.', ',') : '—'}
                    </Rating></TitleRow>
                    <InfoRow><MovieFact label="ANO" weight={56}
                                        value={movie.release_date?.slice(0, 4) || '—'}/><MovieFact
                        label="DURAÇÃO" weight={70} value={movie.runtime ? `${movie.runtime} min` : '—'}/><MovieFact
                        label="GÊNERO" weight={98} value={genres || 'Não informado'}/><MovieFact label="CLASSIFICAÇÃO"
                                                                                                 weight={98}
                                                                                                 value={classification}/></InfoRow>
                    <Heading><SectionTitle>Sobre o
                        filme</SectionTitle><Overview>{movie.overview || 'Sinopse indisponível.'}</Overview></Heading>
                    <Heading><SectionTitle>Elenco e
                        direção</SectionTitle><CreditLabel>ELENCO</CreditLabel><CreditText>{cast || 'Não informado'}</CreditText><CreditLabel>DIREÇÃO</CreditLabel><CreditText>{directors || 'Não informada'}</CreditText></Heading>
                </>}
            </Body>
        </Scroll>
            {!loading && !error && movie &&
                <Actions pointerEvents="box-none"><ActionButton label="Comprar ingresso" purchase
                                                                onPress={() => router.push({
                                                                    pathname: '/sessao/[id]', params: {id: movieId}
                                                                })}/></Actions>}
        </Content>
        <BottomNavigation onHomePress={() => router.replace('/home')}/>
    </Root>;
}
