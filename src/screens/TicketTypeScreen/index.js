import {useEffect, useState} from 'react';
import {ActivityIndicator, Image} from 'react-native';
import {router, useLocalSearchParams} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from 'styled-components/native';
import ActionButton from '../../components/ActionButton';
import BackButton from '../../components/BackButton';
import {getMovieDetails, imageUrl} from '../../services/movieService';
import {availableSessions, getCinemaSessions, getSelectedSession} from '../../services/sessionService';
import {occupiedSeats} from '../../services/seatService';
import {
    Root, Body, Header, Step, Title, Subtitle, MovieCard, Poster, MovieInfo, MovieTitle, MovieDetail, Center
} from '../SeatScreen/styles';
import {
    SectionTitle,
    TicketCard,
    TicketInfo,
    TicketName,
    TicketPrice,
    Counter,
    CounterButton,
    CounterText,
    Count,
    Notice,
    Summary,
    SummaryText,
    Total,
    Footer
} from './styles';

const prices = {full: 20, half: 10};

/** @param {number} value */
function currency(value) {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

/** @param {string} value */
function formatDate(value) {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const weekday = new Intl.DateTimeFormat('pt-BR', {weekday: 'short'}).format(date).replace('.', '');
    const monthName = new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(date).replace('.', '');
    return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${day} ${monthName}.`;
}

/** @param {{name: string, price: number, count: number, canAdd: boolean, onAdd: () => void, onRemove: () => void}} props */
function TicketOption({name, price, count, canAdd, onAdd, onRemove}) {
    return <TicketCard style={{borderColor: count ? '#12CDD9' : 'transparent'}}>
        <TicketInfo><TicketName>{name}</TicketName><TicketPrice>{currency(price)} por
            ingresso</TicketPrice></TicketInfo>
        <Counter><CounterButton accessibilityRole="button" accessibilityLabel={`Diminuir ${name}`}
                                accessibilityState={{disabled: count === 0}} disabled={count === 0}
                                onPress={onRemove}><CounterText
            style={{color: count ? '#12CDD9' : '#ADB5C7'}}>−</CounterText></CounterButton>
            <Count accessibilityLabel={`${count} ${name}`}>{count}</Count>
            <CounterButton accessibilityRole="button" accessibilityLabel={`Aumentar ${name}`}
                           accessibilityState={{disabled: !canAdd}} disabled={!canAdd} onPress={onAdd}><CounterText
                style={{color: canAdd ? '#12CDD9' : '#ADB5C7'}}>+</CounterText></CounterButton></Counter>
    </TicketCard>;
}

export default function TicketTypeScreen() {
    const params = useLocalSearchParams();
    const movieId = typeof params.id === 'string' ? params.id : '';
    const date = typeof params.date === 'string' ? params.date : '';
    const sessionId = typeof params.sessionId === 'string' ? params.sessionId : '';
    const seatsValue = typeof params.seats === 'string' ? params.seats : '';
    const seats = seatsValue ? seatsValue.split(',') : [];
    const validSeats = seats.length > 0 && seats.length <= 48 && new Set(seats).size === seats.length && seats.every((seat) => /^[A-F][1-8]$/.test(seat) && !occupiedSeats.includes(seat));
    const [tickets, setTickets] = useState({full: 0, half: 0});
    const {full, half} = tickets;
    const [movie, setMovie] = useState(/** @type {{title: string, poster_path: string | null} | null} */ (null));
    const [session, setSession] = useState(/** @type {import('../../services/sessionService').CinemaSession | null} */ (null));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const [imageFailed, setImageFailed] = useState(false);
    const [notice, setNotice] = useState('');
    const insets = useSafeAreaInsets();
    const theme = useTheme();

    useEffect(() => {
        const controller = new AbortController();
        Promise.resolve().then(() => {
            if (!/^\d+$/.test(movieId) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !sessionId || !validSeats) throw new Error('Seleção inválida');
            return Promise.all([getMovieDetails(movieId, controller.signal), getCinemaSessions(movieId, date), getSelectedSession(movieId, date)]);
        }).then(([details, sessions, selectedSession]) => {
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
    }, [movieId, date, sessionId, validSeats, attempt]);

    function goBack() {
        if (router.canGoBack()) router.back(); else router.replace('/home');
    }

    /** @param {'full' | 'half'} type @param {1 | -1} change */
    function changeCount(type, change) {
        setTickets((current) => {
            if ((change < 0 && current[type] === 0) || (change > 0 && current.full + current.half >= seats.length)) return current;
            return {...current, [type]: current[type] + change};
        });
        setNotice('');
    }

    function continueToPayment() {
        if (!session || !availableSessions([session]).length) {
            setNotice('Esta sessão não está mais disponível.');
            return;
        }
        if (full + half !== seats.length) {
            setNotice('Escolha um ingresso para cada assento.');
            return;
        }
        router.push({
            pathname: '/pagamento/[id]',
            params: {id: movieId, date, sessionId, seats: seatsValue, full: String(full), half: String(half)}
        });
    }

    const poster = movie && imageUrl(movie.poster_path, 'w342');
    const count = full + half;
    return <Root contentContainerStyle={{
        flexGrow: 1, paddingTop: Math.max(insets.top, 24) + 8, paddingBottom: Math.max(insets.bottom, 24)
    }}><Body>
        <Header><BackButton onPress={goBack}/><Step>ETAPA 3 DE 4</Step></Header>
        <Title>Tipo de ingresso</Title><Subtitle>Escolha uma opção para cada assento.</Subtitle>
        {loading ? <Center><ActivityIndicator size="large" color={theme.colors.primary}/><Subtitle>Carregando
            ingressos...</Subtitle></Center> : error ?
            <Center><Subtitle>Não foi possível carregar esta sessão. Volte e escolha os assentos novamente, ou tente
                novamente.</Subtitle><ActionButton label="Tentar novamente" onPress={() => {
                setError(false);
                setLoading(true);
                setAttempt((current) => current + 1);
            }}/></Center> : movie && session && <>
            <MovieCard><Poster>{poster && !imageFailed &&
                <Image source={{uri: poster}} style={{width: '100%', height: '100%'}} resizeMode="cover"
                       onError={() => setImageFailed(true)}/>}</Poster><MovieInfo><MovieTitle
                numberOfLines={2}>{movie.title}</MovieTitle><MovieDetail>{formatDate(session.date)} • {session.time} • {seats.length === 1 ? 'Assento' : 'Assentos'} {seats.join(', ')}</MovieDetail></MovieInfo></MovieCard>
            <SectionTitle>Ingressos</SectionTitle>
            <TicketOption name="Inteira" price={prices.full} count={full} canAdd={count < seats.length}
                          onAdd={() => changeCount('full', 1)} onRemove={() => changeCount('full', -1)}/>
            <TicketOption name="Meia-entrada" price={prices.half} count={half} canAdd={count < seats.length}
                          onAdd={() => changeCount('half', 1)} onRemove={() => changeCount('half', -1)}/>
            <Notice>Apresente o comprovante de meia-entrada na entrada.</Notice>
            <Summary><SummaryText>{count} {count === 1 ? 'ingresso' : 'ingressos'}</SummaryText><Total>{currency(full * prices.full + half * prices.half)}</Total></Summary>
            {!!notice && <Notice accessibilityLiveRegion="polite">{notice}</Notice>}
            <Footer><ActionButton large label="Ir para pagamento" onPress={continueToPayment}/></Footer>
        </>}
    </Body></Root>;
}
