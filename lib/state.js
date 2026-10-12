'use strict';

/**
 * Bolaning saqlanadigan holati (state) uchun tekshiruv va tozalash.
 *
 * Mijoz (index.html) `pickState()` orqali shu kalitlarni yuboradi.
 * Server faqat to'g'ri shakldagi ma'lumotni qabul qiladi, shuning uchun
 * noto'g'ri yoki juda katta ma'lumot diskka yozilmaydi.
 */

const UID_RE = /^[A-Za-z0-9_-]{8,64}$/;

const STATE_KEYS = new Set([
    'auth', 'hero', 'coins', 'prog', 'words', 'math', 'owned', 'equip', 'days',
    'totalSec', 'settings', 'voiceRecords', 'colorsProg', 'reviewHistory', 'certificates',
    'children', 'activeChildId', 'parentPin', 'pinRecovery', 'letterAnalytics'
]);

const HEROES = ['muhammad', 'hadicha'];
const AUTH_TYPES = ['google', 'phone'];
const CERT_TYPES = ['letters', 'numbers', 'all', 'colors'];
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const PROG_KEY_RE = /^[LN]\d{1,2}$/;
const COLOR_KEY_RE = /^\d{1,2}$/;

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isNum = (v, max = 1e9) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= max;
const isStr = (v, max) => typeof v === 'string' && v.length <= max;

/** Hamma qiymatlari tekshiruvdan o'tadigan kichik obyektmi? */
function everyEntry(obj, maxKeys, keyOk, valOk) {
    const keys = Object.keys(obj);
    if (keys.length > maxKeys) return false;
    return keys.every((k) => keyOk(k) && valOk(obj[k]));
}

/**
 * Elektron pochta yoki telefon raqamini yashiradi.
 * Server hech qachon to'liq manzil/raqamni saqlamaydi.
 *   ali@gmail.com  ->  al***@gmail.com
 *   +998901234567  ->  ***4567
 * Allaqachon yashirilgan qiymat (ichida '*' bor) o'zgarmaydi.
 */
function maskId(type, id) {
    const s = String(id == null ? '' : id).trim();
    if (!s) return '';
    if (s.includes('*')) return s.slice(0, 80);
    if (type === 'phone') {
        const digits = s.replace(/\D/g, '');
        return digits.length > 4 ? '***' + digits.slice(-4) : '***';
    }
    const at = s.indexOf('@');
    if (at < 1) return s.slice(0, 2) + '***';
    return s.slice(0, Math.min(2, at)) + '***' + s.slice(at);
}

function isValidChild(c) {
    if (!isObj(c)) return false;
    if (!isStr(c.id, 64) || !isStr(c.name, 64)) return false;
    if (c.avatar !== undefined && c.avatar !== null && !HEROES.includes(c.avatar)) return false;
    if (c.hero !== undefined && c.hero !== null && !HEROES.includes(c.hero)) return false;
    if (c.age !== undefined && !isNum(c.age, 100)) return false;
    if (c.coins !== undefined && !isNum(c.coins)) return false;
    if (c.words !== undefined && !isNum(c.words)) return false;
    if (c.math !== undefined && !isNum(c.math)) return false;
    if (c.totalSec !== undefined && !isNum(c.totalSec)) return false;
    if (c.balloonScore !== undefined && !isNum(c.balloonScore)) return false;
    if (c.prog !== undefined && !validators.prog(c.prog)) return false;
    if (c.days !== undefined && !validators.days(c.days)) return false;
    if (c.settings !== undefined && !validators.settings(c.settings)) return false;
    if (c.owned !== undefined && !validators.owned(c.owned)) return false;
    if (c.equip !== undefined && !validators.equip(c.equip)) return false;
    if (c.certificates !== undefined && !validators.certificates(c.certificates)) return false;
    if (c.stats !== undefined && !isObj(c.stats)) return false;
    if (c.letterAnalytics !== undefined && !isObj(c.letterAnalytics)) return false;
    return true;
}

const validators = {
    auth: (v) => v === null || (isObj(v) && AUTH_TYPES.includes(v.type) && isStr(v.id, 120)),
    hero: (v) => v === null || HEROES.includes(v),
    coins: (v) => isNum(v),
    words: (v) => isNum(v),
    math: (v) => isNum(v),
    totalSec: (v) => isNum(v),
    prog: (v) => isObj(v) && everyEntry(v, 100, (k) => PROG_KEY_RE.test(k), (x) => Number.isInteger(x) && x >= 0 && x <= 3),
    colorsProg: (v) => isObj(v) && everyEntry(v, 50, (k) => COLOR_KEY_RE.test(k), (x) => Number.isInteger(x) && x >= 0 && x <= 3),
    owned: (v) => Array.isArray(v) && v.length <= 200 && v.every((x) => isStr(x, 64)),
    equip: (v) => isObj(v) && everyEntry(
        v, HEROES.length, (k) => HEROES.includes(k),
        (slot) => isObj(slot) && everyEntry(slot, 8, (k) => isStr(k, 16), (x) => x === null || isStr(x, 64))
    ),
    days: (v) => isObj(v) && everyEntry(
        v, 800, (k) => DAY_RE.test(k),
        (d) => isObj(d) && Object.keys(d).length <= 8 && Object.values(d).every((x) => isNum(x, 1e7))
    ),
    settings: (v) => isObj(v) && everyEntry(v, 20, (k) => isStr(k, 24), (x) => typeof x === 'boolean' || isNum(x, 1e6)),
    voiceRecords: (v) => isObj(v) && everyEntry(
        v, 200, (k) => PROG_KEY_RE.test(k),
        (r) => isObj(r) && Object.keys(r).length <= 6 && Object.values(r).every((x) => isNum(x, 1e15))
    ),
    reviewHistory: (v) => isObj(v) && everyEntry(v, 800, (k) => DAY_RE.test(k), (x) => isNum(x, 1e6)),
    certificates: (v) => Array.isArray(v) && v.length <= 10 && v.every((x) => CERT_TYPES.includes(x)),
    children: (v) => Array.isArray(v) && v.length <= 20 && v.every(isValidChild),
    activeChildId: (v) => v === null || isStr(v, 64),
    parentPin: (v) => v === null || isStr(v, 64),
    pinRecovery: (v) => v === null || (isObj(v) && Object.keys(v).length <= 10),
    letterAnalytics: (v) => v === null || (isObj(v) && Object.keys(v).length <= 100)
};

function isValidState(state) {
    if (!isObj(state)) return false;
    return Object.keys(state).every((key) => STATE_KEYS.has(key) && validators[key](state[key]));
}

/** Saqlashdan oldin: auth ichidagi pochta/telefon yashiriladi. */
function sanitizeState(state) {
    const out = { ...state };
    if (out.auth) out.auth = { type: out.auth.type, id: maskId(out.auth.type, out.auth.id) };
    return out;
}

module.exports = { UID_RE, STATE_KEYS, isValidState, sanitizeState, maskId, isValidChild };
