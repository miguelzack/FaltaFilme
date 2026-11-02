import Svg, {Path} from 'react-native-svg';

/** @param {{color?: string}} props */
export default function TicketsIcon({color = '#92929D'}) {
    return (<Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Path opacity="0" d="M0.5 0.5H23.5V23.5H0.5V0.5Z" fill="#92929D" stroke={color}/>
        <Path
            d="M3 4.59979H21V9.44343C20.3138 9.44343 19.6556 9.76065 19.1704 10.3253C18.6851 10.89 18.4125 11.6558 18.4125 12.4543C18.4125 13.2529 18.6851 14.0187 19.1704 14.5834C19.6556 15.148 20.3138 15.4652 21 15.4652V18.9998H3V15.4652C3.68625 15.4652 4.34439 15.148 4.82964 14.5834C5.31489 14.0187 5.5875 13.2529 5.5875 12.4543C5.5875 11.6558 5.31489 10.89 4.82964 10.3253C4.34439 9.76065 3.68625 9.44343 3 9.44343V4.59979Z"
            strokeWidth="1.7" strokeLinejoin="round" stroke={color}/>
        <Path d="M12 9V9.68571M12 15.4V14.7143M12 11.5143V12.8857" strokeWidth="1.7" strokeLinecap="round"
              stroke={color}/>
    </Svg>);
}
