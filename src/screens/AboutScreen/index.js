import {useCallback} from 'react';
import {Alert} from 'react-native';
import {router} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import BottomNavigation from '../../components/BottomNavigation';
import CinemaMap from '../../components/CinemaMap';
import {
    Card,
    Content,
    Header,
    HeaderSubtitle,
    HeaderTitle,
    Root,
    Scroll,
    CardAddress,
    CardHint,
    CardTitle,
    LogoutButton,
    LogoutText,
    Section,
    SectionText,
    SectionTitle
} from './styles';

const CINEMA = {
    title: 'SENAI Suíço-Brasileira',
    address: 'Rua Bento Branco de Andrade Filho, 379 - Santo Amaro, São Paulo/SP - CEP 04757-000',
    latitude: -23.64783,
    longitude: -46.722377,
};

export default function AboutScreen() {
    const insets = useSafeAreaInsets();

    const unavailable = useCallback((/** @type {string} */ name) => {
        const label = name.toLowerCase();
        if (label.includes('sobre')) return;
        if (label.includes('início') || label.includes('inicio') || label.includes('home')) {
            router.replace('/home');
            return;
        }
        Alert.alert(name, 'Em breve.');
    }, []);

    return (<Root>
        <Scroll contentContainerStyle={{paddingTop: Math.max(insets.top, 24), paddingBottom: 32}}>
            <Content>
                <Header>
                    <HeaderTitle>Sobre nós</HeaderTitle>
                    <HeaderSubtitle>Conheça o cinema FaltaFilme</HeaderSubtitle>
                </Header>

                <Card>
                    <CardTitle>Localização</CardTitle>
                    <CardAddress>{CINEMA.address}</CardAddress>
                    <CardHint>Veja como chegar ao nosso cinema.</CardHint>
                    <CinemaMap latitude={CINEMA.latitude} longitude={CINEMA.longitude} title={CINEMA.title}
                               address={CINEMA.address}/>
                </Card>

                <Section>
                    <SectionTitle>Sobre o cinema</SectionTitle>
                    <SectionText>
                        O FaltaFilme é o seu cinema para aproveitar grandes histórias na tela. Escolha uma sessão,
                        reúna quem você gosta e viva esse momento com a gente.
                    </SectionText>
                </Section>

                <LogoutButton accessibilityRole="button" accessibilityLabel="Sair da conta"
                              onPress={() => router.replace('/acesso')}>
                    <LogoutText>Sair da conta</LogoutText>
                </LogoutButton>
            </Content>
        </Scroll>
        <BottomNavigation onUnavailable={unavailable}/>
    </Root>);
}
