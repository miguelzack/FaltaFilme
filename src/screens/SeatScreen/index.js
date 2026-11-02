import {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Alert, Image} from 'react-native';
import {router, useFocusEffect, useLocalSearchParams} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from 'styled-components/native';
import ActionButton from '../../components/ActionButton';
import BackButton from '../../components/BackButton';
import {getMovieDetails, imageUrl} from '../../services/movieService';
import {availableSessions, getCinemaSessions, getSelectedSession} from '../../services/sessionService';
import {occupiedSeats} from '../../services/seatService';
import {getOccupiedSeats} from '../../services/orderService';
import {
    Root,
    Body,
    Center,
    Header,
    Step,
    Title,
    Subtitle,
    MovieCard,
    Poster,
    MovieInfo,
    MovieTitle,
    MovieDetail,
    CinemaScreen,
    ScreenLabel,
    Map,
    Row,
    RowLabel,
    Seat,
    Legend,
    LegendItem,
    Dot,
    LegendText,
    Summary
} from './styles';

const rows = ['A', 'B', 'C', 'D', 'E', 'F'];

/** @param {string} date */
function formatDate(date) {
    const [year, month, day] = date.split('-').map(Number);
    const value = new Date(year, month - 1, day);
    const weekday = new Intl.DateTimeFormat('pt-BR', {weekday: 'short'}).format(value).replace('.', '');
    const monthName = new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(value).replace('.', '');
    return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${day} ${monthName}.`;
}

export default function SeatScreen() {
    const params = useLocalSearchParams();
    const movieId = typeof params.id === 'string' ? params.id : '';
    const date = typeof params.date === 'string' ? params.date : '';
    const sessionId = typeof params.sessionId === 'string' ? params.sessionId : '';
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const [movie, setMovie] = useState(/** @type {{title: string, poster_path: string | null} | null} */ (null));
    const [session, setSession] = useState(/** @type {import('../../services/sessionService').CinemaSession | null} */ (null));
    const [selected, setSelected] = useState(/** @type {string[]} */ ([]));
    const [unavailableSeats, setUnavailableSeats] = useState(/** @type {string[]} */ (occupiedSeats));
    const [seatsReady, setSeatsReady] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const [imageFailed, setImageFailed] = useState(false);

    useFocusEffect(useCallback(() => {
        // A new attempt also reloads occupancy while this screen remains focused.
        void attempt;
        let active = true;
        getOccupiedSeats(sessionId).then((taken) => {
            if (active) {
                setUnavailableSeats(taken);
                setSelected((current) => current.filter((seat) => !taken.includes(seat)));
                setSeatsReady(true);
            }
        }).catch(() => {
            if (active) {
                setSeatsReady(false);
                setError(true);
            }
        });
        return () => {
            active = false;
        };
    }, [sessionId, attempt]));

    useEffect(() => {
        const controller = new AbortController();
        Promise.resolve().then(() => {
            if (!/^\d+$/.test(movieId) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !sessionId) throw new Error('Sessão inválida');
            return Promise.all([getMovieDetails(movieId, controller.signal), getCinemaSessions(movieId, date), getSelectedSession(movieId, date)]);
        })
            .then(([details, sessions, selectedSession]) => {
                if (controller.signal.aborted) return;
                const found = availableSessions(sessions).find((item) => item.id === sessionId && item.id === selectedSession);
                if (!found) throw new Error('Sessão indisponível');
                setMovie(details);
                setSession(found);
            }).catch(() => {
            if (!controller.signal.aborted) setError(true);
        })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [movieId, date, sessionId, attempt]);

    function goBack() {
        if (router.canGoBack()) router.back(); else router.replace('/home');
    }

    /** @param {string} seat */
    function toggleSeat(seat) {
        setSelected((current) => current.includes(seat) ? current.filter((item) => item !== seat) : [...current, seat].sort());
    }

    function handleContinue() {
        if (!seatsReady) return;
        if (!selected.length) {
            Alert.alert('Escolha seu assento', 'Selecione pelo menos um assento para continuar.');
            return;
        }
        if (!session || !availableSessions([session]).length) {
            Alert.alert('Sessão indisponível', 'Escolha outra sessão para continuar.');
            return;
        }
        router.push({pathname: '/ingressos/[id]', params: {id: movieId, date, sessionId, seats: selected.join(',')}});
    }

    const poster = movie && imageUrl(movie.poster_path, 'w342');
    const summary = selected.length ? `${selected.length} ${selected.length === 1 ? 'assento' : 'assentos'} • ${selected.join(', ')}` : 'Nenhum assento selecionado';

    return <Root contentContainerStyle={{
        flexGrow: 1, paddingTop: Math.max(insets.top, 24) + 8, paddingBottom: Math.max(insets.bottom, 24)
    }}><Body>
        <Header><BackButton onPress={goBack}/><Step>ETAPA 2 DE 4</Step></Header>
        <Title>Escolha seu assento</Title><Subtitle>Selecione um ou mais assentos disponíveis.</Subtitle>
        {loading ? <Center><ActivityIndicator size="large" color={theme.colors.primary}/><Subtitle>Carregando
            assentos...</Subtitle></Center> : error ?
            <Center><Subtitle>Não foi possível carregar esta sessão. Volte e escolha uma sessão disponível, ou tente
                novamente.</Subtitle><ActionButton label="Tentar novamente" onPress={() => {
                setError(false);
                setLoading(true);
                setAttempt((value) => value + 1);
            }}/></Center> : movie && session && <>
            <MovieCard><Poster>{poster && !imageFailed &&
                <Image source={{uri: poster}} style={{width: '100%', height: '100%'}} resizeMode="cover"
                       onError={() => setImageFailed(true)}/>}</Poster><MovieInfo><MovieTitle
                numberOfLines={2}>{movie.title}</MovieTitle><MovieDetail>{formatDate(session.date)} • {session.time} • {session.format}</MovieDetail></MovieInfo></MovieCard>
            <CinemaScreen><ScreenLabel>TELA</ScreenLabel></CinemaScreen>
            <Map>{rows.map((row) => <Row key={row}><RowLabel>{row}</RowLabel>{Array.from({length: 8}, (_, index) => {
                const seat = `${row}${index + 1}`;
                const occupied = unavailableSeats.includes(seat);
                const active = selected.includes(seat);
                return <Seat key={seat} disabled={occupied || !seatsReady} accessibilityRole="button"
                             accessibilityLabel={`Assento ${seat}, ${occupied ? 'ocupado' : active ? 'selecionado' : 'livre'}`}
                             accessibilityState={{disabled: occupied, selected: active}}
                             onPress={() => toggleSeat(seat)} style={{
                    backgroundColor: occupied ? '#454A5C' : active ? '#12D9A9' : '#2E3042',
                    borderColor: !occupied && !active ? '#4D5266' : 'transparent'
                }}/>;
            })}</Row>)}</Map>
            <Legend>{[['Livre', '#2E3042'], ['Selecionado', '#12D9A9'], ['Ocupado', '#454A5C']].map(([label, color]) =>
                <LegendItem key={label}><Dot style={{
                    backgroundColor: color, borderColor: label === 'Livre' ? '#4D5266' : color
                }}/><LegendText>{label}</LegendText></LegendItem>)}</Legend>
            <Summary>{summary}</Summary><ActionButton large label="Escolher ingressos"
                                                      onPress={handleContinue}/>
        </>}
    </Body></Root>;
}
