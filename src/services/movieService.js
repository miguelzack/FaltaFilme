/** @typedef {{ id: number, title: string, poster_path: string | null, backdrop_path: string | null, vote_average: number, genre_ids: number[] }} Movie */
const API_URL = 'https://api.themoviedb.org/3';
const GENRES = {
    12: 'Aventura', 16: 'Animação', 28: 'Ação', 35: 'Comédia', 18: 'Drama', 53: 'Suspense', 10751: 'Família'
};

/** @param {Date} date */
function localDate(date) {
    const pad = (/** @type {number} */ value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** @param {Date} now */
export function releaseWindow(now = new Date()) {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setMonth(start.getMonth() - 2);
    const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
    start.setDate(Math.min(now.getDate(), lastDay));
    return {from: localDate(start), to: localDate(now)};
}

/** @param {number[]} ids */
export function genreName(ids) {
    return ids.map((id) => GENRES[/** @type {keyof typeof GENRES} */ (id)]).find(Boolean) || 'Filme';
}

/** @param {string | null} path @param {'w342' | 'w780'} size */
export function imageUrl(path, size) {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

/** @param {AbortSignal} signal */
async function discover(signal) {
    const token = process.env.EXPO_PUBLIC_TMDB_ACCESS_TOKEN;
    if (!token) throw new Error('Não foi possível carregar os filmes. Tente novamente mais tarde.');
    const dates = releaseWindow();
    const params = new URLSearchParams({
        language: 'pt-BR',
        include_adult: 'false',
        sort_by: 'popularity.desc',
        'primary_release_date.gte': dates.from,
        'primary_release_date.lte': dates.to
    });
    const response = await fetch(`${API_URL}/discover/movie?${params.toString()}`, {
        signal, headers: {Authorization: `Bearer ${token}`, Accept: 'application/json'}
    });
    if (!response.ok) throw new Error('Não foi possível carregar os filmes. Tente novamente.');
    const result = await response.json();
    if (!Array.isArray(result.results)) throw new Error('Não foi possível carregar os filmes. Tente novamente.');
    return /** @type {Movie[]} */ (result.results);
}

/** @param {AbortSignal} signal */
export async function getHomeMovies(signal) {
    const popular = (await discover(signal)).slice(0, 15);
    const family = popular.filter((movie) => (movie.genre_ids || []).some((id) => [16, 12, 35].includes(id)));
    const discovery = popular.filter((movie) => (movie.genre_ids || []).some((id) => [18, 53, 28].includes(id)));
    return {popular, family, discovery};
}

/** @param {string} id @param {AbortSignal} signal */
export async function getMovieDetails(id, signal) {
    if (!/^\d+$/.test(id)) throw new Error('Filme inválido.');
    const token = process.env.EXPO_PUBLIC_TMDB_ACCESS_TOKEN;
    if (!token) throw new Error('Não foi possível carregar o filme.');
    const params = new URLSearchParams({language: 'pt-BR', append_to_response: 'credits,release_dates'});
    const response = await fetch(`${API_URL}/movie/${id}?${params.toString()}`, {
        signal, headers: {Authorization: `Bearer ${token}`, Accept: 'application/json'}
    });
    if (!response.ok) throw new Error('Não foi possível carregar o filme.');
    const movie = await response.json();
    if (!movie || typeof movie.title !== 'string') throw new Error('Dados do filme indisponíveis.');
    return movie;
}
