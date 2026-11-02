import {router} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import HomeIcon from '../../assets/icons/HomeIcon';
import SearchIcon from '../../assets/icons/SearchIcon';
import TicketsIcon from '../../assets/icons/TicketsIcon';
import PersonIcon from '../../assets/icons/PersonIcon';
import {
    Active, ActiveLabel, Bar, Item
} from './styles';

/** @param {{ onHomePress?: () => void, active?: 'home' | 'search' | 'tickets' | 'about' }} props */
export default function BottomNavigation({onHomePress, active = 'home'}) {
    const insets = useSafeAreaInsets();
    return (<><Bar style={{paddingBottom: Math.max(insets.bottom, 20)}}>
        <Item accessibilityRole="button" accessibilityLabel="Início" onPress={onHomePress || (() => {
            if (active !== 'home') router.replace('/home');
        })}
              accessibilityState={{selected: active === 'home'}}>{active === 'home' ?
            <Active><HomeIcon/><ActiveLabel>Início</ActiveLabel></Active> : <HomeIcon color="#92929D"/>}</Item>
        <Item accessibilityRole="button" accessibilityLabel="Pesquisa"
              accessibilityState={{selected: active === 'search'}} onPress={() => {
            if (active !== 'search') router.push('/busca');
        }}>{active === 'search' ? <Active><SearchIcon color="#12D9A9"/><ActiveLabel>Busca</ActiveLabel></Active> :
            <SearchIcon/>}</Item>
        <Item accessibilityRole="button" accessibilityLabel="Ingressos"
              accessibilityState={{selected: active === 'tickets'}} onPress={() => {
            if (active !== 'tickets') router.push('/pedidos');
        }}>{active === 'tickets' ? <Active><TicketsIcon color="#12D9A9"/><ActiveLabel>Ingressos</ActiveLabel></Active> :
            <TicketsIcon/>}</Item>
        <Item accessibilityRole="button" accessibilityLabel="Sobre nós" accessibilityState={{selected: active === 'about'}}
              onPress={() => { if (active !== 'about') router.push('/sobre'); }}>{active === 'about' ?
            <Active><PersonIcon color="#12D9A9"/><ActiveLabel>Sobre nós</ActiveLabel></Active> : <PersonIcon/>}</Item>
    </Bar></>);
}
