import Svg, {Defs, Ellipse, RadialGradient, Stop} from 'react-native-svg';

export default function PosterGlow() {
    return <Svg width="388" height="342" viewBox="0 0 388 342" fill="none">
        <Defs><RadialGradient id="posterGlow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#0AE0B8" stopOpacity={0.28}/>
            <Stop offset="48%" stopColor="#0AE0B8" stopOpacity={0.22}/>
            <Stop offset="75%" stopColor="#0AE0B8" stopOpacity={0.09}/>
            <Stop offset="100%" stopColor="#0AE0B8" stopOpacity={0}/>
        </RadialGradient></Defs>
        <Ellipse cx="194" cy="171" rx="194" ry="171" fill="url(#posterGlow)"/>
    </Svg>;
}
