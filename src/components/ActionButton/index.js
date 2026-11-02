import {Button, Label} from './styles';
import {useTheme} from 'styled-components/native';

/** @param {{ label: string, onPress: () => void, darkText?: boolean, purchase?: boolean, large?: boolean }} props */
export default function ActionButton({label, onPress, darkText = false, purchase = false, large = false}) {
    const theme = useTheme();
    return (<Button
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={({pressed}) => ({opacity: pressed ? 0.8 : 1, ...(purchase || large ? {minHeight: 60} : {})})}
    >
        <Label style={purchase ? {
            color: theme.colors.surface, fontFamily: theme.fonts.semibold
        } : darkText ? {color: theme.colors.background} : undefined}>{label}</Label>
    </Button>);
}
