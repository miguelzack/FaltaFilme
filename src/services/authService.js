import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = '@faltafilme/users';
const SESSION_KEY = '@faltafilme/session';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AuthError extends Error {
    /** @param {string} message @param {'name' | 'email' | 'password' | 'credentials' | 'storage'} field */
    constructor(message, field) {
        super(message);
        this.name = 'AuthError';
        this.field = field;
    }
}

async function readUsers() {
    try {
        const value = await AsyncStorage.getItem(USERS_KEY);
        const users = value ? JSON.parse(value) : [];
        if (!Array.isArray(users)) throw new Error('Invalid users');
        return users;
    } catch {
        throw new AuthError('Não foi possível acessar as contas. Tente novamente.', 'storage');
    }
}

/** @param {string} key @param {string} value */
async function saveData(key, value) {
    try {
        await AsyncStorage.setItem(key, value);
    } catch {
        throw new AuthError('Não foi possível salvar os dados. Tente novamente.', 'storage');
    }
}

export async function getSession() {
    try {
        const value = await AsyncStorage.getItem(SESSION_KEY);
        if (!value) return null;
        const session = JSON.parse(value);
        if (typeof session?.name !== 'string' || !session.name.trim() ||
            typeof session?.email !== 'string' || !session.email.trim()) return null;
        return {name: session.name, email: session.email};
    } catch {
        return null;
    }
}

/** @param {string} email */
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

/** @param {{ name: string, email: string, password: string }} data */
export async function registerAccount({name, email, password}) {
    const cleanName = name.trim();
    const cleanEmail = normalizeEmail(email);
    if (!cleanName) throw new AuthError('Informe seu nome completo para criar a conta.', 'name');
    if (!cleanEmail) throw new AuthError('Informe seu e-mail para criar a conta.', 'email');
    if (!EMAIL_PATTERN.test(cleanEmail)) throw new AuthError('Confira o e-mail. Use o formato nome@exemplo.com.', 'email');
    if (!password) throw new AuthError('Crie uma senha para sua conta.', 'password');
    if (password.length < 6) throw new AuthError('A senha precisa ter pelo menos 6 caracteres.', 'password');
    const users = await readUsers();
    if (users.some((/** @type {{ email: string }} */ user) => user.email === cleanEmail)) {
        throw new AuthError('Este e-mail já possui uma conta. Entre ou use outro e-mail.', 'email');
    }
    users.push({name: cleanName, email: cleanEmail, password});
    await saveData(USERS_KEY, JSON.stringify(users));
}

/** @param {{ email: string, password: string }} data */
export async function loginAccount({email, password}) {
    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail) throw new AuthError('Informe o e-mail da sua conta.', 'email');
    if (!EMAIL_PATTERN.test(cleanEmail)) throw new AuthError('Confira o e-mail. Use o formato nome@exemplo.com.', 'email');
    if (!password) throw new AuthError('Informe a senha da sua conta.', 'password');
    const users = await readUsers();
    const user = users.find((/** @type {{ email: string, password: string }} */ item) => item.email === cleanEmail);
    if (!user) throw new AuthError('Nenhuma conta encontrada com este e-mail. Crie uma conta para continuar.', 'email');
    if (user.password !== password) throw new AuthError('Senha incorreta. Confira sua senha e tente novamente.', 'password');
    await saveData(SESSION_KEY, JSON.stringify({name: user.name, email: user.email}));
    return {name: user.name, email: user.email};
}

export async function logoutAccount() {
    try {
        await AsyncStorage.removeItem(SESSION_KEY);
    } catch {
        throw new AuthError('Não foi possível sair da conta. Tente novamente.', 'storage');
    }
}
