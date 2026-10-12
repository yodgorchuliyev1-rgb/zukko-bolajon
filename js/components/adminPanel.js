// Professional SaaS Admin Panel Component
function renderAdminPanel(container) {
  const state = window.appState;
  const currentTab = state.activeAdminTab;

  container.innerHTML = `
    <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-['Nunito']">
      
      <!-- Admin Top Navbar -->
      <nav class="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
        
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-xl text-white font-black shadow-lg">
            ⚡
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-lg font-black text-white tracking-tight">Zukko Bolajon</span>
              <span class="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-lg border border-indigo-500/30">Admin SaaS v2.4</span>
            </div>
            <span class="text-xs text-slate-400 font-medium">Boshqaruv Markazi va Edu-AI Monitor</span>
          </div>
        </div>

        <!-- Quick Switch to Kids Mode Button -->
        <div class="flex items-center gap-4">
          <div class="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>AI Tizimi: 100% Faol</span>
          </div>

          <button id="btnBackToKids" class="btn-bouncy flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 px-4 py-2 rounded-xl text-xs md:text-sm font-black shadow-lg cursor-pointer">
            <span>👶</span> Bolalar Interfeysiga O'tish
          </button>
        </div>

      </nav>

      <!-- Sub Navigation Tabs -->
      <div class="bg-slate-900 border-b border-slate-800 px-6 py-2.5 flex items-center gap-2 overflow-x-auto">
        <button class="admin-tab-btn px-4 py-2 rounded-xl text-xs md:text-sm font-black flex items-center gap-2 transition-all ${currentTab === 'analytics' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}" data-tab="analytics">
          <span>📊</span> Analitika & Metrikalar
        </button>
        <button class="admin-tab-btn px-4 py-2 rounded-xl text-xs md:text-sm font-black flex items-center gap-2 transition-all ${currentTab === 'cms' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}" data-tab="cms">
          <span>📚</span> O'quv Kontenti (CMS)
        </button>
        <button class="admin-tab-btn px-4 py-2 rounded-xl text-xs md:text-sm font-black flex items-center gap-2 transition-all ${currentTab === 'shop' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}" data-tab="shop">
          <span>🛍️</span> Do'kon va Narxlar
        </button>
      </div>

      <!-- Main Content Area -->
      <main class="flex-1 p-6 max-w-7xl w-full mx-auto" id="adminMainMount">
        <!-- Injected below -->
      </main>

    </div>
  `;

  // Switch to Kids Mode
  container.querySelector('#btnBackToKids').addEventListener('click', () => {
    if (window.soundEngine) window.soundEngine.playClick();
    state.setView('kids');
  });

  // Switch Admin Tabs
  container.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.getAttribute('data-tab');
      if (window.soundEngine) window.soundEngine.playClick();
      state.setActiveAdminTab(tab);
    });
  });

  const mountPoint = container.querySelector('#adminMainMount');

  if (currentTab === 'analytics') {
    renderAnalyticsView(mountPoint);
  } else if (currentTab === 'cms') {
    renderCMSView(mountPoint);
  } else if (currentTab === 'shop') {
    renderAdminShopView(mountPoint);
  }
}

// 1. ANALYTICS & METRICS VIEW
function renderAnalyticsView(container) {
  const state = window.appState;
  const a = state.analytics;

  container.innerHTML = `
    <div class="space-y-6">
      
      <!-- KPI Top Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div class="flex items-center justify-between text-slate-400 text-xs font-bold uppercase mb-2">
            <span>Jami O'quvchilar</span>
            <span class="text-emerald-400 font-extrabold">${a.studentGrowth}</span>
          </div>
          <div class="text-3xl font-black text-white">${a.totalStudents.toLocaleString()}</div>
          <p class="text-xs text-slate-400 mt-2 font-medium">Bugun faol: <span class="text-slate-200 font-bold">${a.activeToday}</span> bola</p>
        </div>

        <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div class="flex items-center justify-between text-slate-400 text-xs font-bold uppercase mb-2">
            <span>Kunlik AI Tekshiruv</span>
            <span class="text-sky-400 font-extrabold">+12.4%</span>
          </div>
          <div class="text-3xl font-black text-white">${a.totalChecks.toLocaleString()}</div>
          <p class="text-xs text-slate-400 mt-2 font-medium">O'rtacha vaqt: <span class="text-slate-200 font-bold">1.8 soniya</span></p>
        </div>

        <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div class="flex items-center justify-between text-slate-400 text-xs font-bold uppercase mb-2">
            <span>O'rtacha Aniqlik</span>
            <span class="text-emerald-400 font-extrabold">${a.accuracyChange}</span>
          </div>
          <div class="text-3xl font-black text-white">${a.avgAccuracy}%</div>
          <p class="text-xs text-slate-400 mt-2 font-medium">Muvaffaqiyatli topshirish ko'rsatkichi</p>
        </div>

        <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div class="flex items-center justify-between text-slate-400 text-xs font-bold uppercase mb-2">
            <span>Yig'ilgan Tangalar</span>
            <span class="text-amber-400 font-extrabold">🪙 Faol</span>
          </div>
          <div class="text-3xl font-black text-amber-300">142,500</div>
          <p class="text-xs text-slate-400 mt-2 font-medium">Do'konda sarflangan: <span class="text-slate-200 font-bold">64,200</span> 🪙</p>
        </div>

      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left 7 cols: Weekly AI Checks Dynamic Trend (SVG Chart) -->
        <div class="lg:col-span-7 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-lg">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-base font-black text-white">Haftalik AI Tekshiruvlar Dinamikasi</h3>
              <p class="text-xs text-slate-400">Kunlar kesimida o'quvchilar yozuvini AI tahlil qilish statistikasi</p>
            </div>
            <span class="text-xs px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/30 font-bold">Oxirgi 7 kun</span>
          </div>

          <!-- Custom SVG Bar & Trend Chart -->
          <div class="h-64 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-700">
            ${a.weeklyTrends.map(item => {
              const heightPercent = Math.round((item.checks / 1500) * 100);
              const correctHeight = Math.round((item.correct / 1500) * 100);
              return `
                <div class="flex-1 flex flex-col items-center gap-2 group relative">
                  <!-- Tooltip -->
                  <div class="absolute -top-12 bg-slate-950 text-white text-[10px] font-bold py-1 px-2 rounded-lg border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                    Jami: ${item.checks} | To'g'ri: ${item.correct}
                  </div>
                  <!-- Stacked Bar -->
                  <div class="w-full max-w-[42px] bg-slate-700 rounded-t-xl overflow-hidden flex flex-col justify-end" style="height: ${heightPercent}%">
                    <div class="w-full bg-gradient-to-t from-indigo-600 to-sky-400 transition-all duration-500 rounded-t-xl" style="height: ${correctHeight}%"></div>
                  </div>
                  <!-- Day Label -->
                  <span class="text-xs font-bold text-slate-400 mt-1">${item.day}</span>
                </div>
              `;
            }).join('')}
          </div>

          <div class="flex items-center justify-center gap-6 mt-4 text-xs font-bold text-slate-400">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-600 to-sky-400"></span>
              <span>To'g'ri bajarilgan skanlar</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-slate-700"></span>
              <span>Qayta urinishlar</span>
            </div>
          </div>
        </div>

        <!-- Right 5 cols: Most Problematic Letters & Math Challenges -->
        <div class="lg:col-span-5 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-1">
              <h3 class="text-base font-black text-white">Eng Ko'p Qiynalayotgan Bo'limlar</h3>
              <span class="text-xs text-rose-400 font-bold">Xatolik tahlili</span>
            </div>
            <p class="text-xs text-slate-400 mb-4">Bolalar AI tekshiruvida eng ko'p adashayotgan harf va misollar</p>

            <div class="space-y-3.5">
              ${a.problematicItems.map(p => `
                <div class="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                  <div class="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span class="text-amber-300 font-black">${p.item}</span>
                    <span class="text-rose-400">${p.failRate} xatolik (${p.errors} ta)</span>
                  </div>
                  <!-- Progress bar -->
                  <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-1.5">
                    <div class="bg-gradient-to-r from-amber-400 to-rose-500 h-full rounded-full" style="width: ${p.failRate}"></div>
                  </div>
                  <p class="text-[11px] text-slate-400 italic">Sabab: ${p.reason}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-700/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>💡 Metodik tavsiya: Tutuq belgili harflar uchun maxsus mikro-mashq qo'shish tavsiya etiladi.</span>
          </div>
        </div>

      </div>

    </div>
  `;
}

// 2. CONTENT MANAGEMENT SYSTEM (CMS) VIEW
function renderCMSView(container) {
  const state = window.appState;
  const lessons = state.lessons;

  container.innerHTML = `
    <div class="space-y-6">
      
      <!-- Top Action Bar -->
      <div class="flex flex-wrap items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl shadow-lg">
        <div>
          <h3 class="text-lg font-black text-white">O'quv Darslari va Topshiriqlar Ro'yxati</h3>
          <p class="text-xs text-slate-400">Alifbe, matematika va yozuv shablonlarini kiritish hamda boshqarish</p>
        </div>

        <button id="btnOpenAddLessonModal" class="btn-bouncy px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs md:text-sm font-black rounded-xl shadow-md flex items-center gap-2 cursor-pointer">
          <span>➕</span> Yangi Dars Qo'shish
        </button>
      </div>

      <!-- Add Lesson Modal / Inline Form (Toggleable) -->
      <div id="addLessonCard" class="hidden bg-slate-800 border-2 border-indigo-500/50 p-6 rounded-2xl shadow-xl">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
          <h4 class="text-base font-black text-white flex items-center gap-2">
            <span>✨</span> Yangi Dars Yaratish
          </h4>
          <button id="btnCloseAddLesson" class="text-slate-400 hover:text-white text-lg">✕</button>
        </div>

        <form id="addLessonForm" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="text-xs font-bold text-slate-300 block mb-1">Dars Nomi / Sarlavha</label>
            <input type="text" id="lessonTitle" required placeholder="Masalan: L harfi" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500">
          </div>

          <div>
            <label class="text-xs font-bold text-slate-300 block mb-1">Harf yoki Raqam (Shablon)</label>
            <input type="text" id="lessonChar" required placeholder="L" maxlength="3" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-indigo-500">
          </div>

          <div>
            <label class="text-xs font-bold text-slate-300 block mb-1">Misol So'z</label>
            <input type="text" id="lessonWord" required placeholder="Lola" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500">
          </div>

          <div>
            <label class="text-xs font-bold text-slate-300 block mb-1">Emodzi Belgisi</label>
            <input type="text" id="lessonEmoji" required placeholder="🌷" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500">
          </div>

          <div>
            <label class="text-xs font-bold text-slate-300 block mb-1">Qiyinlik Darajasi</label>
            <select id="lessonDifficulty" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500">
              <option value="Oson">Oson</option>
              <option value="O'rta">O'rta</option>
              <option value="Murakkab">Murakkab</option>
            </select>
          </div>

          <div>
            <label class="text-xs font-bold text-slate-300 block mb-1">Mukofot Tangasi (🪙)</label>
            <input type="number" id="lessonReward" value="10" min="5" max="50" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500">
          </div>

          <div class="md:col-span-3 flex justify-end gap-3 mt-2">
            <button type="button" id="btnCancelAddLesson" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold">Bekor qilish</button>
            <button type="submit" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md">Saqlash va E'lon qilish</button>
          </div>
        </form>
      </div>

      <!-- Lessons Table -->
      <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-lg">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th class="px-5 py-3.5">Shablon</th>
                <th class="px-5 py-3.5">Mavzu</th>
                <th class="px-5 py-3.5">Misol</th>
                <th class="px-5 py-3.5">Qiyinlik</th>
                <th class="px-5 py-3.5">Mukofot</th>
                <th class="px-5 py-3.5">Status</th>
                <th class="px-5 py-3.5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/60 font-medium text-slate-300">
              ${lessons.map(lesson => `
                <tr class="hover:bg-slate-700/40 transition-colors">
                  <td class="px-5 py-3 font-black text-amber-300 text-base">
                    ${lesson.char}
                  </td>
                  <td class="px-5 py-3 font-bold text-white">
                    ${lesson.title}
                  </td>
                  <td class="px-5 py-3 flex items-center gap-1.5">
                    <span>${lesson.emoji}</span>
                    <span>${lesson.word}</span>
                  </td>
                  <td class="px-5 py-3">
                    <span class="px-2 py-0.5 rounded-lg text-[10px] font-black ${
                      lesson.difficulty === 'Oson' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      lesson.difficulty === 'O\'rta' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    }">
                      ${lesson.difficulty}
                    </span>
                  </td>
                  <td class="px-5 py-3 font-black text-amber-400">
                    🪙 +${lesson.reward}
                  </td>
                  <td class="px-5 py-3">
                    <span class="inline-flex items-center gap-1 text-emerald-400 font-bold">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Faol
                    </span>
                  </td>
                  <td class="px-5 py-3 text-right">
                    <button class="btn-delete-lesson px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-lg text-[11px] font-bold transition-colors" data-id="${lesson.id}">
                      O'chirish
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  // Add Lesson Toggle
  const addCard = container.querySelector('#addLessonCard');
  const btnOpen = container.querySelector('#btnOpenAddLessonModal');
  const btnClose = container.querySelector('#btnCloseAddLesson');
  const btnCancel = container.querySelector('#btnCancelAddLesson');
  const form = container.querySelector('#addLessonForm');

  btnOpen.addEventListener('click', () => addCard.classList.remove('hidden'));
  btnClose.addEventListener('click', () => addCard.classList.add('hidden'));
  btnCancel.addEventListener('click', () => addCard.classList.add('hidden'));

  // Form Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = container.querySelector('#lessonTitle').value.trim();
    const char = container.querySelector('#lessonChar').value.trim().toUpperCase();
    const word = container.querySelector('#lessonWord').value.trim();
    const emoji = container.querySelector('#lessonEmoji').value.trim();
    const difficulty = container.querySelector('#lessonDifficulty').value;
    const reward = parseInt(container.querySelector('#lessonReward').value, 10) || 10;

    state.addLesson({
      title,
      char,
      word,
      emoji,
      category: 'alphabet',
      difficulty,
      reward
    });

    if (window.soundEngine) window.soundEngine.playSuccess();
    renderCMSView(container);
  });

  // Delete Action
  container.querySelectorAll('.btn-delete-lesson').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm("Ushbu darsni o'chirmoqchimisiz?")) {
        state.deleteLesson(id);
        if (window.soundEngine) window.soundEngine.playClick();
        renderCMSView(container);
      }
    });
  });
}

// 3. SHOP & PRICING MANAGEMENT VIEW
function renderAdminShopView(container) {
  const state = window.appState;
  const items = state.shopItems;

  container.innerHTML = `
    <div class="space-y-6">
      
      <!-- Top Action Bar -->
      <div class="flex flex-wrap items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl shadow-lg">
        <div>
          <h3 class="text-lg font-black text-white">Do'kon Mahsulotlari va Narxlar Siyosati</h3>
          <p class="text-xs text-slate-400">Qahramonlar aksessuarlari narxini tangalarda o'zgartirish va yangi buyumlar qo'shish</p>
        </div>

        <button id="btnOpenAddShopModal" class="btn-bouncy px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 text-xs md:text-sm font-black rounded-xl shadow-md flex items-center gap-2 cursor-pointer">
          <span>➕</span> Yangi Aksessuar Qo'shish
        </button>
      </div>

      <!-- Add Shop Item Modal (Toggleable) -->
      <div id="addShopCard" class="hidden bg-slate-800 border-2 border-amber-500/50 p-6 rounded-2xl shadow-xl">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
          <h4 class="text-base font-black text-white flex items-center gap-2">
            <span>🛍️</span> Yangi Buyum Qo'shish
          </h4>
          <button id="btnCloseAddShop" class="text-slate-400 hover:text-white text-lg">✕</button>
        </div>

        <form id="addShopForm" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="text-xs font-bold text-slate-300 block mb-1">Buyum Nomi</label>
            <input type="text" id="shopName" required placeholder="Masalan: Zardo'zi Nimcha" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500">
          </div>

          <div>
            <label class="text-xs font-bold text-slate-300 block mb-1">Toifasi</label>
            <select id="shopCategory" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500">
              <option value="hat">Do'ppi / Bosh kiyim</option>
              <option value="outfit">Chopon / Libos</option>
              <option value="accessory">Aksessuar</option>
              <option value="room">Xona buyumi</option>
            </select>
          </div>

          <div>
            <label class="text-xs font-bold text-slate-300 block mb-1">Narxi (🪙 Zukko-tanga)</label>
            <input type="number" id="shopPrice" required value="40" min="5" max="300" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500">
          </div>

          <div>
            <label class="text-xs font-bold text-slate-300 block mb-1">Emodzi / Belgi</label>
            <input type="text" id="shopIcon" required placeholder="🦺" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500">
          </div>

          <div class="md:col-span-2">
            <label class="text-xs font-bold text-slate-300 block mb-1">Tavsif</label>
            <input type="text" id="shopDesc" required placeholder="Qahramon uchun ajoyib milliy kiyim..." class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500">
          </div>

          <div class="md:col-span-3 flex justify-end gap-3 mt-2">
            <button type="button" id="btnCancelAddShop" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold">Bekor qilish</button>
            <button type="submit" class="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black shadow-md">Do'konga Joylash</button>
          </div>
        </form>
      </div>

      <!-- Shop Items List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${items.map(item => `
          <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-3xl shadow-inner">
                  ${item.icon}
                </span>
                <span class="px-2.5 py-1 bg-slate-900 text-amber-400 rounded-lg text-xs font-black border border-slate-700">
                  🪙 ${item.price} Tanga
                </span>
              </div>

              <h4 class="text-sm font-black text-white">${item.name}</h4>
              <p class="text-xs text-slate-400 mt-1 leading-snug">${item.desc}</p>
              
              <div class="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                <span class="px-2 py-0.5 bg-slate-700/60 rounded text-slate-300 font-bold uppercase">${item.category}</span>
                <span>${item.unlocked ? '✅ Ochiq' : '🔒 Qulflangan'}</span>
              </div>
            </div>

            <!-- Price Modification Form -->
            <div class="mt-4 pt-3 border-t border-slate-700 flex items-center gap-2">
              <span class="text-xs font-bold text-slate-400">Narx:</span>
              <input type="number" class="price-input w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-bold" value="${item.price}" data-id="${item.id}">
              <button class="btn-save-price px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black transition-all" data-id="${item.id}">
                Saqlash
              </button>
            </div>

          </div>
        `).join('')}
      </div>

    </div>
  `;

  // Add Item Toggle
  const addCard = container.querySelector('#addShopCard');
  const btnOpen = container.querySelector('#btnOpenAddShopModal');
  const btnClose = container.querySelector('#btnCloseAddShop');
  const btnCancel = container.querySelector('#btnCancelAddShop');
  const form = container.querySelector('#addShopForm');

  btnOpen.addEventListener('click', () => addCard.classList.remove('hidden'));
  btnClose.addEventListener('click', () => addCard.classList.add('hidden'));
  btnCancel.addEventListener('click', () => addCard.classList.add('hidden'));

  // Form Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = container.querySelector('#shopName').value.trim();
    const category = container.querySelector('#shopCategory').value;
    const price = container.querySelector('#shopPrice').value;
    const icon = container.querySelector('#shopIcon').value.trim();
    const desc = container.querySelector('#shopDesc').value.trim();

    state.addShopItem({
      name,
      category,
      price,
      icon,
      desc
    });

    if (window.soundEngine) window.soundEngine.playSuccess();
    renderAdminShopView(container);
  });

  // Update Price
  container.querySelectorAll('.btn-save-price').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const input = container.querySelector(`.price-input[data-id="${id}"]`);
      if (input) {
        state.updateShopPrice(id, input.value);
        if (window.soundEngine) window.soundEngine.playClick();
        alert(`"${id}" buyumi narxi yangilandi: ${input.value} 🪙`);
      }
    });
  });
}

window.renderAdminPanel = renderAdminPanel;
