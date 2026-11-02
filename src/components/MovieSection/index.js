import {useState} from 'react';
import {FlatList} from 'react-native';
import MovieCard from '../MovieCard';
import {Chip, ChipText, Chips, Empty, Heading, Section} from './styles';

/** @param {{ title: string, movies: import('../../services/movieService').Movie[], genres?: {id: number, name: string}[], onMoviePress: (movie: import('../../services/movieService').Movie) => void }} props */
export default function MovieSection({title, movies, genres = [], onMoviePress}) {
    const [selected, setSelected] = useState(/** @type {number | null} */ (null));
    const filtered = selected === null ? movies : movies.filter((movie) => (movie.genre_ids || []).includes(selected));
    return (<Section>
        <Heading>{title}</Heading>
        {genres.length > 0 && <Chips>{genres.map((genre) => <Chip key={genre.id} accessibilityRole="button"
                                                                  accessibilityState={{selected: selected === genre.id}}
                                                                  onPress={() => setSelected(selected === genre.id ? null : genre.id)}
                                                                  style={{
                                                                      borderWidth: 1,
                                                                      borderColor: selected === genre.id ? '#12D9A9' : 'transparent'
                                                                  }}><ChipText>{genre.name}</ChipText></Chip>)}</Chips>}
        {filtered.length ? <FlatList horizontal data={filtered} keyExtractor={(movie) => String(movie.id)}
                                     renderItem={({item}) => <MovieCard movie={item}
                                                                        onPress={() => onMoviePress(item)}/>}
                                     showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 12}}/> :
            <Empty>Nenhum filme encontrado nesta categoria.</Empty>}
    </Section>);
}
