import {styled} from 'styled-components/native';
import theme from "../../theme";

const CARD = theme.colors.input;
const BORDER = 'rgba(255, 255, 255, 0.12)';
const DANGER = theme.colors.error;

export const Root = styled.View`
    flex: 1;
    background-color: ${({theme}) => theme.colors.surface};
`;

export const Scroll = styled.ScrollView`
    flex: 1;
`;

export const Content = styled.View`
    width: 100%;
    max-width: 500px;
    align-self: center;
    padding: 0 28px;
    gap: 24px;
`;

export const Header = styled.View`
    gap: 4px;
`;

export const HeaderTitle = styled.Text`
    font-family: ${({theme}) => theme.fonts.semibold};
    font-size: 18px;
    margin-top: 50px;
    color: ${({theme}) => theme.colors.text};
`;

export const HeaderSubtitle = styled.Text`
    font-family: ${({theme}) => theme.fonts.regular};
    font-size: 12px;
    color: ${({theme}) => theme.colors.textSecondary};
`;

export const Card = styled.View`
    padding: 16px;
    border-radius: 12px;
    background-color: ${CARD};
`;

export const CardTitle = styled.Text`
    margin-bottom: 12px;
    font-family: ${({theme}) => theme.fonts.semibold};
    font-size: 16px;
    color: ${({theme}) => theme.colors.text};
`;

export const CardAddress = styled.Text`
    margin-bottom: 6px;
    font-family: ${({theme}) => theme.fonts.medium};
    font-size: 14px;
    color: ${({theme}) => theme.colors.text};
`;

export const CardHint = styled.Text`
    margin-bottom: 14px;
    font-family: ${({theme}) => theme.fonts.regular};
    font-size: 12px;
    color: ${({theme}) => theme.colors.textSecondary};
`;

export const Section = styled.View`gap: 4px;
`;

export const SectionTitle = styled.Text`
    font-family: ${({theme}) => theme.fonts.semibold};
    font-size: 18px;
    color: ${({theme}) => theme.colors.text};
`;
export const SectionText = styled.Text`
    font-family: ${({theme}) => theme.fonts.regular};
    font-size: 13px;
    line-height: 22px;
    color: ${({theme}) => theme.colors.text};
`;

export const LogoutButton = styled.Pressable`
    min-height: 50px;
    width: 100%;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: 1px solid ${BORDER};
    background-color: ${CARD};
`;

export const LogoutText = styled.Text`
    font-family: ${({theme}) => theme.fonts.medium};
    font-size: 14px;
    color: ${DANGER};
`;