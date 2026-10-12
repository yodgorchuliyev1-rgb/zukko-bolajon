'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { isValidState, sanitizeState, maskId } = require('../lib/state');
const { computeStats, dayKey, lastKeys } = require('../lib/stats');
const { createLimiter, createSessions, parseCookies, sessionCookie } = require('../lib/admin-auth');

/** index.html dagi defaults() bilan bir xil shakl */
function clientDefaults() {
    return {
        auth: null, hero: null, coins: 0, prog: {}, words: 0, math: 0,
        owned: ['h_d1', 'o_m1', 'o_h1'],
        equip: {
            muhammad: { hat: 'h_d1', glasses: null, outfit: 'o_m1', acc: null },
            hadicha: { hat: null, glasses: null, outfit: 'o_h1', acc: null }
        },
        days: {}, totalSec: 0,
        settings: { breakMin: 10, gameMin: 5, dailyMin: 0, sound: true, music: true },
        voiceRecords: {}, colorsProg: {}, reviewHistory: {}, certificates: []
    };
}

test('maskId: pochta va telefon yashiriladi', () => {
    assert.equal(maskId('google', 'ali@gmail.com'), 'al***@gmail.com');
    assert.equal(maskId('google', 'a@x.uz'), 'a***@x.uz');
    assert.equal(maskId('phone', '+998 90 123 45 67'), '***4567');
    assert.equal(maskId('phone', '123'), '***');
    assert.equal(maskId('google', 'al***@gmail.com'), 'al***@gmail.com', 'ikki marta yashirilmaydi');
    assert.equal(maskId('google', ''), '');
});

test('isValidState: mijozning boshlang\'ich holati qabul qilinadi', () => {
    assert.equal(isValidState(clientDefaults()), true);
});

test('isValidState: to\'ldirilgan haqiqiy holat qabul qilinadi', () => {
    const s = clientDefaults();
    s.auth = { type: 'google', id: 'ali@gmail.com' };
    s.hero = 'hadicha'; s.coins = 41; s.words = 3; s.math = 7; s.totalSec = 5123;
    s.prog = { L0: 3, L1: 2, N0: 3, N9: 1 };
    s.days = { '2026-10-12': { sec: 600, ex: 12, lessons: 2 } };
    s.voiceRecords = { L0: { best: 80, tries: 2, at: 1760000000000 } };
    s.reviewHistory = { '2026-10-12': 2 };
    s.colorsProg = { 0: 2, 3: 1 };
    s.certificates = ['letters'];
    assert.equal(isValidState(s), true);
});

test('isValidState: noto\'g\'ri ma\'lumot rad etiladi', () => {
    const bad = (mut) => { const s = clientDefaults(); mut(s); return isValidState(s); };
    assert.equal(isValidState(null), false);
    assert.equal(isValidState([]), false);
    assert.equal(bad((s) => { s.extra = 1; }), false, 'noma\'lum kalit');
    assert.equal(bad((s) => { s.coins = -1; }), false);
    assert.equal(bad((s) => { s.coins = 'ko\'p'; }), false);
    assert.equal(bad((s) => { s.hero = 'hacker'; }), false);
    assert.equal(bad((s) => { s.prog = { L0: 7 }; }), false);
    assert.equal(bad((s) => { s.prog = { evil: 1 }; }), false);
    assert.equal(bad((s) => { s.auth = { type: 'sms', id: 'x' }; }), false);
    assert.equal(bad((s) => { s.owned = [1, 2]; }), false);
    assert.equal(bad((s) => { s.days = { 'kecha': { sec: 1 } }; }), false);
    assert.equal(bad((s) => { s.certificates = ['hacker']; }), false);
    assert.equal(bad((s) => { s.settings = { a: {} }; }), false);
});

test('sanitizeState: auth maskalanadi, asl obyekt o\'zgarmaydi', () => {
    const s = clientDefaults();
    s.auth = { type: 'phone', id: '+998901234567' };
    const out = sanitizeState(s);
    assert.equal(out.auth.id, '***4567');
    assert.equal(s.auth.id, '+998901234567');
});

test('computeStats: foydalanuvchilar soni va asosiy ko\'rsatkichlar', () => {
    const now = new Date(2026, 9, 12, 15, 0, 0).getTime(); // 12-oktyabr 2026
    const today = dayKey(now);
    const yesterday = lastKeys(now, 2)[0];
    const old = '2026-08-01';

    const allLetters = {}; for (let i = 0; i < 29; i++) allLetters['L' + i] = 3;
    const allDigits = {}; for (let i = 0; i < 10; i++) allDigits['N' + i] = 3;

    const a = clientDefaults(); // to'liq o'rgangan, bugun faol
    a.auth = { type: 'google', id: 'ali@gmail.com' }; a.hero = 'muhammad';
    a.prog = { ...allLetters, ...allDigits }; a.words = 4; a.math = 2; a.coins = 50; a.totalSec = 3600;
    a.days = { [today]: { sec: 600, ex: 10, lessons: 2 }, [yesterday]: { sec: 300, ex: 5, lessons: 1 } };
    a.certificates = ['letters', 'numbers', 'all']; a.owned = ['h_d1', 'o_m1', 'o_h1', 'h_cap'];

    const b = clientDefaults(); // boshlagan, kecha faol
    b.auth = { type: 'phone', id: '+998901112233' }; b.hero = 'hadicha';
    b.prog = { L0: 3, L1: 1 }; b.totalSec = 300; b.coins = 6;
    b.days = { [yesterday]: { sec: 300, ex: 3, lessons: 1 } };
    b.settings.dailyMin = 30; b.settings.sound = false;

    const c = clientDefaults(); // hisobdan chiqqan, eski
    c.days = { [old]: { sec: 60, ex: 1, lessons: 0 } };

    const docs = [
        { uid: 'aaaaaaaa11111111', createdAt: now - 20 * 86400000, updatedAt: now - 3600000, state: a },
        { uid: 'bbbbbbbb22222222', createdAt: now - 86400000, updatedAt: now - 7200000, state: b },
        { uid: 'cccccccc33333333', updatedAt: now - 70 * 86400000, state: c }
    ];
    const st = computeStats(docs, { now });

    assert.equal(st.totals.users, 3);
    assert.equal(st.totals.registered, 2);
    assert.equal(st.totals.loggedOut, 1);
    assert.deepEqual(st.active, { today: 1, last7: 2, last30: 2 });
    assert.equal(st.newUsers.last7, 1, 'faqat b so\'nggi 7 kunda qo\'shilgan');
    assert.equal(st.newUsers.last30, 2, 'a (20 kun oldin) va b 30 kunlik oynaga tushadi, c esa yo\'q');
    assert.deepEqual(st.heroes, { muhammad: 1, hadicha: 1, none: 1 });
    assert.deepEqual(st.auth, { google: 1, phone: 1, none: 1 });
    assert.equal(st.engagement.totalExercises, 10 + 5 + 3 + 1);
    assert.equal(st.engagement.totalCoins, 56);
    assert.equal(st.certificates.all, 1);
    assert.equal(st.extras.shopBuyers, 1);
    assert.equal(st.extras.dailyLimitUsers, 1);
    assert.equal(st.extras.soundOff, 1);

    assert.equal(st.letters.done[0], 2, 'L0 ni ikkalasi tugatgan');
    assert.equal(st.letters.done[1], 1);
    assert.equal(st.letters.started[1], 1, 'b L1 ni boshlagan');
    assert.equal(st.digits.done[5], 1);

    const f = Object.fromEntries(st.funnel.map((x) => [x.key, x.count]));
    assert.equal(f.registered, 3);
    assert.equal(f.allLetters, 1);
    assert.equal(f.unlocked, 1);
    assert.equal(f.playedWords, 1);
    assert.equal(f.certificate, 1);

    assert.equal(st.daily.length, 14);
    assert.equal(st.daily[13].date, today);
    assert.equal(st.daily[13].active, 1);
    assert.equal(st.daily[12].active, 2);
    assert.equal(st.daily[12].exercises, 8);

    // Jadval: eng so'nggi faol birinchi; to'liq pochta/telefon chiqmaydi
    assert.equal(st.users[0].id, 'aaaaaaaa');
    const dump = JSON.stringify(st);
    assert.ok(!dump.includes('ali@gmail.com'));
    assert.ok(!dump.includes('+998901112233'));
    assert.equal(st.users[0].authId, 'al***@gmail.com');
});

test('computeStats: bo\'sh ro\'yxat va buzuq hujjat yiqitmaydi', () => {
    const empty = computeStats([], { now: Date.now() });
    assert.equal(empty.totals.users, 0);
    assert.equal(empty.daily.length, 14);
    assert.equal(empty.engagement.avgMinutesPerUser, 0);

    const odd = computeStats([{ uid: 'dddddddd44444444', state: { days: 'xato', prog: null, auth: { type: 'google', id: null } } }], { now: Date.now() });
    assert.equal(odd.totals.users, 1);
});

test('createLimiter: urinishlar chegaradan oshganda bloklaydi', () => {
    const lim = createLimiter({ max: 3, windowMs: 1000 });
    assert.equal(lim.hit('ip', 0).ok, true);
    assert.equal(lim.hit('ip', 1).ok, true);
    assert.equal(lim.hit('ip', 2).ok, true);
    assert.equal(lim.hit('ip', 3).ok, false);
    assert.equal(lim.hit('boshqa', 3).ok, true);
    assert.equal(lim.hit('ip', 1500).ok, true, 'oyna tugagach qayta ochiladi');
    lim.hit('x', 0); lim.hit('x', 0); lim.hit('x', 0); lim.hit('x', 0);
    lim.reset('x');
    assert.equal(lim.hit('x', 0).ok, true);
});

test('createSessions: token imzosi va muddati tekshiriladi', () => {
    const s = createSessions(Buffer.from('maxfiy-kalit-1234567890'));
    const t = s.issue(1_000_000_000_000);
    assert.equal(s.check(t, 1_000_000_000_000 + 1000), true);
    assert.equal(s.check(t, 1_000_000_000_000 + 9 * 3600 * 1000), false, 'muddati o\'tgan');
    assert.equal(s.check(t.slice(0, -2) + 'xx', 1_000_000_000_000 + 1000), false, 'soxta imzo');
    assert.equal(s.check('', 0), false);
    assert.equal(s.check(undefined, 0), false);
    const other = createSessions(Buffer.from('boshqa-kalit-0987654321'));
    assert.equal(other.check(t, 1_000_000_000_000 + 1000), false, 'boshqa kalit bilan imzolangan');
});

test('cookie: o\'qish va yozish', () => {
    assert.deepEqual(parseCookies('a=1; zb_admin=abc%20d; bad'), { a: '1', zb_admin: 'abc d' });
    const c = sessionCookie('tok', { secure: true });
    assert.match(c, /HttpOnly/);
    assert.match(c, /SameSite=Strict/);
    assert.match(c, /Secure/);
    assert.match(sessionCookie(null), /Max-Age=0/);
});
