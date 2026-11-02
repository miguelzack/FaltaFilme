import {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Image, Keyboard} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {router, useLocalSearchParams} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from 'styled-components/native';
import ActionButton from '../../components/ActionButton';
import BackButton from '../../components/BackButton';
import {getMovieDetails, imageUrl} from '../../services/movieService';
import {availableSessions, getCinemaSessions, getSelectedSession} from '../../services/sessionService';
import {occupiedSeats} from '../../services/seatService';
import {createOrder} from '../../services/orderService';
import {Body, Header, Step, Title, Subtitle, Poster, Center} from '../SeatScreen/styles';
import {
    OrderCard,
    OrderInfo,
    OrderTitle,
    OrderDetail,
    SectionTitle,
    Method,
    Marker,
    MethodText,
    Field,
    FieldLabel,
    Input,
    FieldRow,
    Note,
    TotalRow,
    TotalLabel,
    TotalValue,
    Footer
} from './styles';

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

export default function PaymentScreen() {
    const params = useLocalSearchParams();
    const movieId = typeof params.id === 'string' ? params.id : '';
    const date = typeof params.date === 'string' ? params.date : '';
    const sessionId = typeof params.sessionId === 'string' ? params.sessionId : '';
    const seatsValue = typeof params.seats === 'string' ? params.seats : '';
    const seats = seatsValue ? seatsValue.split(',') : [];
    const fullValue = typeof params.full === 'string' ? params.full : '';
    const halfValue = typeof params.half === 'string' ? params.half : '';
    const full = Number(fullValue), half = Number(halfValue);
    const validSelection = /^\d+$/.test(fullValue) && /^\d+$/.test(halfValue) && seats.length > 0 && seats.length <= 48 && full + half === seats.length && new Set(seats).size === seats.length && seats.every((seat) => /^[A-F][1-8]$/.test(seat) && !occupiedSeats.includes(seat));
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const [movie, setMovie] = useState(/** @type {{title: string, poster_path: string | null} | null} */ (null));
    const [session, setSession] = useState(/** @type {import('../../services/sessionService').CinemaSession | null} */ (null));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const [imageFailed, setImageFailed] = useState(false);
    const [number, setNumber] = useState('');
    const [name, setName] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [notice, setNotice] = useState('');
    const [saving, setSaving] = useState(false);
    const savingRef = useRef(false);

    useEffect(() => {
        const controller = new AbortController();
        Promise.resolve().then(() => {
            if (!/^\d+$/.test(movieId) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !sessionId || !validSelection) throw new Error('Seleção inválida');
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
    }, [movieId, date, sessionId, validSelection, attempt]);

    function goBack() {
        if (router.canGoBack()) router.back(); else router.replace('/home');
    }

    async function pay() {
        if (savingRef.current) return;
        Keyboard.dismiss();
        if (!session || !availableSessions([session]).length) {
            setNotice('Esta sessão não está mais disponível.');
            return;
        }
        if (number.length < 13 || !name.trim() || expiry.length !== 4 || Number(expiry.slice(0, 2)) < 1 || Number(expiry.slice(0, 2)) > 12 || cvv.length < 3) {
            setNotice('Confira os dados do cartão para continuar.');
            return;
        }
        if (!movie) return;
        savingRef.current = true;
        setSaving(true);
        try {
            const order = await createOrder({
                movieId, title: movie.title, posterPath: movie.poster_path, session, seats, full, half
            });
            setNumber('');
            setName('');
            setExpiry('');
            setCvv('');
            router.replace({pathname: '/confirmacao/[id]', params: {id: order.id}});
        } catch (error) {
            setNotice(error instanceof Error && error.message === 'Assento indisponível' ? 'Um dos assentos não está mais disponível. Volte e escolha outro.' : 'Não foi possível concluir o pedido. Confira a sessão e tente novamente.');
            savingRef.current = false;
            setSaving(false);
        }
    }

    const total = full * 20 + half * 10;
    const poster = movie && imageUrl(movie.poster_path, 'w342');
    const ticketDescription = [full ? `${full} inteira${full === 1 ? '' : 's'}` : '', half ? `${half} meia${half === 1 ? '' : 's'}` : ''].filter(Boolean).join(' • ');
    const shownNumber = number.replace(/(\d{4})(?=\d)/g, '$1 ');
    const shownExpiry = expiry.length > 2 ? `${expiry.slice(0, 2)}/${expiry.slice(2)}` : expiry;
    return <KeyboardAwareScrollView style={{flex: 1, backgroundColor: theme.colors.surface}} bottomOffset={24}
                                    keyboardShouldPersistTaps="handled" contentContainerStyle={{
        flexGrow: 1, paddingTop: Math.max(insets.top, 24) + 8, paddingBottom: Math.max(insets.bottom, 24)
    }}><Body>
        <Header><BackButton onPress={goBack}/><Step>ETAPA 4 DE 4</Step></Header>
        <Title>Efetuar pagamento</Title><Subtitle>Pague com cartão.</Subtitle>
        {loading ? <Center><ActivityIndicator size="large" color={theme.colors.primary}/><Subtitle>Carregando
            pedido...</Subtitle></Center> : error ?
            <Center><Subtitle>Não foi possível carregar o pedido. Volte e confira sua seleção ou tente
                novamente.</Subtitle><ActionButton label="Tentar novamente" onPress={() => {
                setError(false);
                setLoading(true);
                setAttempt((value) => value + 1);
            }}/></Center> : movie && session && <>
            <OrderCard><Poster>{poster && !imageFailed &&
                <Image source={{uri: poster}} style={{width: '100%', height: '100%'}} resizeMode="cover"
                       onError={() => setImageFailed(true)}/>}</Poster><OrderInfo><OrderTitle
                numberOfLines={2}>{movie.title}</OrderTitle><OrderDetail>{formatDate(session.date)} • {session.time} • {seats.join(', ')}</OrderDetail><OrderDetail>{ticketDescription}</OrderDetail></OrderInfo></OrderCard>
            <SectionTitle>Forma de pagamento</SectionTitle><Method accessibilityRole="radio"
                                                                   accessibilityState={{checked: true}}
                                                                   accessibilityLabel="Cartão de crédito"><Marker/><MethodText>Cartão
            de Crédito</MethodText></Method>
            <SectionTitle>Dados do cartão</SectionTitle>
            <Field><FieldLabel>Número do cartão</FieldLabel><Input accessibilityLabel="Número do cartão"
                                                                   placeholder="0000  0000  0000  0000"
                                                                   placeholderTextColor="#ADB5C7"
                                                                   keyboardType="number-pad" value={shownNumber}
                                                                   onChangeText={(value) => {
                                                                       setNumber(value.replace(/\D/g, '').slice(0, 19));
                                                                       setNotice('');
                                                                   }}/></Field>
            <Field><FieldLabel>Nome no cartão</FieldLabel><Input accessibilityLabel="Nome no cartão"
                                                                 placeholder="Como aparece no cartão"
                                                                 placeholderTextColor="#ADB5C7"
                                                                 autoCapitalize="characters" value={name}
                                                                 onChangeText={(value) => {
                                                                     setName(value);
                                                                     setNotice('');
                                                                 }}/></Field>
            <FieldRow><Field style={{flex: 1}}><FieldLabel>Validade</FieldLabel><Input accessibilityLabel="Validade"
                                                                                       placeholder="MM/AA"
                                                                                       placeholderTextColor="#ADB5C7"
                                                                                       keyboardType="number-pad"
                                                                                       value={shownExpiry}
                                                                                       onChangeText={(value) => {
                                                                                           setExpiry(value.replace(/\D/g, '').slice(0, 4));
                                                                                           setNotice('');
                                                                                       }}/></Field><Field
                style={{flex: 1}}><FieldLabel>CVV</FieldLabel><Input accessibilityLabel="CVV" placeholder="•••"
                                                                     placeholderTextColor="#ADB5C7"
                                                                     keyboardType="number-pad" secureTextEntry
                                                                     value={cvv} onChangeText={(value) => {
                setCvv(value.replace(/\D/g, '').slice(0, 4));
                setNotice('');
            }}/></Field></FieldRow>
            <Note>Confira os dados antes de continuar.</Note>
            <TotalRow><TotalLabel>Total a pagar</TotalLabel><TotalValue>{currency(total)}</TotalValue></TotalRow>
            {!!notice && <Note accessibilityLiveRegion="polite">{notice}</Note>}
            <Footer><ActionButton large label={saving ? 'Aguarde...' : `Pagar agora • ${currency(total)}`}
                                  onPress={pay}/></Footer>
        </>}
    </Body></KeyboardAwareScrollView>;
}
