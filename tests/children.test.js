'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createApp } = require('../server');

const PASSWORD = 'test-parol-children-123';
let dataDir, server, base;

function listen(app) {
    return new Promise((resolve) => {
        const s = app.listen(0, '127.0.0.1', () => resolve({ server: s, base: `http://127.0.0.1:${s.address().port}` }));
    });
}
const close = (s) => new Promise((resolve) => s.close(resolve));

before(async () => {
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'zb-children-test-'));
    ({ server, base } = await listen(createApp({ dataDir, adminPassword: PASSWORD })));
});

after(async () => {
    await close(server);
    await fs.rm(dataDir, { recursive: true, force: true });
});

test('GET /api/children: bo\'sh oila va noto\'g\'ri uid', async () => {
    assert.equal((await fetch(`${base}/api/children?uid=short`)).status, 400);
    const r = await fetch(`${base}/api/children?uid=testfamily001122`);
    assert.equal(r.status, 200);
    const data = await r.json();
    assert.equal(data.ok, true);
    assert.deepEqual(data.children, []);
    assert.equal(data.activeChildId, null);
});

test('POST /api/children: bola profilini qo\'shish va validatsiya', async () => {
    const uid = 'familychildren123';
    // Nomsiz so'rov rad etiladi
    const bad = await fetch(`${base}/api/children`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ uid, name: '' })
    });
    assert.equal(bad.status, 400);

    // Birinchi bola: Muhammad
    const r1 = await fetch(`${base}/api/children`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ uid, name: 'Ali', avatar: 'muhammad', age: 6 })
    });
    assert.equal(r1.status, 200);
    const res1 = await r1.json();
    assert.equal(res1.ok, true);
    assert.equal(res1.child.name, 'Ali');
    assert.equal(res1.child.avatar, 'muhammad');
    assert.equal(res1.child.age, 6);
    assert.ok(res1.child.id.startsWith('c_'));
    assert.equal(res1.activeChildId, res1.child.id);

    // Ikkinchi bola: Hadicha
    const r2 = await fetch(`${base}/api/children`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ uid, name: 'Fotima', avatar: 'hadicha', age: 4 })
    });
    assert.equal(r2.status, 200);
    const res2 = await r2.json();
    assert.equal(res2.children.length, 2);
    assert.equal(res2.children[1].name, 'Fotima');
    assert.equal(res2.children[1].avatar, 'hadicha');

    // GET /api/children orqali o'qish
    const list = await (await fetch(`${base}/api/children?uid=${uid}`)).json();
    assert.equal(list.children.length, 2);
    assert.equal(list.activeChildId, res1.child.id);
});

test('POST /api/children/:id/switch: faol bolani almashtirish', async () => {
    const uid = 'familychildren123';
    const list = await (await fetch(`${base}/api/children?uid=${uid}`)).json();
    const secondChild = list.children[1];

    const sw = await fetch(`${base}/api/children/${secondChild.id}/switch`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ uid })
    });
    assert.equal(sw.status, 200);
    const swRes = await sw.json();
    assert.equal(swRes.activeChildId, secondChild.id);
    assert.equal(swRes.child.name, 'Fotima');

    // Foydalanuvchi holatida ham faol bola va qahramon yangilanganini tekshirish
    const stateDoc = await (await fetch(`${base}/api/state/${uid}`)).json();
    assert.equal(stateDoc.state.activeChildId, secondChild.id);
    assert.equal(stateDoc.state.hero, 'hadicha');
});

test('POST /api/children/:id/stats: bola statistikasi va ballarini yangilash', async () => {
    const uid = 'familychildren123';
    const list = await (await fetch(`${base}/api/children?uid=${uid}`)).json();
    const childId = list.children[0].id;

    const r = await fetch(`${base}/api/children/${childId}/stats`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            uid,
            sec: 180,
            ex: 4,
            lessons: 1,
            balloonScore: 15,
            progKey: 'L0',
            progVal: 3,
            coins: 20
        })
    });
    assert.equal(r.status, 200);
    const data = await r.json();
    assert.equal(data.ok, true);
    assert.equal(data.child.totalSec, 180);
    assert.equal(data.child.balloonScore, 15);
    assert.equal(data.child.prog.L0, 3);
    assert.equal(data.child.coins, 20);
});

test('POST /api/auth/parent/pin-recover: PIN tiklash kodi va tasdiqlash', async () => {
    const uid = 'familychildren123';

    // 1. Tiklash kodini so'rash (OTP)
    const req = await fetch(`${base}/api/auth/parent/pin-recover`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ uid, action: 'request' })
    });
    assert.equal(req.status, 200);
    const reqData = await req.json();
    assert.equal(reqData.ok, true);
    assert.match(reqData.code, /^\d{6}$/);

    // 2. Noto'g'ri kod bilan tasdiqlash
    const badVerify = await fetch(`${base}/api/auth/parent/pin-recover`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ uid, action: 'verify', code: '000000', newPin: '9999' })
    });
    assert.equal(badVerify.status, 400);

    // 3. To'g'ri kod bilan tasdiqlash va yangi PIN o'rnatish
    const okVerify = await fetch(`${base}/api/auth/parent/pin-recover`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ uid, action: 'verify', code: reqData.code, newPin: '7788' })
    });
    assert.equal(okVerify.status, 200);
    const okData = await okVerify.json();
    assert.equal(okData.ok, true);

    const doc = await (await fetch(`${base}/api/state/${uid}`)).json();
    assert.equal(doc.state.parentPin, '7788');
    assert.equal(doc.state.pinRecovery, null);
});

test('GET /api/superadmin/analytics: platforma umumiy tahlili', async () => {
    const r = await fetch(`${base}/api/superadmin/analytics`);
    assert.equal(r.status, 200);
    const data = await r.json();
    assert.equal(data.ok, true);
    assert.ok(data.totalFamilies >= 1);
    assert.ok(data.totalChildren >= 2);
    assert.ok(data.totalBalloonGames >= 1);
    assert.equal(typeof data.avgMinutesPerChild, 'number');
    assert.equal(typeof data.letterMasteryRate, 'number');
    assert.equal(data.timeline.length, 14);
    assert.ok(Array.isArray(data.families));
});
