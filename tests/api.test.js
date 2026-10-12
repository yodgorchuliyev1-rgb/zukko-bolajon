'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createApp } = require('../server');

const PASSWORD = 'test-parol-12345';
let dataDir, server, base;

function listen(app) {
    return new Promise((resolve) => {
        const s = app.listen(0, '127.0.0.1', () => resolve({ server: s, base: `http://127.0.0.1:${s.address().port}` }));
    });
}
const close = (s) => new Promise((resolve) => s.close(resolve));

function state(extra = {}) {
    return {
        auth: { type: 'google', id: 'ali@gmail.com' }, hero: 'muhammad', coins: 12,
        prog: { L0: 3, L1: 2 }, words: 1, math: 0, owned: ['h_d1', 'o_m1', 'o_h1'],
        equip: { muhammad: { hat: 'h_d1', glasses: null, outfit: 'o_m1', acc: null }, hadicha: { hat: null, glasses: null, outfit: 'o_h1', acc: null } },
        days: { '2026-10-12': { sec: 300, ex: 6, lessons: 1 } }, totalSec: 300,
        settings: { breakMin: 10, gameMin: 5, dailyMin: 0, sound: true, music: true },
        voiceRecords: {}, colorsProg: {}, reviewHistory: {}, certificates: [], ...extra
    };
}
const put = (uid, body, b = base) => fetch(`${b}/api/state/${uid}`, {
    method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body)
});
async function login(password = PASSWORD, b = base) {
    const r = await fetch(`${b}/api/admin/login`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password })
    });
    const cookie = (r.headers.get('set-cookie') || '').split(';')[0];
    return { r, cookie };
}

before(async () => {
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'zb-test-'));
    ({ server, base } = await listen(createApp({ dataDir, adminPassword: PASSWORD })));
});
after(async () => {
    await close(server);
    await fs.rm(dataDir, { recursive: true, force: true });
});

test('health', async () => {
    const r = await fetch(`${base}/api/health`);
    assert.equal(r.status, 200);
    assert.deepEqual(await r.json(), { ok: true });
    assert.equal(r.headers.get('x-powered-by'), null);
    assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
});

test('noto\'g\'ri uid va mavjud bo\'lmagan hujjat', async () => {
    assert.equal((await fetch(`${base}/api/state/qisqa`)).status, 400);
    assert.equal((await put('qisqa', { state: state() })).status, 400);
    assert.equal((await fetch(`${base}/api/state/abcdefgh12345678`)).status, 404);
});

test('noto\'g\'ri holat rad etiladi va diskka yozilmaydi', async () => {
    const uid = 'badstate12345678';
    assert.equal((await put(uid, { state: { ...state(), hack: 1 } })).status, 400);
    assert.equal((await put(uid, { state: state({ coins: -5 }) })).status, 400);
    assert.equal((await put(uid, { state: state({ prog: { L0: 9 } }) })).status, 400);
    assert.equal((await put(uid, {})).status, 400);
    assert.equal((await fetch(`${base}/api/state/${uid}`)).status, 404);
});

test('saqlash: auth maskalanadi, createdAt saqlanib qoladi', async () => {
    const uid = 'family0011223344';
    const r1 = await put(uid, { state: state() });
    assert.equal(r1.status, 200);
    const doc1 = await (await fetch(`${base}/api/state/${uid}`)).json();
    assert.equal(doc1.state.auth.id, 'al***@gmail.com');
    assert.equal(doc1.state.coins, 12);
    assert.ok(doc1.createdAt > 0);

    await new Promise((r) => setTimeout(r, 15));
    assert.equal((await put(uid, { state: state({ coins: 20 }) })).status, 200);
    const doc2 = await (await fetch(`${base}/api/state/${uid}`)).json();
    assert.equal(doc2.state.coins, 20);
    assert.equal(doc2.createdAt, doc1.createdAt, 'createdAt o\'zgarmasligi kerak');
    assert.ok(doc2.updatedAt >= doc1.updatedAt);

    const raw = await fs.readFile(path.join(dataDir, `${uid}.json`), 'utf8');
    assert.ok(!raw.includes('ali@gmail.com'), 'to\'liq pochta diskka yozilmasligi kerak');
});

test('parallel yozuvlar fayl buzilmasdan tugaydi', async () => {
    const uid = 'parallel99887766';
    const rs = await Promise.all(Array.from({ length: 12 }, (_, i) => put(uid, { state: state({ coins: i }) })));
    assert.ok(rs.every((r) => r.status === 200));
    const doc = await (await fetch(`${base}/api/state/${uid}`)).json();
    assert.equal(typeof doc.state.coins, 'number');
    const left = (await fs.readdir(dataDir)).filter((f) => f.endsWith('.tmp'));
    assert.deepEqual(left, [], 'qoldiq .tmp fayllar bo\'lmasligi kerak');
});

test('admin: kirishsiz statistika yopiq', async () => {
    assert.equal((await fetch(`${base}/api/admin/stats`)).status, 401);
    assert.equal((await fetch(`${base}/api/admin/session`)).status, 401);
    const bad = await fetch(`${base}/api/admin/stats`, { headers: { cookie: 'zb_admin=123.soxta' } });
    assert.equal(bad.status, 401);
});

test('admin: noto\'g\'ri parol 401, to\'g\'ri parol cookie beradi', async () => {
    const wrong = await login('boshqa-parol');
    assert.equal(wrong.r.status, 401);
    assert.equal(wrong.cookie, '');
    const ok = await login();
    assert.equal(ok.r.status, 200);
    const setCookie = ok.r.headers.get('set-cookie');
    assert.match(setCookie, /HttpOnly/);
    assert.match(setCookie, /SameSite=Strict/);
    assert.match(ok.cookie, /^zb_admin=/);
    assert.equal((await fetch(`${base}/api/admin/session`, { headers: { cookie: ok.cookie } })).status, 200);
});

test('admin: statistika foydalanuvchilar sonini to\'g\'ri qaytaradi', async () => {
    await put('second0000111122', { state: state({ auth: { type: 'phone', id: '+998901234567' }, hero: 'hadicha', prog: { L0: 1 } }) });
    const { cookie } = await login();
    const r = await fetch(`${base}/api/admin/stats`, { headers: { cookie } });
    assert.equal(r.status, 200);
    assert.match(r.headers.get('cache-control'), /no-store/);
    const st = await r.json();
    const files = (await fs.readdir(dataDir)).filter((f) => /^[A-Za-z0-9_-]{8,64}\.json$/.test(f));
    assert.equal(st.totals.users, files.length);
    assert.ok(st.totals.users >= 3);
    assert.equal(st.heroes.hadicha >= 1, true);
    assert.equal(st.auth.phone >= 1, true);
    assert.equal(st.daily.length, 14);
    const dump = JSON.stringify(st);
    assert.ok(!dump.includes('ali@gmail.com') && !dump.includes('998901234567'), 'statistikada to\'liq shaxsiy ma\'lumot bo\'lmasligi kerak');

    // Yangi yozuv keshni bekor qiladi: son darrov oshadi
    await put('third00001111222', { state: state() });
    const st2 = await (await fetch(`${base}/api/admin/stats`, { headers: { cookie } })).json();
    assert.equal(st2.totals.users, st.totals.users + 1);
});

test('admin: chiqishdan keyin cookie o\'chadi', async () => {
    const r = await fetch(`${base}/api/admin/logout`, { method: 'POST' });
    assert.equal(r.status, 200);
    assert.match(r.headers.get('set-cookie'), /Max-Age=0/);
});

test('sahifalar: /admin ochiladi, ichki fayllar yopiq', async () => {
    const a = await fetch(`${base}/admin`);
    assert.equal(a.status, 200);
    assert.match(a.headers.get('cache-control'), /no-store/);
    assert.match(a.headers.get('x-robots-tag'), /noindex/);
    assert.match(await a.text(), /Admin panel/);

    assert.equal((await fetch(`${base}/`)).status, 200);
    assert.equal((await fetch(`${base}/index.html`)).status, 200);
    assert.equal((await fetch(`${base}/service-worker.js`)).status, 200);
    for (const p of ['/server.js', '/package.json', '/admin.html', '/lib/state.js', '/data/x.json', '/.gitignore']) {
        assert.equal((await fetch(`${base}${p}`)).status, 404, `${p} ochiq bo'lmasligi kerak`);
    }
});

test('admin paroli fayldan: birinchi marta yaratiladi, hash saqlanadi', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'zb-gen-'));
    try {
        const app1 = createApp({ dataDir: dir, adminPassword: '' });
        const auth1 = await app1.locals.adminReady;
        assert.equal(auth1.source, 'file');
        assert.ok(auth1.generated && auth1.generated.length >= 10);
        assert.equal(await auth1.verify(auth1.generated), true);
        assert.equal(await auth1.verify('xato'), false);

        const saved = await fs.readFile(path.join(dir, 'admin', 'credentials.json'), 'utf8');
        assert.ok(!saved.includes(auth1.generated), 'parol ochiq matnda saqlanmasligi kerak');

        const app2 = createApp({ dataDir: dir, adminPassword: '' });
        const auth2 = await app2.locals.adminReady;
        assert.equal(auth2.generated, null, 'ikkinchi marta yangi parol yaratilmaydi');
        assert.equal(await auth2.verify(auth1.generated), true);

        // admin/ papkasi foydalanuvchilar ro'yxatiga aralashmaydi
        const l = await listen(app2);
        try {
            const { cookie } = await login(auth1.generated, l.base);
            const st = await (await fetch(`${l.base}/api/admin/stats`, { headers: { cookie } })).json();
            assert.equal(st.totals.users, 0);
        } finally { await close(l.server); }
    } finally { await fs.rm(dir, { recursive: true, force: true }); }
});

test('admin kirishida urinishlar cheklanadi (8 tadan keyin 429)', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'zb-rate-'));
    const l = await listen(createApp({ dataDir: dir, adminPassword: PASSWORD }));
    try {
        const codes = [];
        for (let i = 0; i < 10; i++) codes.push((await login('xato-' + i, l.base)).r.status);
        assert.deepEqual(codes.slice(0, 8), Array(8).fill(401));
        assert.equal(codes[8], 429);
        assert.equal(codes[9], 429);
        assert.equal((await login(PASSWORD, l.base)).r.status, 429, 'bloklanganda to\'g\'ri parol ham o\'tmaydi');
    } finally {
        await close(l.server);
        await fs.rm(dir, { recursive: true, force: true });
    }
});

test('eski hujjatlardagi to\'liq pochta ishga tushganda yashiriladi', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'zb-legacy-'));
    try {
        const file = path.join(dir, 'legacy00112233.json');
        const legacy = { updatedAt: 1760000000000, state: state({ auth: { type: 'phone', id: '+998901234567' } }) };
        await fs.writeFile(file, JSON.stringify(legacy), 'utf8');
        const fresh = path.join(dir, 'fresh0011223344.json');
        await fs.writeFile(fresh, JSON.stringify({ updatedAt: 1, state: state({ auth: { type: 'google', id: 'ab***@x.uz' } }) }), 'utf8');

        const app = createApp({ dataDir: dir, adminPassword: PASSWORD });
        assert.equal(await app.locals.maskingDone, 1, 'faqat bitta hujjat o\'zgarishi kerak');

        const after = JSON.parse(await fs.readFile(file, 'utf8'));
        assert.equal(after.state.auth.id, '***4567');
        assert.equal(after.updatedAt, legacy.updatedAt, 'updatedAt o\'zgarmasligi kerak');
        assert.equal(after.state.coins, 12, 'boshqa ma\'lumot saqlanadi');
        assert.ok(!(await fs.readFile(file, 'utf8')).includes('998901234567'));
        assert.deepEqual((await fs.readdir(dir)).filter((f) => f.endsWith('.tmp')), []);
    } finally { await fs.rm(dir, { recursive: true, force: true }); }
});
