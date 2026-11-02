import {useRef, useState} from 'react';
import {Alert} from 'react-native';
import {router} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import BottomNavigation from '../../components/BottomNavigation';
import CinemaMap from '../../components/CinemaMap';
import {logoutAccount} from '../../services/authService';
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

    const [signingOut, setSigningOut] = useState(false);
    const signingOutRef = useRef(false);

    async function signOut() {
        if (signingOutRef.current) return;
        signingOutRef.current = true;
        setSigningOut(true);
        try {
            await logoutAccount();
            router.dismissAll();
            router.replace('/acesso');
        } catch {
            Alert.alert('Não foi possível sair', 'Tente novamente.');
            signingOutRef.current = false;
            setSigningOut(false);
        }
    }

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
                        FALTA algo? Talvez seja um FILME.
                    </SectionText>
                    <SectionText>
                        O FaltaFilme é o seu cinema para aproveitar grandes histórias na tela. Escolha uma sessão,
                        reúna quem você gosta e viva esse momento com a gente.
                    </SectionText>
                </Section>

                <LogoutButton accessibilityRole="button" accessibilityLabel="Sair da conta" disabled={signingOut}
                              onPress={signOut}>
                    <LogoutText>{signingOut ? 'Saindo...' : 'Sair da conta'}</LogoutText>
                </LogoutButton>
            </Content>
        </Scroll>
        <BottomNavigation active="about"/>
    </Root>);
}
