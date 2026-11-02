import {useSafeAreaInsets} from 'react-native-safe-area-context';
import HomeIcon from '../../assets/icons/HomeIcon';
import SearchIcon from '../../assets/icons/SearchIcon';
import TicketsIcon from '../../assets/icons/TicketsIcon';
import PersonIcon from '../../assets/icons/PersonIcon';
import {Active, ActiveLabel, Bar, Item} from './styles';
import { usePathname } from "expo-router";
import theme from "../../theme";

/** @param {{ onUnavailable: (name: string) => void }} props */
export default function BottomNavigation({onUnavailable}) {
    const insets = useSafeAreaInsets();
    const pathname = usePathname();

    const isHome = pathname === '/home';
    const isAbout = pathname === '/about';
    const {primary, grey} = theme.colors;

    return (<Bar style={{paddingBottom: Math.max(insets.bottom, 12)}}>
            <Item accessibilityRole="button" accessibilityLabel="Início" accessibilityState={{selected: isHome}}
                onPress={() => onUnavailable('Início')}>
                {isHome ? (<Active><HomeIcon color={primary} /><ActiveLabel>Início</ActiveLabel></Active>) : (<HomeIcon color={grey} />)}</Item>
            <Item accessibilityRole="button" accessibilityLabel="Pesquisa"
                onPress={() => onUnavailable('Pesquisa')}><SearchIcon /></Item>
            <Item accessibilityRole="button" accessibilityLabel="Ingressos"
                onPress={() => onUnavailable('Ingressos')}><TicketsIcon /></Item>
            <Item accessibilityRole="button" accessibilityLabel="Sobre nós" accessibilityState={{selected: isAbout}}
                onPress={() => onUnavailable('Sobre nós')}>{isAbout ? (<Active><PersonIcon color={primary} /><ActiveLabel>Sobre</ActiveLabel></Active>) : (<PersonIcon color={grey} />)}</Item>
        </Bar>
    );
}