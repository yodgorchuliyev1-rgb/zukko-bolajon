'use strict';

const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const COOKIE_NAME = 'zb_admin';
const SESSION_MS = 8 * 60 * 60 * 1000; // 8 soat
const MAX_PASSWORD_LEN = 200;

const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest();
const safeEqual = (a, b) => a.length === b.length && crypto.timingSafeEqual(a, b);

// Qo'lda terish oson bo'lishi uchun o'xshash belgilarsiz (0/O, 1/l/I) alifbo
const PW_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
function randomPassword(length = 12) {
    let out = '';
    for (let i = 0; i < length; i++) out += PW_ALPHABET[crypto.randomInt(PW_ALPHABET.length)];
    return out;
}

function scrypt(password, salt) {
    return new Promise((resolve, reject) => {
        crypto.scrypt(String(password).slice(0, MAX_PASSWORD_LEN), salt, 64, (err, key) => (err ? reject(err) : resolve(key)));
    });
}

/**
 * Admin parolini tayyorlaydi.
 *  1) `password` (ADMIN_PASSWORD muhit o'zgaruvchisi) berilsa, shu ishlatiladi.
 *  2) Aks holda `data/admin/credentials.json` o'qiladi. Fayl yo'q bo'lsa, tasodifiy parol
 *     yaratiladi va FAQAT birinchi marta `generated` ichida qaytariladi (faylda esa faqat hash saqlanadi).
 */
async function loadAdminAuth({ dataDir, password }) {
    if (password) {
        const digest = sha256(String(password).slice(0, MAX_PASSWORD_LEN));
        return {
            source: 'env',
            generated: null,
            verify: async (pw) => safeEqual(sha256(String(pw).slice(0, MAX_PASSWORD_LEN)), digest)
        };
    }

    const dir = path.join(dataDir, 'admin');
    const file = path.join(dir, 'credentials.json');
    let creds = null;
    try {
        creds = JSON.parse(await fs.readFile(file, 'utf8'));
    } catch (err) {
        if (err.code !== 'ENOENT' && !(err instanceof SyntaxError)) throw err;
    }

    let generated = null;
    if (!creds || typeof creds.salt !== 'string' || typeof creds.hash !== 'string') {
        generated = randomPassword();
        const salt = crypto.randomBytes(16);
        const hash = await scrypt(generated, salt);
        creds = { salt: salt.toString('hex'), hash: hash.toString('hex') };
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(file, JSON.stringify(creds), { encoding: 'utf8', mode: 0o600 });
    }

    const salt = Buffer.from(creds.salt, 'hex');
    const want = Buffer.from(creds.hash, 'hex');
    return {
        source: 'file',
        generated,
        verify: async (pw) => safeEqual(await scrypt(pw, salt), want)
    };
}

/** Imzolangan sessiya tokenlari. Maxfiy kalit jarayon bilan birga yangilanadi (qayta ishga tushirsa, qayta kirish kerak). */
function createSessions(secret = crypto.randomBytes(32)) {
    const sign = (exp) => crypto.createHmac('sha256', secret).update(String(exp)).digest('base64url');
    return {
        issue(now = Date.now()) {
            const exp = now + SESSION_MS;
            return `${exp}.${sign(exp)}`;
        },
        check(token, now = Date.now()) {
            if (typeof token !== 'string') return false;
            const [exp, sig] = token.split('.');
            if (!/^\d{10,16}$/.test(exp || '') || !sig) return false;
            if (Number(exp) < now) return false;
            return safeEqual(Buffer.from(sig), Buffer.from(sign(exp)));
        }
    };
}

function parseCookies(header) {
    const out = {};
    String(header || '').split(';').forEach((part) => {
        const i = part.indexOf('=');
        if (i < 0) return;
        const key = part.slice(0, i).trim();
        if (!key) return;
        const raw = part.slice(i + 1).trim();
        try { out[key] = decodeURIComponent(raw); } catch (e) { out[key] = raw; }
    });
    return out;
}

function sessionCookie(token, { secure = false } = {}) {
    const maxAge = token ? Math.floor(SESSION_MS / 1000) : 0;
    return [
        `${COOKIE_NAME}=${token ? encodeURIComponent(token) : ''}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Strict',
        `Max-Age=${maxAge}`,
        secure ? 'Secure' : ''
    ].filter(Boolean).join('; ');
}

/** Oddiy xotiradagi tezlik cheklovi (IP bo'yicha). */
function createLimiter({ max, windowMs }) {
    const hits = new Map();

    function sweep(now) {
        if (hits.size < 2000) return;
        for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);
    }
    function entryFor(key, now) {
        let entry = hits.get(key);
        if (!entry || entry.resetAt <= now) {
            entry = { count: 0, resetAt: now + windowMs };
            hits.set(key, entry);
        }
        return entry;
    }
    const verdict = (entry, now) => ({
        ok: entry.count <= max,
        retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000))
    });

    return {
        /** Hisoblagichni oshirmasdan, bloklanganmi yoki yo'qmi tekshiradi (urinishlar `max` dan oshganda bloklanadi). */
        check(key, now = Date.now()) {
            const entry = hits.get(key);
            if (!entry || entry.resetAt <= now) return { ok: true, retryAfter: 0 };
            return { ok: entry.count < max, retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
        },
        /** Bitta urinishni qayd etadi. */
        hit(key, now = Date.now()) {
            sweep(now);
            const entry = entryFor(key, now);
            entry.count++;
            return verdict(entry, now);
        },
        reset(key) { hits.delete(key); }
    };
}

module.exports = { COOKIE_NAME, SESSION_MS, loadAdminAuth, createSessions, parseCookies, sessionCookie, createLimiter };
