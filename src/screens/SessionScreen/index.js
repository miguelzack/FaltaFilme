import {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Alert, AppState, Image} from 'react-native';
import {router, useLocalSearchParams} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from 'styled-components/native';
import ActionButton from '../../components/ActionButton';
import BackButton from '../../components/BackButton';
import {getMovieDetails, imageUrl} from '../../services/movieService';
import {
    availableSessionDates,
    availableSessions,
    getCinemaSessions,
    getSelectedSession,
    selectCinemaSession,
    localSessionDate
} from '../../services/sessionService';
import {
    Body,
    Center,
    DateButton,
    DateDay,
    DateRow,
    DateWeekday,
    Header,
    MovieCard,
    MovieInfo,
    MoviePoster,
    MovieRuntime,
    MovieTitle,
    MonthTitle,
    Root,
    Scroll,
    SectionHeading,
    SessionButton,
    SessionDescription,
    SessionList,
    SessionTime,
    Step,
    Subtitle,
    Title
} from './styles';

/** @param {string} value */
function dateFromLocalString(value) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/** @param {number | null | undefined} minutes */
function formatRuntime(minutes) {
    if (!minutes) return 'Duração não informada';
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return hours ? `${hours}h${remainder ? ` ${remainder}min` : ''}` : `${remainder}min`;
}

export default function SessionScreen() {
    const {id} = useLocalSearchParams();
    const movieId = typeof id === 'string' ? id : '';
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const [now, setNow] = useState(() => new Date());
    const dates = availableSessionDates(now);
    const [date, setDate] = useState(() => availableSessionDates(new Date())[0]);
    const [movie, setMovie] = useState(/** @type {{title: string, poster_path: string | null, runtime: number | null} | null} */ (null));
    const [sessions, setSessions] = useState(/** @type {import('../../services/sessionService').CinemaSession[]} */ ([]));
    const [selected, setSelected] = useState(/** @type {string | null} */ (null));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [saving, setSaving] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        function updateClock() {
            const current = new Date();
            setNow(current);
            const currentDates = availableSessionDates(current);
            setDate((previous) => {
                if (currentDates.includes(previous)) return previous;
                return currentDates[0];
            });
        }

        const timer = setInterval(updateClock, 30000);
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') updateClock();
        });
        return () => {
            clearInterval(timer);
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        Promise.all([getMovieDetails(movieId, controller.signal), getCinemaSessions(movieId, date), getSelectedSession(movieId, date)])
            .then(([details, available, selectedId]) => {
                if (controller.signal.aborted) return;
                setMovie(details);
                setSessions(available);
                setSelected(available.some((session) => session.id === selectedId) ? selectedId : null);
            }).catch(() => {
            if (!controller.signal.aborted) setError(true);
        }).finally(() => {
            if (!controller.signal.aborted) setLoading(false);
        });
        return () => controller.abort();
    }, [movieId, date, attempt]);

    const goBack = useCallback(() => router.canGoBack() ? router.back() : router.replace('/home'), []);
    const dateValue = dateFromLocalString(date);
    const poster = movie && imageUrl(movie.poster_path, 'w342');
    const visibleSessions = availableSessions(sessions, now);

    async function handleContinue() {
        if (saving) return;
        const session = availableSessions(sessions, new Date()).find((item) => item.id === selected);
        if (!session) {
            Alert.alert('Escolha uma sessão', 'Selecione um horário para continuar.');
            return;
        }
        setSaving(true);
        try {
            await selectCinemaSession(session);
            router.push({pathname: '/assentos/[id]', params: {id: movieId, date: session.date, sessionId: session.id}});
        } catch {
            Alert.alert('Não foi possível continuar', 'Tente novamente para salvar sua escolha.');
        } finally {
            setSaving(false);
        }
    }

    return <Root><Scroll contentContainerStyle={{
        flexGrow: 1, paddingTop: Math.max(insets.top, 24) + 8, paddingBottom: Math.max(insets.bottom, 24)
    }}>
        <Body>
            <Header><BackButton onPress={goBack}/><Step>ETAPA 1 DE 4</Step></Header>
            <Title>Escolha a data</Title><Subtitle>Veja os horários disponíveis para o filme.</Subtitle>
            {loading ? <Center><ActivityIndicator size="large" color={theme.colors.primary}/><Subtitle>Carregando
                sessões...</Subtitle></Center> : error ?
                <Center><Subtitle>Não foi possível carregar as sessões. Tente novamente.</Subtitle><ActionButton
                    label="Tentar novamente" onPress={() => {
                    setError(false);
                    setLoading(true);
                    setAttempt((value) => value + 1);
                }}/></Center> : movie && <>
                <MovieCard><MoviePoster>{poster && !imageFailed &&
                    <Image source={{uri: poster}} style={{width: '100%', height: '100%'}} resizeMode="cover"
                           onError={() => setImageFailed(true)}/>}</MoviePoster><MovieInfo><MovieTitle>{movie.title}</MovieTitle><MovieRuntime>{formatRuntime(movie.runtime)}</MovieRuntime></MovieInfo></MovieCard>
                <MonthTitle>Datas disponíveis</MonthTitle>
                <DateRow>{dates.map((day) => {
                    const dayValue = dateFromLocalString(day);
                    const weekday = new Intl.DateTimeFormat('pt-BR', {weekday: 'short'}).format(dayValue).replace('.', '').slice(0, 3).toUpperCase();
                    const active = day === date;
                    return <DateButton key={day} accessibilityRole="button"
                                       accessibilityLabel={`Sessões em ${dayValue.toLocaleDateString('pt-BR')}`}
                                       accessibilityState={{selected: active}} onPress={() => {
                        if (!active && !saving) {
                            setLoading(true);
                            setError(false);
                            setSelected(null);
                            setDate(day);
                        }
                    }} style={{backgroundColor: active ? theme.colors.primary : '#252836'}}><DateWeekday
                        style={{color: active ? '#1F212E' : '#ADB5C7'}}>{weekday}</DateWeekday><DateDay
                        style={{color: active ? '#1F212E' : '#F2F5FA'}}>{`${String(dayValue.getDate()).padStart(2, '0')}/${String(dayValue.getMonth() + 1).padStart(2, '0')}`}</DateDay></DateButton>;
                })}</DateRow>
                <SectionHeading>{date === localSessionDate(now, 0) ? 'Sessões de hoje' : date === localSessionDate(now, 1) ? 'Sessões de amanhã' : `Sessões de ${dateValue.toLocaleDateString('pt-BR')}`}</SectionHeading>
                <SessionList>{visibleSessions.length === 0 ? <Subtitle>Não há mais sessões disponíveis para esta
                    data.</Subtitle> : visibleSessions.map((session) => <SessionButton key={session.id}
                                                                                       accessibilityRole="button"
                                                                                       accessibilityLabel={`${session.time}, ${session.format}, sala ${session.room}`}
                                                                                       accessibilityState={{selected: selected === session.id}}
                                                                                       onPress={() => setSelected(session.id)}
                                                                                       style={{borderColor: selected === session.id ? '#12CDD9' : 'transparent'}}><SessionTime>{session.time}</SessionTime><SessionDescription>{session.format} •
                    Sala {session.room}</SessionDescription></SessionButton>)}</SessionList>
                <ActionButton large label={saving ? 'Aguarde...' : 'Continuar'} onPress={handleContinue}/>
            </>}
        </Body>
    </Scroll></Root>;
}
