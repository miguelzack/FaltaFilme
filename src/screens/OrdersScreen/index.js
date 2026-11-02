import {useCallback, useState} from 'react';
import {ActivityIndicator, FlatList, Image} from 'react-native';
import {useFocusEffect} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from 'styled-components/native';
import BottomNavigation from '../../components/BottomNavigation';
import {getCurrentUserOrders} from '../../services/orderService';
import {imageUrl} from '../../services/movieService';
import {
    Root,
    Header,
    Title,
    Subtitle,
    SectionRow,
    SectionTitle,
    Count,
    Card,
    CardHeader,
    Status,
    TicketCount,
    MovieRow,
    Poster,
    MovieInfo,
    MovieTitle,
    DateText,
    SessionText,
    Separator,
    InfoRow,
    Label,
    Value,
    Total,
    Center,
    Retry,
    RetryText
} from './styles';

/** @param {string} value */
function sessionDate(value) {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const weekday = new Intl.DateTimeFormat('pt-BR', {weekday: 'short'}).format(date).replace('.', '');
    const monthName = new Intl.DateTimeFormat('pt-BR', {month: 'short'}).format(date).replace('.', '');
    return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}., ${day} ${monthName}.`;
}

/** @param {{order: import('../../services/orderService').Order}} props */
function OrderCard({order}) {
    const [imageFailed, setImageFailed] = useState(false);
    const poster = imageUrl(order.posterPath, 'w342');
    const types = [order.full ? `${order.full} inteira${order.full === 1 ? '' : 's'}` : '', order.half ? `${order.half} meia${order.half === 1 ? '' : 's'}` : ''].filter(Boolean).join(' • ');
    return <Card><CardHeader><Status>COMPRA
        CONCLUÍDA</Status><TicketCount>{order.seats.length} {order.seats.length === 1 ? 'INGRESSO' : 'INGRESSOS'}</TicketCount></CardHeader>
        <MovieRow><Poster>{poster && !imageFailed &&
            <Image source={{uri: poster}} style={{width: '100%', height: '100%'}} resizeMode="cover"
                   onError={() => setImageFailed(true)}/>}</Poster>
            <MovieInfo><MovieTitle>{order.title}</MovieTitle><DateText>{sessionDate(order.session.date)} • {order.session.time}</DateText><SessionText>CineFalta
                • Sala {order.session.room} • {order.session.format}</SessionText></MovieInfo></MovieRow>
        <Separator/><InfoRow><Label>Ingressos</Label><Value>{types}</Value></InfoRow><InfoRow><Label>Poltronas</Label><Value>{order.seats.join(', ')}</Value></InfoRow><Separator/>
        <InfoRow><Label>Total pago</Label><Total>R$ {order.total.toFixed(2).replace('.', ',')}</Total></InfoRow>
    </Card>;
}

export default function OrdersScreen() {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const [orders, setOrders] = useState(/** @type {import('../../services/orderService').Order[]} */ ([]));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [attempt, setAttempt] = useState(0);
    useFocusEffect(useCallback(() => {
        let active = true;
        getCurrentUserOrders().then((result) => {
            if (active) {
                setOrders(result);
                setError(false);
            }
        })
            .catch(() => {
                if (active) {
                    setOrders([]);
                    setError(true);
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
        // Re-run the focused load when the user retries.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attempt]));
    return <Root><FlatList data={loading || error ? [] : orders} keyExtractor={(item) => item.id}
                           contentContainerStyle={{
                               paddingHorizontal: 24,
                               paddingTop: Math.max(insets.top, 24) + 8,
                               paddingBottom: 24,
                               flexGrow: 1
                           }}
                           renderItem={({item}) => <OrderCard order={item}/>}
                           ListHeaderComponent={<><Header><Title>Histórico de compras</Title><Subtitle>Pedidos e
                               pagamentos concluídos</Subtitle></Header>
                               {!loading && !error && <SectionRow><SectionTitle>Compras
                                   recentes</SectionTitle><Count>{orders.length} {orders.length === 1 ? 'compra' : 'compras'}</Count></SectionRow>}</>}
                           ListEmptyComponent={loading ?
                               <Center><ActivityIndicator size="large" color={theme.colors.primary}/></Center> : error ?
                                   <Center><Subtitle>Não foi possível carregar suas compras.</Subtitle><Retry
                                       accessibilityRole="button" onPress={() => {
                                       setLoading(true);
                                       setAttempt((value) => value + 1);
                                   }}><RetryText>Tentar novamente</RetryText></Retry></Center> :
                                   <Center><Subtitle>Você ainda não realizou compras.</Subtitle></Center>}/>
        <BottomNavigation active="tickets"/></Root>;
}

