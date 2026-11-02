import {useCallback, useEffect, useRef, useState} from 'react';
import {Image, PixelRatio, ScrollView, useWindowDimensions} from 'react-native';
import {imageUrl} from '../../services/movieService';
import {Caption, Dot, Dots, Fallback, ImageFrame, Slide} from './styles';

/** @param {{ movie: import('../../services/movieService').Movie, width: number, onPress: () => void }} props */
function FeaturedSlide({movie, width, onPress}) {
    const [imageFailed, setImageFailed] = useState(false);
    const url = imageUrl(movie.backdrop_path, 'w780');
    return (<Slide accessibilityRole="button" accessibilityLabel={`Ver detalhes de ${movie.title}`} onPress={onPress}
                   style={{width}}>
        <ImageFrame>{url && !imageFailed ?
            <Image source={{uri: url}} style={{width: '100%', height: '100%'}} resizeMode="cover"
                   onError={() => setImageFailed(true)}/> : <Fallback>Imagem indisponível</Fallback>}</ImageFrame>
        <Caption numberOfLines={1}>{movie.title}</Caption>
    </Slide>);
}

/** @param {{ movies: import('../../services/movieService').Movie[], onMoviePress: (movie: import('../../services/movieService').Movie) => void }} props */
export default function FeaturedCarousel({movies, onMoviePress}) {
    const {width} = useWindowDimensions();
    const slideWidth = PixelRatio.roundToNearestPixel(Math.max(1, Math.min(width - 48, 452)));
    const featured = movies.filter((movie) => movie.backdrop_path).slice(0, 3);
    const slides = featured.length ? featured : movies.slice(0, 3);
    const looping = slides.length > 1;
    const carouselSlides = looping ? [slides[slides.length - 1], ...slides, slides[0]] : slides;
    const [active, setActive] = useState(0);
    const [dragging, setDragging] = useState(false);
    const listRef = useRef(/** @type {import('react').ComponentRef<typeof ScrollView> | null} */ (null));
    const offsetRef = useRef(0);
    const initialized = useRef(false);
    const settleTimer = useRef(/** @type {ReturnType<typeof setTimeout> | null} */ (null));

    const finishScroll = useCallback((/** @type {number} */ offset) => {
        if (!looping) return;
        const index = Math.max(0, Math.min(slides.length + 1, Math.round(offset / slideWidth)));
        const normalized = index === 0 ? slides.length : index === slides.length + 1 ? 1 : index;
        if (normalized !== index) {
            offsetRef.current = normalized * slideWidth;
            listRef.current?.scrollTo({x: offsetRef.current, animated: false});
        }
        setActive(normalized - 1);
        setDragging(false);
    }, [looping, slides.length, slideWidth]);

    useEffect(() => {
        if (slides.length < 2 || dragging) return;
        const timeout = setTimeout(() => {
            setDragging(true);
            listRef.current?.scrollTo({x: (active + 2) * slideWidth, animated: true});
            settleTimer.current = setTimeout(() => finishScroll(offsetRef.current), 1000);
        }, 5000);
        return () => clearTimeout(timeout);
    }, [active, dragging, finishScroll, slideWidth, slides.length]);

    useEffect(() => () => {
        if (settleTimer.current) clearTimeout(settleTimer.current);
    }, []);

    if (!slides.length) return null;
    return (<>
        <ScrollView ref={listRef} horizontal pagingEnabled style={{width: slideWidth, alignSelf: 'center'}}
            removeClippedSubviews={false}
            onLayout={() => {
                if (!initialized.current && looping) {
                    initialized.current = true;
                    offsetRef.current = slideWidth;
                    listRef.current?.scrollTo({x: slideWidth, animated: false});
                }
            }}
            showsHorizontalScrollIndicator={false}
            onScrollBeginDrag={() => {
                if (settleTimer.current) clearTimeout(settleTimer.current);
                setDragging(true);
            }}
            onScrollEndDrag={(event) => {
                offsetRef.current = event.nativeEvent.contentOffset.x;
                if (!looping) {
                    setDragging(false);
                    return;
                }
                settleTimer.current = setTimeout(() => finishScroll(offsetRef.current), 200);
            }}
            onScroll={(event) => {
                offsetRef.current = event.nativeEvent.contentOffset.x;
            }}
            scrollEventThrottle={16}
            onMomentumScrollBegin={() => {
                if (settleTimer.current) clearTimeout(settleTimer.current);
            }}
            onMomentumScrollEnd={(event) => {
                if (settleTimer.current) clearTimeout(settleTimer.current);
                finishScroll(event.nativeEvent.contentOffset.x);
            }}>
            {carouselSlides.map((movie, index) => <FeaturedSlide key={`${movie.id}-${index}`} movie={movie} width={slideWidth} onPress={() => onMoviePress(movie)}/>)}
        </ScrollView>
        {slides.length > 1 &&
            <Dots accessibilityLabel={`Destaque ${active + 1} de ${slides.length}`}>{slides.map((movie, index) => <Dot
                key={movie.id}
                style={{opacity: active === index ? 1 : 0.3, width: active === index ? 24 : 8}}/>)}</Dots>}
    </>);
}
