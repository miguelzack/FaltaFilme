import AsyncStorage from '@react-native-async-storage/async-storage';

/** @typedef {{id: string, time: string, room: number, format: string, date: string, movieId: string}} CinemaSession */

/** @param {Date} now */
export function localSessionDate(now = new Date(), offset = 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** @param {Date} now */
export function availableSessionDates(now = new Date()) {
    const minute = now.getHours() * 60 + now.getMinutes();
    const offsets = minute <= 19 * 60 + 30 ? [0, 1, 2, 3] : [1, 2, 3];
    return offsets.map((offset) => localSessionDate(now, offset));
}

/** @param {CinemaSession[]} sessions @param {Date} now */
export function availableSessions(sessions, now = new Date()) {
    const today = localSessionDate(now, 0);
    return sessions.filter((session) => {
        if (session.date !== today) return session.date > today;
        if (now.getHours() * 60 + now.getMinutes() > 19 * 60 + 30) return false;
        const [hour, minute] = session.time.split(':').map(Number);
        return hour * 60 + minute > now.getHours() * 60 + now.getMinutes();
    });
}

/** @param {string} movieId @param {string} date */
function sessionsKey(movieId, date) {
    return `@faltafilme/sessions/${date}/${movieId}`;
}

/** @param {string} movieId @param {string} date */
export async function getCinemaSessions(movieId, date = localSessionDate()) {
    if (!/^\d+$/.test(movieId)) throw new Error('Filme inválido.');
    const key = sessionsKey(movieId, date);
    const saved = await AsyncStorage.getItem(key);
    if (saved) {
        try {
            const sessions = JSON.parse(saved);
            if (Array.isArray(sessions) && sessions.length && sessions.every((session) => session.movieId === movieId && session.date === date && typeof session.id === 'string' && typeof session.time === 'string' && Number.isInteger(session.room) && typeof session.format === 'string')) return sessions;
        } catch {
            // Regenerate invalid saved sessions.
        }
    }
    const seed = Number(movieId.slice(-6));
    const sessions = ['14:00', '18:20', '20:45'].map((time, index) => ({
        id: `${movieId}-${date}-${index}`,
        movieId,
        date,
        time,
        room: ((seed + index) % 4) + 1,
        format: index === 1 ? 'Legendado' : 'Dublado',
    }));
    await AsyncStorage.setItem(key, JSON.stringify(sessions));
    return sessions;
}

/** @param {string} movieId @param {string} date */
export async function getSelectedSession(movieId, date) {
    return AsyncStorage.getItem(`@faltafilme/selected-session/${date}/${movieId}`);
}

/** @param {CinemaSession} session */
export async function selectCinemaSession(session) {
    await AsyncStorage.setItem(`@faltafilme/selected-session/${session.date}/${session.movieId}`, session.id);
}
