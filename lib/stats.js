'use strict';

const { maskId } = require('./state');

// Ilovadagi LETTERS va DIGITS massivlari uzunligi (index.html). Ro'yxat o'zgarsa, shuni ham yangilang.
const LETTER_COUNT = 29;
const DIGIT_COUNT = 10;

const pad = (n) => String(n).padStart(2, '0');

/** Mahalliy sana kaliti: YYYY-MM-DD (mijozdagi dkey() bilan bir xil format). */
function dayKey(ms) {
    const d = new Date(ms);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Sana kalitini kunning o'rtasidagi vaqtga aylantiradi (yozgi/qishki vaqt xatosidan saqlaydi). */
function keyToMs(key) {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d, 12).getTime();
}

/** Bugundan boshlab orqaga n ta kun kaliti, eng eskisi birinchi. */
function lastKeys(now, n) {
    const keys = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        keys.push(dayKey(d.getTime()));
    }
    return keys;
}

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

/** Bitta foydalanuvchi hujjatidan kerakli ko'rsatkichlarni chiqaradi. */
function summarizeUser(doc, { letterCount, digitCount }) {
    const s = doc.state || {};
    const prog = s.prog || {};
    const days = s.days || {};

    let exercises = 0;
    let lessons = 0;
    let firstDay = null;
    let lastDay = null;
    const activeDays = [];
    for (const [k, d] of Object.entries(days)) {
        exercises += num(d.ex);
        lessons += num(d.lessons);
        if (num(d.sec) > 0 || num(d.ex) > 0) {
            activeDays.push(k);
            if (!firstDay || k < firstDay) firstDay = k;
            if (!lastDay || k > lastDay) lastDay = k;
        }
    }

    const letterDone = [];
    const digitDone = [];
    const letterStarted = [];
    const digitStarted = [];
    for (let i = 0; i < letterCount; i++) {
        const p = num(prog['L' + i]);
        if (p === 3) letterDone.push(i); else if (p > 0) letterStarted.push(i);
    }
    for (let i = 0; i < digitCount; i++) {
        const p = num(prog['N' + i]);
        if (p === 3) digitDone.push(i); else if (p > 0) digitStarted.push(i);
    }

    const voice = Object.values(s.voiceRecords || {}).map((r) => num(r && r.best)).filter((x) => x > 0);

    return {
        uid: String(doc.uid || ''),
        hero: s.hero || null,
        authType: s.auth ? s.auth.type : null,
        authId: s.auth ? maskId(s.auth.type, s.auth.id) : '',
        coins: num(s.coins),
        words: num(s.words),
        math: num(s.math),
        totalSec: num(s.totalSec),
        exercises,
        lessons,
        activeDays,
        letterDone,
        digitDone,
        letterStarted,
        digitStarted,
        everStarted: letterDone.length + digitDone.length + letterStarted.length + digitStarted.length > 0,
        created: num(doc.createdAt) || (firstDay ? keyToMs(firstDay) : num(doc.updatedAt)),
        lastActive: num(doc.updatedAt) || (lastDay ? keyToMs(lastDay) : 0),
        certificates: Array.isArray(s.certificates) ? s.certificates : [],
        ownedCount: Array.isArray(s.owned) ? s.owned.length : 0,
        dailyLimit: num(s.settings && s.settings.dailyMin) > 0,
        soundOff: !!(s.settings && s.settings.sound === false),
        musicOff: !!(s.settings && s.settings.music === false),
        voiceBest: voice.length ? Math.max(...voice) : 0,
        voiceCount: voice.length,
        reviewCount: Object.values(s.reviewHistory || {}).reduce((a, b) => a + num(b), 0),
        days,
        children: Array.isArray(s.children) ? s.children : [],
        activeChildId: s.activeChildId || null,
        parentPin: !!s.parentPin
    };
}

/**
 * Hamma foydalanuvchilar bo'yicha umumiy statistika.
 * @param {Array<{uid:string, createdAt?:number, updatedAt?:number, state:object}>} docs
 */
function computeStats(docs, opts = {}) {
    const {
        now = Date.now(),
        letterCount = LETTER_COUNT,
        digitCount = DIGIT_COUNT,
        chartDays = 14,
        maxUsers = 500
    } = opts;

    const users = [];
    for (const d of docs) {
        try { users.push(summarizeUser(d, { letterCount, digitCount })); } catch (err) { /* buzuq hujjat statistikaga kirmaydi */ }
    }
    const today = dayKey(now);
    const seriesKeys = lastKeys(now, chartDays);
    const keys7 = new Set(lastKeys(now, 7));
    const keys30 = new Set(lastKeys(now, 30));

    const daily = new Map(seriesKeys.map((k) => [k, { date: k, active: 0, newUsers: 0, minutes: 0, exercises: 0 }]));

    const out = {
        generatedAt: now,
        totals: { users: users.length, children: 0, registered: 0, loggedOut: 0 },
        active: { today: 0, last7: 0, last30: 0 },
        newUsers: { today: 0, last7: 0, last30: 0 },
        engagement: {
            totalMinutes: 0, totalExercises: 0, totalLessons: 0, totalCoins: 0,
            totalWords: 0, totalMath: 0, avgMinutesPerUser: 0, avgExercisesPerUser: 0
        },
        heroes: { muhammad: 0, hadicha: 0, none: 0 },
        auth: { google: 0, phone: 0, none: 0 },
        certificates: { letters: 0, numbers: 0, all: 0 },
        extras: { shopBuyers: 0, dailyLimitUsers: 0, soundOff: 0, musicOff: 0, voiceUsers: 0, avgVoiceBest: 0, reviewSessions: 0 },
        letters: { total: letterCount, done: new Array(letterCount).fill(0), started: new Array(letterCount).fill(0) },
        digits: { total: digitCount, done: new Array(digitCount).fill(0), started: new Array(digitCount).fill(0) },
        funnel: [],
        daily: [],
        users: []
    };

    const funnel = { started: 0, firstLesson: 0, allLetters: 0, allDigits: 0, unlocked: 0, playedWords: 0, playedMath: 0, certificate: 0 };
    let voiceBestSum = 0;

    for (const u of users) {
        out.totals.children += (u.children && u.children.length ? u.children.length : 1);
        if (u.authType) out.totals.registered++; else out.totals.loggedOut++;

        const activeSet = new Set(u.activeDays);
        if (activeSet.has(today)) out.active.today++;
        if (u.activeDays.some((k) => keys7.has(k))) out.active.last7++;
        if (u.activeDays.some((k) => keys30.has(k))) out.active.last30++;

        const createdKey = u.created ? dayKey(u.created) : null;
        if (createdKey === today) out.newUsers.today++;
        if (createdKey && keys7.has(createdKey)) out.newUsers.last7++;
        if (createdKey && keys30.has(createdKey)) out.newUsers.last30++;

        for (const k of seriesKeys) {
            const row = daily.get(k);
            const d = u.days[k];
            if (d && (num(d.sec) > 0 || num(d.ex) > 0)) row.active++;
            if (d) { row.minutes += num(d.sec) / 60; row.exercises += num(d.ex); }
            if (createdKey === k) row.newUsers++;
        }

        const e = out.engagement;
        e.totalMinutes += u.totalSec / 60;
        e.totalExercises += u.exercises;
        e.totalLessons += u.lessons;
        e.totalCoins += u.coins;
        e.totalWords += u.words;
        e.totalMath += u.math;

        out.heroes[u.hero || 'none']++;
        out.auth[u.authType === 'google' ? 'google' : u.authType === 'phone' ? 'phone' : 'none']++;

        for (const c of ['letters', 'numbers', 'all']) if (u.certificates.includes(c)) out.certificates[c]++;

        if (u.ownedCount > 3) out.extras.shopBuyers++;
        if (u.dailyLimit) out.extras.dailyLimitUsers++;
        if (u.soundOff) out.extras.soundOff++;
        if (u.musicOff) out.extras.musicOff++;
        if (u.voiceCount > 0) { out.extras.voiceUsers++; voiceBestSum += u.voiceBest; }
        out.extras.reviewSessions += u.reviewCount;

        u.letterDone.forEach((i) => out.letters.done[i]++);
        u.letterStarted.forEach((i) => out.letters.started[i]++);
        u.digitDone.forEach((i) => out.digits.done[i]++);
        u.digitStarted.forEach((i) => out.digits.started[i]++);

        const allLetters = u.letterDone.length === letterCount;
        const allDigits = u.digitDone.length === digitCount;
        if (u.everStarted) funnel.started++;
        if (u.lessons > 0 || u.letterDone.length + u.digitDone.length > 0) funnel.firstLesson++;
        if (allLetters) funnel.allLetters++;
        if (allDigits) funnel.allDigits++;
        if (allLetters && allDigits) funnel.unlocked++;
        if (u.words > 0) funnel.playedWords++;
        if (u.math > 0) funnel.playedMath++;
        if (u.certificates.length > 0) funnel.certificate++;
    }

    const n = users.length || 1;
    out.engagement.totalMinutes = Math.round(out.engagement.totalMinutes);
    out.engagement.avgMinutesPerUser = Math.round((out.engagement.totalMinutes / n) * 10) / 10;
    out.engagement.avgExercisesPerUser = Math.round((out.engagement.totalExercises / n) * 10) / 10;
    out.extras.avgVoiceBest = out.extras.voiceUsers ? Math.round(voiceBestSum / out.extras.voiceUsers) : 0;

    out.funnel = [
        { key: 'registered', label: "Ilovaga kirdi", count: users.length },
        { key: 'started', label: "Darsni boshladi", count: funnel.started },
        { key: 'firstLesson', label: "Birinchi darsni tugatdi", count: funnel.firstLesson },
        { key: 'allLetters', label: "Barcha harflarni o'rgandi", count: funnel.allLetters },
        { key: 'allDigits', label: "Barcha raqamlarni o'rgandi", count: funnel.allDigits },
        { key: 'unlocked', label: "So'z va misollar ochildi", count: funnel.unlocked },
        { key: 'playedWords', label: "So'z tuzdi", count: funnel.playedWords },
        { key: 'playedMath', label: "Misol yechdi", count: funnel.playedMath },
        { key: 'certificate', label: "Sertifikat oldi", count: funnel.certificate }
    ];

    out.daily = seriesKeys.map((k) => {
        const r = daily.get(k);
        return { ...r, minutes: Math.round(r.minutes), exercises: r.exercises };
    });

    out.users = users
        .slice()
        .sort((a, b) => b.lastActive - a.lastActive)
        .slice(0, maxUsers)
        .map((u) => ({
            id: u.uid.slice(0, 8),
            uid: u.uid,
            hero: u.hero,
            authType: u.authType,
            authId: u.authId,
            coins: u.coins,
            letters: u.letterDone.length,
            digits: u.digitDone.length,
            minutes: Math.round(u.totalSec / 60),
            exercises: u.exercises,
            lastActive: u.lastActive,
            created: u.created,
            children: u.children,
            activeChildId: u.activeChildId,
            parentPin: u.parentPin
        }));

    return out;
}

module.exports = { computeStats, summarizeUser, dayKey, lastKeys, LETTER_COUNT, DIGIT_COUNT };
