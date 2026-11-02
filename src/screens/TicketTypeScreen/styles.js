import {styled} from 'styled-components/native';

export const SectionTitle = styled.Text`font-family: ${({theme}) => theme.fonts.semibold}; font-size: 14px; color: #F2F5FA; margin-top: 24px; margin-bottom: 24px;`;
export const TicketCard = styled.View`min-height: 102px; flex-direction: row; align-items: center; justify-content: space-between; padding: 12px; margin-bottom: 22px; border-radius: 10px; border-width: 1px; background-color: #252836;`;
export const TicketInfo = styled.View`flex: 1; gap: 5px;`;
export const TicketName = styled.Text`font-family: ${({theme}) => theme.fonts.semibold}; font-size: 16px; color: #F2F5FA;`;
export const TicketPrice = styled.Text`font-family: ${({theme}) => theme.fonts.regular}; font-size: 12px; color: #ADB5C7;`;
export const Counter = styled.View`width: 90px; height: 44px; flex-direction: row; align-items: center; justify-content: space-between; border-radius: 7px; background-color: #2E3042;`;
export const CounterButton = styled.Pressable`width: 30px; height: 44px; align-items: center; justify-content: center;`;
export const CounterText = styled.Text`font-family: ${({theme}) => theme.fonts.medium}; font-size: 14px;`;
export const Count = styled.Text`font-family: ${({theme}) => theme.fonts.semibold}; font-size: 16px; color: #F2F5FA;`;
export const Notice = styled.Text`font-family: ${({theme}) => theme.fonts.regular}; font-size: 12px; color: #ADB5C7; margin-bottom: 20px;`;
export const Summary = styled.View`min-height: 48px; flex-direction: row; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 8px; background-color: #252836;`;
export const SummaryText = styled.Text`font-family: ${({theme}) => theme.fonts.regular}; font-size: 14px; color: #ADB5C7;`;
export const Total = styled.Text`font-family: ${({theme}) => theme.fonts.semibold}; font-size: 16px; color: #F2F5FA;`;
export const Footer = styled.View`margin-top: 22px;`;
