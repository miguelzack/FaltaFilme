import {styled} from 'styled-components/native';

export const Wrapper = styled.View`height: 220px;
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    background-color: ${({theme}) => theme.colors.background};`;
export const MapButton = styled.Pressable`position: absolute;
    right: 8px;
    bottom: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    background-color: ${({theme}) => theme.colors.primary};`;
export const MapButtonText = styled.Text`font-family: ${({theme}) => theme.fonts.medium};
    font-size: 12px;
    color: ${({theme}) => theme.colors.text};`;
