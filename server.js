'use strict';

const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const express = require('express');
const { UID_RE, isValidState, sanitizeState, maskId } = require('./lib/state');
const { computeStats, dayKey, lastKeys } = require('./lib/stats');
const {
    COOKIE_NAME, loadAdminAuth, createSessions, parseCookies, sessionCookie, createLimiter
} = require('./lib/admin-auth');

const ROOT = __dirname;
const PUBLIC_FILES = new Set(['index.html', 'style.css', 'manifest.json', 'service-worker.js']);
const USER_FILE_RE = /^[A-Za-z0-9_-]{8,64}\.json$/;
const STATS_TTL_MS = 5000;

/** data/ papkasidagi barcha foydalanuvchi hujjatlarini o'qiydi (buzuq fayllar o'tkazib yuboriladi). */
async function readAllUsers(dataDir) {
    let entries;
    try {
        entries = await fs.readdir(dataDir, { withFileTypes: true });
    } catch (err) {
        if (err.code === 'ENOENT') return [];
        throw err;
    }
    const files = entries.filter((e) => e.isFile() && USER_FILE_RE.test(e.name)).map((e) => e.name);
    const docs = [];
    for (let i = 0; i < files.length; i += 50) {
        const batch = await Promise.all(files.slice(i, i + 50).map(async (name) => {
            try {
                const doc = JSON.parse(await fs.readFile(path.join(dataDir, name), 'utf8'));
                if (!doc || typeof doc !== 'object' || !doc.state || typeof doc.state !== 'object') return null;
                return { uid: name.slice(0, -'.json'.length), createdAt: doc.createdAt, updatedAt: doc.updatedAt, state: doc.state };
            } catch (err) {
                return null;
            }
        }));
        for (const d of batch) if (d) docs.push(d);
    }
    return docs;
}

function createApp({
    dataDir = process.env.ZB_DATA_DIR || path.join(ROOT, 'data'),
    adminPassword = process.env.ADMIN_PASSWORD,
    clock = Date.now
} = {}) {
    const app = express();
    const queues = new Map();
    let statsCache = null;

    app.disable('x-powered-by');
    app.set('trust proxy', process.env.TRUST_PROXY === '1');

    // ---- Admin: parol, sessiya, cheklovlar ----
    const adminReady = loadAdminAuth({ dataDir, password: adminPassword });
    adminReady.catch(() => { }); // xato so'rov paytida await qilinganda qaytariladi
    app.locals.adminReady = adminReady;
    const sessions = createSessions();
    const loginLimiter = createLimiter({ max: 8, windowMs: 10 * 60 * 1000 });
    const writeLimiter = createLimiter({ max: 600, windowMs: 60 * 1000 });
    const isHttps = (req) => !!req.secure || req.headers['x-forwarded-proto'] === 'https';

    /**
     * Hujjatni navbat bilan, buzilmaydigan tarzda yozadi.
     * `build(prev)` oldingi hujjatni (bo'lsa) oladi va yangisini qaytaradi.
     */
    function saveDoc(uid, build) {
        const file = path.join(dataDir, `${uid}.json`);
        const prev = queues.get(uid) || Promise.resolve();
        const run = prev.catch(() => { }).then(async () => {
            await fs.mkdir(dataDir, { recursive: true });
            let existing = null;
            try { existing = JSON.parse(await fs.readFile(file, 'utf8')); } catch (err) { existing = null; }
            const doc = build(existing);
            if (!doc) return null;
            const tmp = `${file}.${crypto.randomUUID()}.tmp`;
            await fs.writeFile(tmp, JSON.stringify(doc), 'utf8');
            await fs.rename(tmp, file);
            return doc;
        });
        queues.set(uid, run);
        const cleanup = () => { if (queues.get(uid) === run) queues.delete(uid); };
        run.then(cleanup, cleanup);
        return run;
    }

    /**
     * Eski versiya to'liq pochta/telefonni saqlagan bo'lishi mumkin. Ishga tushganda ularni yashiradi.
     * `updatedAt` o'zgarmaydi, shuning uchun mijozlarda ortiqcha sinxronlash bo'lmaydi.
     */
    async function maskExistingDocs() {
        const docs = await readAllUsers(dataDir);
        let masked = 0;
        for (const d of docs) {
            const auth = d.state && d.state.auth;
            if (!auth || typeof auth.id !== 'string' || auth.id.includes('*')) continue;
            await saveDoc(d.uid, (prev) => {
                if (!prev || !prev.state || !prev.state.auth) return null;
                return { ...prev, state: sanitizeState(prev.state) };
            });
            masked++;
        }
        return masked;
    }
    app.locals.maskingDone = maskExistingDocs().catch((err) => {
        console.error('Eski ma\'lumotlarni yashirishda xato:', err);
        return 0;
    });

    async function getStats() {
        const t = clock();
        if (statsCache && t - statsCache.at < STATS_TTL_MS) return statsCache.value;
        const docs = await readAllUsers(dataDir);
        const value = computeStats(docs, { now: t });
        statsCache = { at: t, value };
        return value;
    }

    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'no-referrer');
        res.setHeader('X-Frame-Options', 'DENY');
        next();
    });

    app.use('/api', express.json({ limit: '256kb' }));

    app.get('/api/health', (req, res) => {
        res.json({ ok: true });
    });

    // ---- Bola holati ----
    app.get('/api/state/:uid', async (req, res, next) => {
        const { uid } = req.params;
        if (!UID_RE.test(uid)) return res.status(400).json({ error: 'invalid uid' });
        try {
            const raw = await fs.readFile(path.join(dataDir, `${uid}.json`), 'utf8');
            res.json(JSON.parse(raw));
        } catch (err) {
            if (err.code === 'ENOENT') return res.status(404).json({ error: 'not found' });
            next(err);
        }
    });

    app.put('/api/state/:uid', async (req, res, next) => {
        const { uid } = req.params;
        if (!UID_RE.test(uid)) return res.status(400).json({ error: 'invalid uid' });
        const limit = writeLimiter.hit(req.ip || 'unknown');
        if (!limit.ok) {
            res.set('Retry-After', String(limit.retryAfter));
            return res.status(429).json({ error: 'too many requests' });
        }
        const state = req.body && req.body.state;
        if (!isValidState(state)) return res.status(400).json({ error: 'invalid state' });
        try {
            const doc = await saveDoc(uid, (prev) => {
                const createdAt = prev ? Number(prev.createdAt) || undefined : clock();
                return { createdAt, updatedAt: clock(), state: sanitizeState(state) };
            });
            statsCache = null;
            res.json({ ok: true, updatedAt: doc.updatedAt });
        } catch (err) {
            next(err);
        }
    });

    // ---- Ko'p profilli oila tizimi & Bolalar API ----
    function extractUid(req) {
        const raw = req.params.uid || req.query.uid || req.headers['x-user-uid'] || (req.body && req.body.uid);
        if (typeof raw === 'string' && UID_RE.test(raw)) return raw;
        return null;
    }

    function ensureChildren(doc) {
        if (!doc || !doc.state) return [];
        if (!Array.isArray(doc.state.children)) {
            const s = doc.state;
            const hasActivity = !!(s.hero || s.coins || s.totalSec || (s.prog && Object.keys(s.prog).length > 0) || (s.days && Object.keys(s.days).length > 0));
            if (hasActivity) {
                const defaultChild = {
                    id: 'c_default',
                    name: s.hero === 'hadicha' ? 'Hadicha' : 'Muhammad',
                    avatar: s.hero || 'muhammad',
                    hero: s.hero || 'muhammad',
                    age: 6,
                    coins: typeof s.coins === 'number' ? s.coins : 0,
                    prog: s.prog || {},
                    words: typeof s.words === 'number' ? s.words : 0,
                    math: typeof s.math === 'number' ? s.math : 0,
                    owned: Array.isArray(s.owned) ? s.owned : ['h_d1', 'o_m1', 'o_h1'],
                    equip: s.equip || { muhammad: { hat: 'h_d1', glasses: null, outfit: 'o_m1', acc: null }, hadicha: { hat: null, glasses: null, outfit: 'o_h1', acc: null } },
                    days: s.days || {},
                    totalSec: typeof s.totalSec === 'number' ? s.totalSec : 0,
                    settings: s.settings || { breakMin: 10, gameMin: 5, dailyMin: 0, sound: true, music: true },
                    voiceRecords: s.voiceRecords || {},
                    colorsProg: s.colorsProg || {},
                    reviewHistory: s.reviewHistory || {},
                    certificates: Array.isArray(s.certificates) ? s.certificates : [],
                    balloonScore: 0
                };
                doc.state.children = [defaultChild];
                if (!doc.state.activeChildId) doc.state.activeChildId = defaultChild.id;
            } else {
                doc.state.children = [];
            }
        }
        return doc.state.children;
    }

    app.get('/api/children', async (req, res, next) => {
        const uid = extractUid(req);
        if (!uid) return res.status(400).json({ error: 'invalid uid' });
        try {
            let doc = null;
            try {
                const raw = await fs.readFile(path.join(dataDir, `${uid}.json`), 'utf8');
                doc = JSON.parse(raw);
            } catch (err) {
                if (err.code !== 'ENOENT') throw err;
            }
            if (!doc) {
                return res.json({ ok: true, children: [], activeChildId: null });
            }
            const children = ensureChildren(doc);
            res.json({ ok: true, children, activeChildId: doc.state.activeChildId || (children[0] && children[0].id) || null });
        } catch (err) {
            next(err);
        }
    });

    app.post('/api/children', async (req, res, next) => {
        const uid = extractUid(req);
        if (!uid) return res.status(400).json({ error: 'invalid uid' });
        const limit = writeLimiter.hit(req.ip || 'unknown');
        if (!limit.ok) {
            res.set('Retry-After', String(limit.retryAfter));
            return res.status(429).json({ error: 'too many requests' });
        }
        const data = (req.body && (req.body.child || req.body)) || {};
        const name = String(data.name || '').trim();
        if (!name || name.length > 40) return res.status(400).json({ error: 'child name required (max 40 chars)' });
        const avatar = data.avatar === 'hadicha' ? 'hadicha' : 'muhammad';
        const age = Math.max(2, Math.min(18, Number(data.age) || 5));
        const childId = 'c_' + Date.now().toString(36) + '_' + crypto.randomBytes(3).toString('hex');
        const newChild = {
            id: childId,
            name,
            avatar,
            hero: avatar,
            age,
            coins: 0,
            prog: {},
            words: 0,
            math: 0,
            owned: ['h_d1', 'o_m1', 'o_h1'],
            equip: { muhammad: { hat: 'h_d1', glasses: null, outfit: 'o_m1', acc: null }, hadicha: { hat: null, glasses: null, outfit: 'o_h1', acc: null } },
            days: {},
            totalSec: 0,
            settings: { breakMin: 10, gameMin: 5, dailyMin: 0, sound: true, music: true },
            voiceRecords: {},
            colorsProg: {},
            reviewHistory: {},
            certificates: [],
            balloonScore: 0
        };
        try {
            const doc = await saveDoc(uid, (prev) => {
                const createdAt = prev ? Number(prev.createdAt) || undefined : clock();
                const state = prev && prev.state ? { ...prev.state } : { auth: null };
                const children = ensureChildren({ state });
                children.push(newChild);
                state.children = children;
                if (!state.activeChildId || children.length === 1) state.activeChildId = newChild.id;
                return { createdAt, updatedAt: clock(), state: sanitizeState(state) };
            });
            statsCache = null;
            res.json({ ok: true, child: newChild, children: doc.state.children, activeChildId: doc.state.activeChildId });
        } catch (err) {
            next(err);
        }
    });

    app.post('/api/children/:id/switch', async (req, res, next) => {
        const uid = extractUid(req);
        if (!uid) return res.status(400).json({ error: 'invalid uid' });
        const { id } = req.params;
        try {
            let switched = null;
            const doc = await saveDoc(uid, (prev) => {
                if (!prev || !prev.state) return null;
                const state = { ...prev.state };
                const children = ensureChildren({ state });
                switched = children.find(c => c.id === id);
                if (!switched) return null;
                state.activeChildId = id;
                state.hero = switched.hero || switched.avatar || 'muhammad';
                state.coins = switched.coins || 0;
                state.prog = switched.prog || {};
                state.words = switched.words || 0;
                state.math = switched.math || 0;
                state.owned = switched.owned || ['h_d1', 'o_m1', 'o_h1'];
                state.equip = switched.equip || { muhammad: { hat: 'h_d1', glasses: null, outfit: 'o_m1', acc: null }, hadicha: { hat: null, glasses: null, outfit: 'o_h1', acc: null } };
                state.days = switched.days || {};
                state.totalSec = switched.totalSec || 0;
                state.settings = switched.settings || { breakMin: 10, gameMin: 5, dailyMin: 0, sound: true, music: true };
                state.voiceRecords = switched.voiceRecords || {};
                state.colorsProg = switched.colorsProg || {};
                state.reviewHistory = switched.reviewHistory || {};
                state.certificates = switched.certificates || [];
                return { ...prev, updatedAt: clock(), state: sanitizeState(state) };
            });
            if (!doc || !switched) return res.status(404).json({ error: 'child not found' });
            statsCache = null;
            res.json({ ok: true, activeChildId: id, child: switched });
        } catch (err) {
            next(err);
        }
    });

    app.post('/api/children/:id/stats', async (req, res, next) => {
        const uid = extractUid(req);
        if (!uid) return res.status(400).json({ error: 'invalid uid' });
        const { id } = req.params;
        const body = req.body || {};
        try {
            let updatedChild = null;
            const today = dayKey(clock());
            const doc = await saveDoc(uid, (prev) => {
                if (!prev || !prev.state) return null;
                const state = { ...prev.state };
                const children = ensureChildren({ state });
                const child = children.find(c => c.id === id);
                if (!child) return null;
                if (typeof body.sec === 'number' && body.sec > 0) {
                    child.totalSec = (child.totalSec || 0) + body.sec;
                    const d = child.days[today] || (child.days[today] = { sec: 0, ex: 0, lessons: 0 });
                    d.sec += body.sec;
                }
                if (typeof body.ex === 'number' && body.ex > 0) {
                    const d = child.days[today] || (child.days[today] = { sec: 0, ex: 0, lessons: 0 });
                    d.ex += body.ex;
                }
                if (typeof body.lessons === 'number' && body.lessons > 0) {
                    const d = child.days[today] || (child.days[today] = { sec: 0, ex: 0, lessons: 0 });
                    d.lessons += body.lessons;
                }
                if (typeof body.balloonScore === 'number') {
                    child.balloonScore = Math.max(child.balloonScore || 0, body.balloonScore);
                }
                if (body.progKey && typeof body.progVal === 'number') {
                    if (!child.prog) child.prog = {};
                    child.prog[body.progKey] = Math.max(child.prog[body.progKey] || 0, Math.min(3, body.progVal));
                }
                if (typeof body.coins === 'number') {
                    child.coins = Math.max(0, body.coins);
                }
                if (typeof body.words === 'number') {
                    child.words = Math.max(0, body.words);
                }
                if (typeof body.math === 'number') {
                    child.math = Math.max(0, body.math);
                }
                if (body.dailyMin !== undefined && typeof body.dailyMin === 'number') {
                    if (!child.settings) child.settings = {};
                    child.settings.dailyMin = body.dailyMin;
                }
                updatedChild = child;
                if (state.activeChildId === id) {
                    state.coins = child.coins;
                    state.totalSec = child.totalSec;
                    state.days = child.days;
                    state.prog = child.prog;
                    state.words = child.words;
                    state.math = child.math;
                    if (child.settings) state.settings = { ...(state.settings || {}), ...child.settings };
                }
                return { ...prev, updatedAt: clock(), state: sanitizeState(state) };
            });
            if (!doc || !updatedChild) return res.status(404).json({ error: 'child not found' });
            statsCache = null;
            res.json({ ok: true, child: updatedChild });
        } catch (err) {
            next(err);
        }
    });

    app.post('/api/auth/parent/pin-recover', async (req, res, next) => {
        const uid = extractUid(req);
        if (!uid) return res.status(400).json({ error: 'invalid uid' });
        const { action = 'request', code, newPin, answer } = req.body || {};
        try {
            if (action === 'request') {
                const otp = String(crypto.randomInt(100000, 999999));
                const expiresAt = clock() + 10 * 60 * 1000;
                await saveDoc(uid, (prev) => {
                    const state = prev && prev.state ? { ...prev.state } : { auth: null };
                    state.pinRecovery = { code: otp, expiresAt, sentAt: clock() };
                    return { ...(prev || { createdAt: clock() }), updatedAt: clock(), state: sanitizeState(state) };
                });
                return res.json({
                    ok: true,
                    message: '6 xonali tiklash kodi (OTP) yuborildi',
                    code: otp,
                    expiresAt
                });
            } else if (action === 'verify') {
                let verified = false;
                await saveDoc(uid, (prev) => {
                    if (!prev || !prev.state) return null;
                    const rec = prev.state.pinRecovery;
                    const codeMatches = rec && rec.code && String(rec.code) === String(code) && clock() <= (rec.expiresAt || 0);
                    const answerMatches = rec && rec.answer && String(rec.answer).toLowerCase() === String(answer).toLowerCase();
                    if (!codeMatches && !answerMatches) return null;
                    verified = true;
                    const state = { ...prev.state };
                    state.parentPin = String(newPin || '1234').slice(0, 8);
                    state.pinRecovery = null;
                    return { ...prev, updatedAt: clock(), state: sanitizeState(state) };
                });
                if (!verified) {
                    return res.status(400).json({ error: 'Kod noto\'g\'ri yoki muddati o\'tgan' });
                }
                return res.json({ ok: true, message: 'PIN-kod muvaffaqiyatli yangilandi' });
            } else {
                return res.status(400).json({ error: 'invalid action' });
            }
        } catch (err) {
            next(err);
        }
    });

    app.get('/api/superadmin/analytics', async (req, res, next) => {
        try {
            const docs = await readAllUsers(dataDir);
            const now = clock();
            const today = dayKey(now);
            const keys7 = new Set(lastKeys(now, 7));
            const keys30 = new Set(lastKeys(now, 30));

            let totalChildren = 0;
            let activeChildrenToday = 0;
            let activeChildren7 = 0;
            let activeChildren30 = 0;
            let totalPracticeSec = 0;
            let totalBalloonGames = 0;
            let totalLettersMastered = 0;
            let totalPossibleLetters = 0;
            const heroCounts = { muhammad: 0, hadicha: 0 };
            const familiesList = [];

            const dailyTimeline = new Map(lastKeys(now, 14).map(k => [k, { date: k, activeChildren: 0, minutes: 0 }]));

            for (const d of docs) {
                const s = d.state || {};
                const children = Array.isArray(s.children) && s.children.length ? s.children : [{
                    id: 'c_default',
                    name: s.hero === 'hadicha' ? 'Hadicha' : 'Muhammad',
                    avatar: s.hero || 'muhammad',
                    hero: s.hero || 'muhammad',
                    coins: s.coins || 0,
                    prog: s.prog || {},
                    days: s.days || {},
                    totalSec: s.totalSec || 0,
                    balloonScore: 0
                }];

                totalChildren += children.length;
                let familyMinutes = 0;
                let familyLetters = 0;

                for (const c of children) {
                    const hero = c.avatar || c.hero || 'muhammad';
                    heroCounts[hero] = (heroCounts[hero] || 0) + 1;
                    const sec = Number(c.totalSec) || 0;
                    totalPracticeSec += sec;
                    familyMinutes += Math.round(sec / 60);

                    if (typeof c.balloonScore === 'number' && c.balloonScore > 0) totalBalloonGames++;

                    const prog = c.prog || {};
                    let mastered = 0;
                    for (let i = 0; i < 29; i++) {
                        if (prog['L' + i] === 3) mastered++;
                    }
                    totalLettersMastered += mastered;
                    familyLetters += mastered;
                    totalPossibleLetters += 29;

                    const activeDays = Object.keys(c.days || {}).filter(k => (c.days[k].sec > 0 || c.days[k].ex > 0));
                    if (activeDays.includes(today)) activeChildrenToday++;
                    if (activeDays.some(k => keys7.has(k))) activeChildren7++;
                    if (activeDays.some(k => keys30.has(k))) activeChildren30++;

                    for (const k of dailyTimeline.keys()) {
                        const dayData = (c.days || {})[k];
                        if (dayData && (dayData.sec > 0 || dayData.ex > 0)) {
                            const row = dailyTimeline.get(k);
                            row.activeChildren++;
                            row.minutes += Math.round((dayData.sec || 0) / 60);
                        }
                    }
                }

                familiesList.push({
                    uid: d.uid,
                    authType: s.auth ? s.auth.type : 'none',
                    authId: s.auth ? maskId(s.auth.type, s.auth.id) : 'Anonim',
                    childrenCount: children.length,
                    childrenNames: children.map(c => c.name),
                    totalMinutes: familyMinutes,
                    lettersMastered: familyLetters,
                    lastActive: d.updatedAt || 0,
                    createdAt: d.createdAt || 0
                });
            }

            const avgMinutesPerChild = totalChildren ? Math.round((totalPracticeSec / 60 / totalChildren) * 10) / 10 : 0;
            const letterMasteryRate = totalPossibleLetters ? Math.round((totalLettersMastered / totalPossibleLetters) * 100) : 0;

            res.json({
                ok: true,
                generatedAt: now,
                totalFamilies: docs.length,
                totalChildren,
                activeChildrenToday,
                activeChildrenLast7: activeChildren7,
                activeChildrenLast30: activeChildren30,
                avgMinutesPerChild,
                letterMasteryRate,
                totalBalloonGames,
                heroes: heroCounts,
                timeline: Array.from(dailyTimeline.values()),
                families: familiesList.sort((a, b) => b.lastActive - a.lastActive)
            });
        } catch (err) {
            next(err);
        }
    });

    // ---- Admin API ----
    function adminOnly(req, res, next) {
        res.set('Cache-Control', 'no-store');
        const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
        if (!sessions.check(token, clock())) return res.status(401).json({ error: 'unauthorized' });
        next();
    }

    app.post('/api/admin/login', async (req, res, next) => {
        res.set('Cache-Control', 'no-store');
        const ip = req.ip || 'unknown';
        // Urinish tekshirishdan OLDIN hisoblanadi: parallel so'rovlar bilan parolni terib bo'lmaydi.
        const gate = loginLimiter.hit(ip);
        if (!gate.ok) {
            res.set('Retry-After', String(gate.retryAfter));
            return res.status(429).json({ error: 'too many attempts', retryAfter: gate.retryAfter });
        }
        const password = req.body && req.body.password;
        if (typeof password !== 'string' || !password) return res.status(400).json({ error: 'password required' });
        try {
            const auth = await adminReady;
            if (!(await auth.verify(password))) return res.status(401).json({ error: 'wrong password' });
            loginLimiter.reset(ip);
            res.set('Set-Cookie', sessionCookie(sessions.issue(clock()), { secure: isHttps(req) }));
            res.json({ ok: true });
        } catch (err) {
            next(err);
        }
    });

    app.post('/api/admin/logout', (req, res) => {
        res.set('Cache-Control', 'no-store');
        res.set('Set-Cookie', sessionCookie(null, { secure: isHttps(req) }));
        res.json({ ok: true });
    });

    app.get('/api/admin/session', adminOnly, (req, res) => {
        res.json({ ok: true });
    });

    app.get('/api/admin/stats', adminOnly, async (req, res, next) => {
        try {
            res.json(await getStats());
        } catch (err) {
            next(err);
        }
    });

    app.use('/api', (req, res) => {
        res.status(404).json({ error: 'not found' });
    });

    // ---- Sahifalar ----
    app.get(['/admin', '/admin/'], (req, res) => {
        res.sendFile(path.join(ROOT, 'admin.html'), {
            dotfiles: 'allow',
            headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' }
        });
    });

    app.get('/', (req, res) => {
        res.sendFile(path.join(ROOT, 'index.html'), { dotfiles: 'allow', headers: { 'Cache-Control': 'no-cache' } });
    });

    app.get(/^\/[A-Za-z0-9._-]+$/, (req, res, next) => {
        const name = req.path.slice(1);
        if (!PUBLIC_FILES.has(name)) return next();
        res.sendFile(path.join(ROOT, name), { dotfiles: 'allow', headers: { 'Cache-Control': 'no-cache' } });
    });

    app.use((req, res) => {
        res.status(404).send('Not found');
    });

    app.use((err, req, res, next) => {
        if (res.headersSent) return next(err);
        const status = err.status || err.statusCode || 500;
        if (status >= 500) console.error(err);
        const message = status >= 500 ? 'server error' : err.message;
        if (req.path.startsWith('/api')) return res.status(status).json({ error: message });
        res.status(status).send(message);
    });

    return app;
}

module.exports = { createApp, isValidState, readAllUsers };

if (require.main === module) {
    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || '127.0.0.1';
    const app = createApp();
    const server = app.listen(port, host, () => {
        console.log(`Zukko Bolajon: http://${host}:${port}`);
        console.log(`Admin panel:   http://${host}:${port}/admin`);
    });
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') console.error(`${port}-port band. Boshqa port tanlang, masalan: PORT=3001 npm start`);
        else console.error(err);
        process.exit(1);
    });
    app.locals.maskingDone.then((n) => {
        if (n) console.log(`Eski ma'lumotlardan ${n} ta pochta/telefon yashirildi.`);
    });
    app.locals.adminReady.then((auth) => {
        if (auth.generated) {
            console.log('');
            console.log(`Admin paroli yaratildi: ${auth.generated}`);
            console.log('Uni hozir saqlab oling: keyingi safar ko\'rsatilmaydi (faylda faqat hash bor).');
            console.log('O\'zingizning parolingizni qo\'yish uchun ADMIN_PASSWORD muhit o\'zgaruvchisidan foydalaning.');
            console.log('');
        } else if (auth.source === 'env') {
            console.log('Admin paroli ADMIN_PASSWORD dan olindi.');
        }
    }).catch((err) => {
        console.error('Admin paroli sozlanmadi:', err);
    });
}
