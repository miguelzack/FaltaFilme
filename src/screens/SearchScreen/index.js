import {useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, Animated, FlatList, Image, Modal, ScrollView, useWindowDimensions} from 'react-native';
import {router} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from 'styled-components/native';
import SearchIcon from '../../assets/icons/SearchIcon';
import ArrowDownIcon from '../../assets/icons/ArrowDownIcon';
import FilterIcon from '../../assets/icons/FilterIcon';
import StarIcon from '../../assets/icons/StarIcon';
import BottomNavigation from '../../components/BottomNavigation';
import {getHomeMovies, getMovieDetails, imageUrl} from '../../services/movieService';
import {availableSessionDates, availableSessions, getCinemaSessions} from '../../services/sessionService';
import {
    Root,
    Header,
    Title,
    Subtitle,
    SearchRow,
    Input,
    FilterDivider,
    FilterButton,
    FilterText,
    ResultsHeader,
    ResultsTitle,
    SortLabel,
    Card,
    Poster,
    Details,
    MovieTitle,
    Meta,
    CardBottom,
    Rating,
    RatingValue,
    SessionButton,
    SessionLabel,
    Empty,
    Retry,
    NoResultsCard,
    NoResultsIcon,
    NoResultsTitle,
    NoResultsDescription,
    ClearButton,
    ClearLabel,
    SuggestionsTitle,
    Overlay,
    Sheet,
    SheetHeader,
    SheetTitle,
    SheetClear,
    SheetDescription,
    FilterGrid,
    FilterField,
    FieldLabel,
    FieldValue,
    Chevron,
    ApplyButton,
    ApplyLabel,
    OptionOverlay,
    OptionBackdrop,
    Options,
    OptionsHeader,
    OptionsTitle,
    CloseOptions,
    Option,
    OptionText,
    OptionCheck
} from './styles';

/** @typedef {{id: number, title: string, poster_path: string | null, vote_average: number, runtime: number | null, genres: {id: number, name: string}[], credits?: {cast?: {name: string}[]}, release_dates?: {results?: {iso_3166_1: string, release_dates: {certification: string}[]}[]}}} SearchMovie */
/** @param {string} value */
function normalize(value) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
}

/** @param {SearchMovie} movie */
function classification(movie) {
    const brazil = movie.release_dates?.results?.find((item) => item.iso_3166_1 === 'BR');
    const value = brazil?.release_dates?.find((item) => item.certification)?.certification;
    return value === 'L' ? 'Livre' : value ? `${value} anos` : 'Classificação não informada';
}

/** @param {number | null} minutes */
function runtime(minutes) {
    return minutes ? `${Math.floor(minutes / 60) ? `${Math.floor(minutes / 60)}h ` : ''}${minutes % 60 ? `${minutes % 60}min` : ''}`.trim() : 'Duração não informada';
}

/** @param {{movie: SearchMovie}} props */
function SearchResult({movie}) {
    const [imageFailed, setImageFailed] = useState(false);
    const poster = imageUrl(movie.poster_path, 'w342');
    return <Card><Poster>{poster && !imageFailed &&
        <Image source={{uri: poster}} style={{width: '100%', height: '100%'}} resizeMode="cover"
               onError={() => setImageFailed(true)}/>}</Poster><Details>
        <MovieTitle numberOfLines={2}>{movie.title}</MovieTitle>
        <Meta
            numberOfLines={1}>{movie.genres?.slice(0, 2).map((genre) => genre.name).join(' · ') || 'Gênero não informado'}</Meta>
        <Meta numberOfLines={1}>{runtime(movie.runtime)} · {classification(movie)}</Meta>
        <CardBottom><Rating><StarIcon/><RatingValue>{movie.vote_average > 0 ? (movie.vote_average / 2).toFixed(1).replace('.', ',') : '—'}</RatingValue></Rating>
            <SessionButton accessibilityRole="button" accessibilityLabel={`Ver sessões de ${movie.title}`}
                           onPress={() => router.push({
                               pathname: '/sessao/[id]', params: {id: String(movie.id)}
                           })}><SessionLabel>Ver sessões ›</SessionLabel></SessionButton></CardBottom>
    </Details></Card>;
}

export default function SearchScreen() {
    const insets = useSafeAreaInsets();
    const {height: screenHeight} = useWindowDimensions();
    const theme = useTheme();
    const [movies, setMovies] = useState(/** @type {SearchMovie[]} */ ([]));
    const [query, setQuery] = useState('');
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [filters, setFilters] = useState({genre: '', rating: '', format: '', time: ''});
    const [draft, setDraft] = useState({genre: '', rating: '', format: '', time: ''});
    const [openField, setOpenField] = useState('');
    const [optionsAnimation] = useState(() => new Animated.Value(0));
    const animationRequest = useRef(0);

    /** @param {string} key */
    function showOptions(key) {
        animationRequest.current += 1;
        optionsAnimation.stopAnimation();
        setOpenField(key);
        optionsAnimation.setValue(0);
        Animated.timing(optionsAnimation, {toValue: 1, duration: 180, useNativeDriver: true}).start();
    }

    function hideOptions() {
        const request = ++animationRequest.current;
        optionsAnimation.stopAnimation();
        Animated.timing(optionsAnimation, {toValue: 0, duration: 150, useNativeDriver: true}).start(({finished}) => {
            if (finished && request === animationRequest.current) setOpenField('');
        });
    }

    const [sessions, setSessions] = useState(/** @type {Record<string, import('../../services/sessionService').CinemaSession[]>} */ ({}));
    const [sessionsLoading, setSessionsLoading] = useState(false);
    const [sessionsError, setSessionsError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        getHomeMovies(controller.signal).then(({popular}) => Promise.all(popular.map((movie) => getMovieDetails(String(movie.id), controller.signal))))
            .then((details) => {
                if (!controller.signal.aborted) setMovies(details);
            })
            .catch(() => {
                if (!controller.signal.aborted) setError(true);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [attempt]);
    const genres = useMemo(() => {
        const all = new Map();
        movies.forEach((movie) => movie.genres?.forEach((genre) => all.set(genre.id, genre.name)));
        return [...all].map(([id, name]) => ({id, name})).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    }, [movies]);
    useEffect(() => {
        if (!filtersVisible || movies.length === 0) return;
        let active = true;


        const dates = availableSessionDates(new Date());
        Promise.all(movies.map(async (movie) => {
            const groups = await Promise.all(dates.map((date) => getCinemaSessions(String(movie.id), date)));
            return [String(movie.id), availableSessions(groups.flat(), new Date())];
        })).then((entries) => {
            if (active) setSessions(Object.fromEntries(entries));
        })
            .catch(() => {
                if (active) setSessionsError(true);
            })
            .finally(() => {
                if (active) setSessionsLoading(false);
            });
        return () => {
            active = false;
        };
    }, [filtersVisible, movies]);
    const filterMovies = (/** @type {typeof filters} */ criteria) => {
        const term = normalize(query);
        return movies.filter((movie) => {
            const text = [movie.title, ...(movie.genres || []).map((genre) => genre.name), ...(movie.credits?.cast || []).map((person) => person.name)].join(' ');
            const movieSessions = availableSessions(sessions[String(movie.id)] || [], new Date());
            return (!criteria.genre || movie.genres?.some((genre) => String(genre.id) === criteria.genre)) && (!criteria.rating || classification(movie) === criteria.rating) && (!criteria.format && !criteria.time || movieSessions.some((session) => (!criteria.format || session.format === criteria.format) && (!criteria.time || session.time === criteria.time))) && (!term || normalize(text).includes(term));
        });
    };
    const results = filterMovies(filters);
    const draftResults = filterMovies(draft);
    const ratings = [...new Set(movies.map(classification).filter((value) => value !== 'Classificação não informada'))];
    const sessionList = Object.values(sessions).flat();
    const fields = [{
        key: 'genre',
        label: 'Gênero',
        empty: 'Todos',
        options: genres.map((genre) => ({value: String(genre.id), label: genre.name}))
    }, {
        key: 'rating', label: 'Classificação', empty: 'Todas', options: ratings.map((value) => ({value, label: value}))
    }, {
        key: 'format',
        label: 'Formato',
        empty: 'Todos',
        options: [...new Set(sessionList.map((item) => item.format))].sort().map((value) => ({value, label: value}))
    }, {
        key: 'time',
        label: 'Horário',
        empty: 'Qualquer',
        options: [...new Set(sessionList.map((item) => item.time))].sort().map((value) => ({value, label: value}))
    },];
    const noResults = !loading && !error && results.length === 0 && Boolean(query.trim() || Object.values(filters).some(Boolean));
    const displayedMovies = noResults ? movies.slice(0, 2) : results;
    return <Root><FlatList data={displayedMovies} keyExtractor={(item) => String(item.id)}
                           keyboardShouldPersistTaps="handled"
                           keyboardDismissMode="on-drag" contentContainerStyle={{
        paddingHorizontal: 24, paddingTop: Math.max(insets.top, 24) + 8, paddingBottom: 24, flexGrow: 1
    }} renderItem={({item}) => <SearchResult movie={item}/>}
                           ListHeaderComponent={<><Header><Title>Encontre seu filme</Title><Subtitle>Busque por
                               título, gênero ou elenco</Subtitle></Header>
                               <SearchRow><SearchIcon size={16}/><Input
                                   accessibilityLabel="Buscar por título, gênero ou elenco"
                                   placeholder="Filme, gênero ou elenco" placeholderTextColor="#92929D" value={query}
                                   onChangeText={setQuery} returnKeyType="search"/><FilterDivider/><FilterButton
                                   accessibilityRole="button" accessibilityLabel="Filtrar por gênero"
                                   accessibilityState={{expanded: filtersVisible}} hitSlop={12}
                                   onPress={() => {
                                       setDraft(filters);
                                       setOpenField('');
                                       setSessionsError(false);
                                       setSessionsLoading(movies.length > 0);
                                       setFiltersVisible(true);
                                   }}><FilterIcon/></FilterButton></SearchRow>
                               {noResults ? <><NoResultsCard><NoResultsIcon><SearchIcon size={16}/></NoResultsIcon>
                                       <NoResultsTitle>Não encontramos esse filme</NoResultsTitle>
                                       <NoResultsDescription>Confira o título digitado ou tente buscar por outro filme,
                                           gênero ou elenco.</NoResultsDescription>
                                       <ClearButton accessibilityRole="button" onPress={() => {
                                           setQuery('');
                                           setFilters({genre: '', rating: '', format: '', time: ''});
                                           setFiltersVisible(false);
                                       }}><ClearLabel>Limpar busca</ClearLabel></ClearButton>
                                   </NoResultsCard>{displayedMovies.length > 0 &&
                                       <SuggestionsTitle>Talvez você goste</SuggestionsTitle>}</> :
                                   <ResultsHeader><ResultsTitle>Em cartaz</ResultsTitle><SortLabel>Mais
                                       populares</SortLabel></ResultsHeader>}</>}
                           ListEmptyComponent={loading ?
                               <Empty><ActivityIndicator size="large" color={theme.colors.primary}/><Subtitle>Carregando
                                   filmes...</Subtitle></Empty> : error ?
                                   <Empty><Subtitle>Não foi possível carregar os filmes. Tente
                                       novamente.</Subtitle><Retry accessibilityRole="button" onPress={() => {
                                       setError(false);
                                       setLoading(true);
                                       setAttempt((value) => value + 1);
                                   }}><FilterText>Tentar novamente</FilterText></Retry></Empty> :
                                   <Empty><Subtitle>{query.trim() || Object.values(filters).some(Boolean) ? 'Nenhum filme encontrado para essa busca.' : 'Nenhum filme em cartaz no momento.'}</Subtitle></Empty>}/>
        <BottomNavigation active="search"/>
        <Modal transparent visible={filtersVisible} animationType="slide" onRequestClose={() => {
            if (openField) hideOptions(); else setFiltersVisible(false);
        }}>
            <Overlay><Sheet accessibilityViewIsModal style={{paddingBottom: Math.max(insets.bottom, 24)}}>
                <SheetHeader><SheetTitle>Filtros</SheetTitle><SheetClear accessibilityRole="button" onPress={() => {
                    setDraft({genre: '', rating: '', format: '', time: ''});
                    setOpenField('');
                }}>Limpar</SheetClear></SheetHeader>
                <SheetDescription>Refine os filmes pela sua preferência</SheetDescription>
                <FilterGrid>{fields.map((field) => {
                    const value = draft[/** @type {keyof typeof draft} */ (field.key)];
                    return <FilterField key={field.key} accessibilityRole="button"
                                        accessibilityLabel={`${field.label}: ${field.options.find((option) => option.value === value)?.label || field.empty}`}
                                        accessibilityState={{expanded: openField === field.key}}
                                        onPress={() => showOptions(field.key)}>
                        <FieldLabel>{field.label}</FieldLabel><FieldValue
                        numberOfLines={1}>{field.options.find((option) => option.value === value)?.label || field.empty}</FieldValue><Chevron><ArrowDownIcon/></Chevron>
                    </FilterField>;
                })}</FilterGrid>
                {sessionsError &&
                    <SheetDescription>Não foi possível carregar as sessões. Feche e abra os filtros para tentar
                        novamente.</SheetDescription>}
                <ApplyButton accessibilityRole="button" disabled={sessionsLoading || sessionsError} onPress={() => {
                    setFilters(draft);
                    setFiltersVisible(false);
                    setOpenField('');
                }}><ApplyLabel>{sessionsLoading ? 'Carregando...' : `Ver ${draftResults.length} ${draftResults.length === 1 ? 'filme' : 'filmes'}`}</ApplyLabel></ApplyButton>
            </Sheet>
                {openField ? <OptionOverlay accessibilityViewIsModal>
                    <OptionBackdrop accessibilityRole="button" accessibilityLabel="Fechar opções"
                                    onPress={hideOptions}/>
                    <Options style={{
                        maxHeight: Math.max(160, screenHeight - insets.top - insets.bottom - 48),
                        opacity: optionsAnimation,
                        transform: [{scale: optionsAnimation.interpolate({inputRange: [0, 1], outputRange: [0.96, 1]})}]
                    }}>
                        {(() => {
                            const field = fields.find((item) => item.key === openField);
                            if (!field) return null;
                            const selected = draft[/** @type {keyof typeof draft} */ (field.key)];
                            return <><OptionsHeader><OptionsTitle>{field.label}</OptionsTitle><CloseOptions
                                accessibilityRole="button" accessibilityLabel="Fechar opções"
                                onPress={hideOptions}>✕</CloseOptions></OptionsHeader>
                                <ScrollView keyboardShouldPersistTaps="handled">{[{
                                    value: '', label: field.empty
                                }, ...field.options].map((option) => <Option key={option.value}
                                                                             accessibilityRole="button"
                                                                             accessibilityState={{selected: selected === option.value}}
                                                                             onPress={() => {
                                                                                 setDraft((current) => ({
                                                                                     ...current,
                                                                                     [field.key]: option.value
                                                                                 }));
                                                                                 hideOptions();
                                                                             }}>
                                    <OptionText
                                        style={{color: selected === option.value ? theme.colors.primary : theme.colors.text}}>{option.label}</OptionText>{selected === option.value &&
                                    <OptionCheck>✓</OptionCheck>}
                                </Option>)}</ScrollView></>;
                        })()}
                    </Options>
                </OptionOverlay> : null}
            </Overlay>
        </Modal>
    </Root>;
}






