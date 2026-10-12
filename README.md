# 🌟 "Zukko Bolajon" – Bolalar Uchun Moslashuvchan Ta'lim Ilovasi (Android / PWA)

O'zbek tiliga ixtisoslashgan, 3 yoshdan 8 yoshgacha bo'lgan bolalar uchun interaktiv, chiroyli va qiziqarli ta'lim platformasi. Ilova **Capacitor / Cordova** orqali Android APK holatiga keltiriladigan va **GitHub** orqali versiyalanadigan toza, modulli Web arxitekturasida (HTML5 Canvas 2D, CSS3 animatsiyalar, Vanilla JavaScript, Web Speech & Web Audio API) ishlab chiqilgan.

---

## 🎯 1. ASOSIY IMKONIYATLAR VA XUSUSIYATLAR

### 👶 Kirish va Yoshga Moslashuv (Adaptive UI/Content)
- **Boshlang'ich oyna:** Ota-ona pochtasi, bolaning ismi, bolaning yoshi (3, 4, 5, 6, 7, 8 yosh) va hamroh qahramon (Muhammad 👦 / Hadicha 👧) tanlovi.
- **Yosh toifalari bo'yicha avtomatik filtr:**
  - **3–4 yosh ("Kichkintoylar"):** Ranglar (Colors), Oddiy geometrik shakllar, Harflar konturlari, Rangli sharlar o'yini (Balloon pop), Pufaklar, 1 dan 5 gacha sanash.
  - **5–6 yosh ("Bog'cha / Tayyorlov"):** Yozma harflar (husnixat waypoints bilan), 0–9 raqamlar, Bo'g'inlar (Syllables + nutqni tanish), Sanash va qo'shish, Ranglar va do'kon.
  - **7–8 yosh ("Maktab yoshi / Bilag'onlar"):** To'liq so'zlar tuzish (Word builder), Matematika (qo'shish/ayirish), Xotira o'yini (Memory match), Labirint (Maze navigation), Bo'g'inlar va husnixat.
- **Dinamik bosh sahifa:** Bolaning yoshiga qarab asosiy mashqlar avtomatik tartiblanadi va "Yoshga mos" hamda "Barcha bo'limlar" o'rtasida 1-bosishda almashish mumkin.

### 🌓 Qora va Oq (Monoxrom / Yuqori Kontrast) Rejimi
- Bolaning ko'zini charchatmaslik, chalg'ituvchi yorqin ranglarni kamaytirish yoki elektron siyoh (e-ink/ink-friendly) muhitini yaratish uchun topbarda alohida **🌓 / ☀️ rejim tugmasi**.
- Rejim yoqilganda barcha komponentlar toza, yuqori kontrastli qora-oq chiziqlar va oq fonga o'tadi.

### ☁️ Dinamik Fon Animatsiyalari & Estetika
- Suzuvchi mayin bulutlar (`ambient-cloud`) va miltillovchi yulduzchalar (`ambient-star`).
- Bolalar psixologiyasiga mos yumshoq gradientlar, 3D tebranish va sakrash (tactile bounce) effektlari.
- G'alaba va yutuqlarda rangli zarrachalar (Confetti) feyerverki.

### 🧒 Jonli Hamroh Qahramon (Companion System)
- Muhammad yoki Hadicha har bir o'quv oynasida birga bo'lib hamrohlik qiladi:
  - O'zbek tilidagi jonli ovozli ko'rsatmalar beradi (**Web Speech API `uz-UZ`**).
  - Yutuqlarda quvonadi (sakrash, tabassum), xatoliklarda dalda beradi (*"Hechqisi yo'q! Yana bir bor urinib ko'ramiz!"*).
  - Ekranning o'ng burchagida jonli animatsiyali widget bo'lib turadi — bosilganda quvnoq gaplar va maslahatlar aytadi.

### ✍️ Husnixat va Yozma (Calligraphy) Motorikasi
- **Yozma harflar:** Caveat / Script husnixat shriftida to'liq harflar chizish.
- **Yo'nalishli hidoyat (Directional Waypoints):** Harfni teskari yoki noto'g'ri joydan boshlash bloklanadi; boshlash nuqtasi miltillovchi yashil doira va strelka bilan yo'naltiriladi.
- **Avtomatik tozalash (Auto-clear on stray):** Bola toleransdan tashqariga chiqsa yoki teskari chizsa, chiziq avtomatik o'chiriladi va boshidan boshlash taklif etiladi.
- **Moslashuvchan tahlil (Analytics):** Aniqlik 75% dan oshganda ilova avtomatik tarzda keyingi bosqichga o'tadi; har bir harf bo'yicha urinishlar va xatolar hisoblab boriladi.

### 🔤 Bo'g'inlar, So'zlar va Nutqni Tanish (Microphone)
- Ikki bo'g'inli kartochkalar ("da" + "da" = "dada", "bo" + "la" = "bola", "ol" + "ma" = "olma" va boshqalar).
- Magnit animatsiyasi orqali yaxlit so'zga birlashish.
- Mikrofon tugmasi orqali bolaning talaffuzi eshitiladi va Levenshtein solishtiruvi orqali tangalar va rag'bat beriladi.

### 🔒 Ota-onalar va Admin Paneli
- PIN-kod (standart: 1234) yoki arifmetik savol orqali himoyalangan kirish.
- 6 xonali OTP tiklash mexanizmi (onlayn va oflayn rejimda ishlaydi).
- Bolaning dars va o'yin vaqt limitlarini boshqarish.
- Bolaning qiynalgan harflari tahlili (eng ko'p xato qilingan harflar ro'yxati).
- Barcha profillar uchun `/admin` monitoring paneli.

---

## 🚀 2. LOYIHANI ISHGA TUSHIRISH

### Oddiy brauzerda (Server bilan):
```bash
# Node.js orqali serverni ishga tushirish
node server.js
```
Brauzerda oching:
- **Bolalar ilovasi:** [http://127.0.0.1:3000](http://127.0.0.1:3000)
- **Admin paneli:** [http://127.0.0.1:3000/admin](http://127.0.0.1:3000/admin)

### Standalone (To'g'ridan-to'g'ri faylni ochish):
Ilova mustaqil holatda ham to'liq ishlaydi. `index.html` faylini Google Chrome yoki Microsoft Edge brauzerida ikki marta bosib ochish kifoya.

---

## 📱 3. ANDROID APK YIG'ISH (CAPACITOR ORQALI)

Loyiha Capacitor bilan 100% integratsiyaga tayyorlangan (`capacitor.config.json` sozlangan).

### 1-qadam. Kerakli vositalarni o'rnatish
Kompyuteringizda quyidagilar bo'lishi kerak:
- [Node.js](https://nodejs.org/) (v18+)
- [Android Studio](https://developer.android.com/studio) (Android SDK bilan)

### 2-qadam. Capacitor paketlarini o'rnatish
Loyiha papkasida terminalni ochib, quyidagi buyruqni bering:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### 3-qadam. Android platformasini qo'shish
```bash
npx cap add android
```
Bu buyruq loyihangizda to'liq `android/` papkasini yaratadi.

### 4-qadam. Web fayllarni Android loyihaga sinxronlash
```bash
npx cap sync android
```

### 5-qadam. Android Studio'da ochish va APK yig'ish
```bash
npx cap open android
```
Android Studio ochilgach:
1. `Build` menyusiga kiring.
2. `Build Bundle(s) / APK(s)` -> `Build APK(s)` ni bosing.
3. Yig'ilgan `app-debug.apk` faylini xohlagan Android telefon yoki planshetga o'rnatib ishlatishingiz mumkin!

---

## 🐙 4. GITHUB REPOZITORIYASIGA YUKLASH

Loyiha GitHub bilan versiyalash uchun to'liq tayyor.

```bash
# 1. Git repozitoriyasini boshlash
git init

# 2. Fayllarni qo'shish
git add .

# 3. Dastlabki commit
git commit -m "feat: Zukko Bolajon - Adaptive Kid Learning App v1.2.0"

# 4. GitHub'dagi masofaviy repozitoriyangizni ulash
git branch -M main
git remote add origin https://github.com/USERNAME/zukko-bolajon.git

# 5. GitHub'ga yuklash
git push -u origin main
```

---

## 📁 5. FAYLLAR TUZILISHI

```
zukko-bolajon/
├── index.html                   # Asosiy PWA ilova kodi (Adaptive UI, Canvas, Audio, Games)
├── style.css                    # To'liq dizayn, Monoxrom rejim, animatsiyalar
├── manifest.json                # PWA manifesti (ikonkalar, nom, tema)
├── service-worker.js            # Oflayn rejim uchun Service Worker keshi
├── server.js                    # Express API serveri (holat, bolalar profillari, OTP, statistika)
├── admin.html                   # Admin kuzatuv paneli
├── capacitor.config.json        # Capacitor Android konfiguratsiyasi
├── package.json                 # Loyiha metadata va buyruqlari
├── .gitignore                   # Git istisno fayli
├── tests/                       # Avtomatlashtirilgan backend testlari (29 ta test)
└── README.md                    # Loyiha hujjatlari va qo'llanmasi
```

---

## 🏆 TESTLARNI ISHGA TUSHIRISH
```bash
node --test tests/stats.test.js tests/api.test.js tests/children.test.js
```
Barcha 29 ta test muvaffaqiyatli o'tadi (100% pass).
