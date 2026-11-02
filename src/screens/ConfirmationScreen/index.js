import {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, BackHandler, Image} from 'react-native';
import {router, Stack, useFocusEffect, useLocalSearchParams} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from 'styled-components/native';
import ActionButton from '../../components/ActionButton';
import {getOrder} from '../../services/orderService';
import {imageUrl} from '../../services/movieService';
import {
    Root,
    Body,
    Intro,
    Icon,
    Check,
    Title,
    Subtitle,
    Card,
    CardHeader,
    Confirmed,
    Count,
    MovieRow,
    Poster,
    MovieInfo,
    MovieTitle,
    Detail,
    Separator,
    InfoRow,
    Label,
    Value,
    Total,
    Notice,
    Message,
    Hint,
    Footer,
    Center
} from './styles';

/** @param {string} value */
function formatDate(value) {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const weekday = new Intl.DateTimeFormat('pt-BR', {weekday: 'short'}).format(date).replace('.', '');
    const monthName = new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(date).replace('.', '');
    return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${day} ${monthName}.`;
}

export default function ConfirmationScreen() {
    const params = useLocalSearchParams();
    const id = typeof params.id === 'string' ? params.id : '';
    const [order, setOrder] = useState(/** @type {import('../../services/orderService').Order | null} */ (null));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const [imageFailed, setImageFailed] = useState(false);
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const goHome = useCallback(() => router.dismissTo('/home'), []);
    useFocusEffect(useCallback(() => {
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            goHome();
            return true;
        });
        return () => subscription.remove();
    }, [goHome]));
    useEffect(() => {
        let active = true;
        getOrder(id).then((result) => {
            if (!active) return;
            if (!result) throw new Error('Pedido não encontrado');
            setOrder(result);
        }).catch(() => {
            if (active) setError(true);
        }).finally(() => {
            if (active) setLoading(false);
        });
        return () => {
            active = false;
        };
    }, [id, attempt]);

    const poster = order && imageUrl(order.posterPath, 'w342');
    const types = order && [order.full ? `${order.full} inteira${order.full === 1 ? '' : 's'}` : '', order.half ? `${order.half} meia${order.half === 1 ? '' : 's'}` : ''].filter(Boolean).join(' • ');
    return <Root contentContainerStyle={{
        flexGrow: 1, paddingTop: Math.max(insets.top, 24) + 24, paddingBottom: Math.max(insets.bottom, 24) + 16
    }}>
        <Stack.Screen options={{gestureEnabled: false}}/><Body>
        {loading ? <Center><ActivityIndicator size="large" color={theme.colors.primary}/></Center> : error || !order ?
            <Center><Subtitle>Não foi possível carregar os detalhes do pedido.</Subtitle><ActionButton
                label="Tentar novamente" onPress={() => {
                setLoading(true);
                setError(false);
                setAttempt((value) => value + 1);
            }}/><ActionButton label="Voltar para a Home" onPress={goHome}/></Center> : <>
                <Intro><Icon><Check>✓</Check></Icon><Title>Compra confirmada!</Title><Subtitle>Seu ingresso está
                    garantido. Confira os detalhes da sessão.</Subtitle></Intro>
                <Card><CardHeader><Confirmed>INGRESSO •
                    CONFIRMADO</Confirmed><Count>{order.seats.length} {order.seats.length === 1 ? 'INGRESSO' : 'INGRESSOS'}</Count></CardHeader>
                    <MovieRow><Poster>{poster && !imageFailed &&
                        <Image source={{uri: poster}} style={{width: '100%', height: '100%'}} resizeMode="cover"
                               onError={() => setImageFailed(true)}/>}</Poster><MovieInfo><MovieTitle>{order.title}</MovieTitle><Detail>{formatDate(order.session.date)} • {order.session.time}</Detail><Detail>{order.session.format} •
                        Sala {order.session.room}</Detail></MovieInfo></MovieRow>
                    <Separator/><InfoRow><Label>Assentos</Label><Value>{order.seats.join(', ')}</Value></InfoRow><InfoRow><Label>Tipo</Label><Value>{types}</Value></InfoRow><Separator/><InfoRow><Value>Total
                        pago</Value><Total>R$ {order.total.toFixed(2).replace('.', ',')}</Total></InfoRow>
                </Card>
                <Notice><Message>Seus ingressos ficam disponíveis na sua conta.</Message><Hint>Apresente-os na entrada
                    do
                    cinema.</Hint></Notice>
                <Footer><ActionButton large label="Voltar para a Home" onPress={goHome}/></Footer>
            </>}
    </Body></Root>;
}


