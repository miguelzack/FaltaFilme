import Svg, {Circle, Path} from 'react-native-svg';

export default function MapPinIcon() {
    return <Svg width={36} height={48} viewBox="0 0 36 48" fill="none">
        <Path d="M18 1C8.6 1 1 8.5 1 17.9 1 30.2 18 47 18 47S35 30.2 35 17.9C35 8.5 27.4 1 18 1Z" fill="#12D9A9"
              stroke="#07002F" strokeWidth={2}/>
        <Circle cx={18} cy={18} r={6} fill="#07002F"/>
    </Svg>;
}
