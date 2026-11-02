import {Linking} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {MapButton, MapButtonText, Wrapper} from './styles';

export default function CinemaMap({latitude = 0, longitude = 0, title = '', address = ''}) {
    const openInGoogleMaps = () => {
        const query = encodeURIComponent(address || `${latitude},${longitude}`);
        return Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    };

    return (<Wrapper>
        <MapView
            style={{flex: 1}}
            initialRegion={{latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01}}
            rotateEnabled={false}
            pitchEnabled={false}
        >
            <Marker coordinate={{latitude, longitude}} title={title}/>
        </MapView>
        <MapButton accessibilityRole="button" accessibilityLabel="Abrir no Google Maps" onPress={openInGoogleMaps}>
            <MapButtonText>Abrir no Google Maps</MapButtonText>
        </MapButton>
    </Wrapper>);
}
