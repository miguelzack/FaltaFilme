import AsyncStorage from '@react-native-async-storage/async-storage';
import {getSession} from './authService';
import {availableSessions} from './sessionService';
import {occupiedSeats} from './seatService';

const ORDERS_KEY = '@faltafilme/orders';
/** @typedef {{id: string, email: string, movieId: string, title: string, posterPath: string | null, session: import('./sessionService').CinemaSession, seats: string[], full: number, half: number, total: number, createdAt: string}} Order */
/** @type {Promise<unknown>} */
let pending = Promise.resolve();

/** @returns {Promise<Order[]>} */
export async function getOrders() {
    const value = await AsyncStorage.getItem(ORDERS_KEY);
    if (!value) return [];
    const orders = JSON.parse(value);
    if (!Array.isArray(orders)) throw new Error('Pedidos indisponíveis');
    return orders;
}

/** @returns {Promise<Order[]>} */
export async function getCurrentUserOrders() {
    const user = await getSession();
    if (!user) throw new Error('Sessão indisponível');
    const orders = await getOrders();
    return orders.filter((order) => order && order.email === user.email)
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

/** @param {string} sessionId */
export async function getOccupiedSeats(sessionId) {
    const orders = await getOrders();
    return [...new Set([...occupiedSeats, ...orders.filter((order) => order.session?.id === sessionId && Array.isArray(order.seats)).flatMap((order) => order.seats)])];
}

/** @param {string} id @returns {Promise<Order | null>} */
export async function getOrder(id) {
    const user = await getSession();
    if (!user) return null;
    const orders = await getOrders();
    return orders.find((order) => order.id === id && order.email === user.email) || null;
}

/** @param {{movieId: string, title: string, posterPath: string | null, session: import('./sessionService').CinemaSession, seats: string[], full: number, half: number}} data @returns {Promise<Order>} */
export function createOrder(data) {
    const task = pending.then(async () => {
        const user = await getSession();
        if (!user || !availableSessions([data.session]).length) throw new Error('Sessão indisponível');
        if (data.session.movieId !== data.movieId || !Number.isInteger(data.full) || !Number.isInteger(data.half) || data.full < 0 || data.half < 0 || !data.seats.length || data.full + data.half !== data.seats.length || new Set(data.seats).size !== data.seats.length || data.seats.some((seat) => !/^[A-F][1-8]$/.test(seat))) throw new Error('Seleção inválida');
        const orders = await getOrders();
        const taken = new Set([...occupiedSeats, ...orders.filter((order) => order.session?.id === data.session.id && Array.isArray(order.seats)).flatMap((order) => order.seats)]);
        if (data.seats.some((seat) => taken.has(seat))) throw new Error('Assento indisponível');
        const order = {
            ...data,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
            email: user.email,
            total: data.full * 20 + data.half * 10,
            createdAt: new Date().toISOString()
        };
        await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify([...orders, order]));
        return order;
    });
    pending = task.catch(() => {
    });
    return task;
}
