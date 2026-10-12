// Interactive Lessons Map & Navigation Menu Component
function renderLessonsMap(container) {
  const state = window.appState;
  const currentTab = state.activeTab;

  // Render Tab Navigation Bar
  container.innerHTML = `
    <div class="flex flex-col gap-6">
      
      <!-- Lessons Navigation Category Tabs (Duolingo style chubby buttons) -->
      <div class="flex flex-wrap items-center justify-center gap-2.5 md:gap-4 p-2 bg-white/80 backdrop-blur-md border-2 border-indigo-100 rounded-3xl shadow-sm">
        
        <!-- Tab 1: Alifbe -->
        <button class="nav-tab-btn btn-bouncy px-4 md:px-6 py-3 rounded-2xl font-black text-xs md:text-sm flex items-center gap-2 transition-all cursor-pointer ${currentTab === 'alphabet' ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 shadow-md scale-105' : 'bg-slate-50 hover:bg-amber-50 text-slate-700'}" data-tab="alphabet">
          <span class="text-xl">🔤</span>
          <span>Alifbe & Yozuv</span>
        </button>

        <!-- Tab 2: Matematika -->
        <button class="nav-tab-btn btn-bouncy px-4 md:px-6 py-3 rounded-2xl font-black text-xs md:text-sm flex items-center gap-2 transition-all cursor-pointer ${currentTab === 'math' ? 'bg-gradient-to-r from-sky-400 to-sky-500 text-white shadow-md scale-105' : 'bg-slate-50 hover:bg-sky-50 text-slate-700'}" data-tab="math">
          <span class="text-xl">🔢</span>
          <span>Matematika</span>
        </button>

        <!-- Tab 3: So'z Tuzish -->
        <button class="nav-tab-btn btn-bouncy px-4 md:px-6 py-3 rounded-2xl font-black text-xs md:text-sm flex items-center gap-2 transition-all cursor-pointer ${currentTab === 'words' ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-md scale-105' : 'bg-slate-50 hover:bg-pink-50 text-slate-700'}" data-tab="words">
          <span class="text-xl">🧩</span>
          <span>So'z & Gap Tuzish</span>
        </button>

        <!-- Tab 4: AI Yozish Maydoni -->
        <button class="nav-tab-btn btn-bouncy px-4 md:px-6 py-3 rounded-2xl font-black text-xs md:text-sm flex items-center gap-2 transition-all cursor-pointer ${currentTab === 'canvas' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md scale-105' : 'bg-slate-50 hover:bg-indigo-50 text-slate-700'}" data-tab="canvas">
          <span class="text-xl">✏️</span>
          <span>AI Yozish Maydoni</span>
        </button>

      </div>

      <!-- Tab Content Mount Point -->
      <div id="tabContentMount" class="w-full">
        <!-- Injected depending on active tab -->
      </div>

    </div>
  `;

  const mountPoint = container.querySelector('#tabContentMount');

  // Handle Tab Switch
  container.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.getAttribute('data-tab');
      if (window.soundEngine) window.soundEngine.playClick();
      state.setActiveTab(tab);
    });
  });

  // Render Content based on activeTab
  if (currentTab === 'alphabet') {
    renderAlphabetGrid(mountPoint);
  } else if (currentTab === 'math') {
    if (window.renderMathQuiz) window.renderMathQuiz(mountPoint);
  } else if (currentTab === 'words') {
    if (window.renderWordBuilder) window.renderWordBuilder(mountPoint);
  } else if (currentTab === 'canvas') {
    if (window.renderCanvasSection) window.renderCanvasSection(mountPoint);
  }
}

// Alphabet & Writing Section Grid
function renderAlphabetGrid(container) {
  const state = window.appState;
  const lessons = state.lessons;

  container.innerHTML = `
    <div class="bg-white border-2 border-indigo-100 rounded-3xl p-5 md:p-7 shadow-xl">
      
      <!-- Section Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-xl md:text-2xl font-black text-slate-800">O'zbek Alifbosi va To'g'ri Yozish</h3>
            <span class="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-black rounded-lg">Harflar olami</span>
          </div>
          <p class="text-xs md:text-sm font-semibold text-slate-500 mt-0.5">
            Har bir harfni tanlang, talaffuzini tinglang va AI doskasida chiroyli qilib yozing!
          </p>
        </div>

        <div class="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-2xl">
          Jami darslar: ${lessons.length} ta
        </div>
      </div>

      <!-- Letters Grid (Duolingo style cards) -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        ${lessons.map((lesson, idx) => `
          <div class="letter-tile card-chubby bg-gradient-to-b from-white to-slate-50 border-2 border-slate-200/80 hover:border-amber-400 p-4 flex flex-col items-center justify-between text-center relative group cursor-pointer" data-id="${lesson.id}">
            
            <!-- Difficulty Badge -->
            <span class="absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-lg ${
              lesson.difficulty === 'Oson' ? 'bg-emerald-100 text-emerald-700' :
              lesson.difficulty === 'O\'rta' ? 'bg-sky-100 text-sky-700' : 'bg-purple-100 text-purple-700'
            }">
              ${lesson.difficulty}
            </span>

            <!-- Big Letter & Emoji -->
            <div class="my-2">
              <span class="text-4xl md:text-5xl font-black text-indigo-900 group-hover:scale-110 transition-transform block">
                ${lesson.char}
              </span>
              <span class="text-2xl mt-1 block group-hover:animate-bounce">
                ${lesson.emoji}
              </span>
            </div>

            <!-- Word Clue -->
            <div class="w-full">
              <span class="text-xs md:text-sm font-extrabold text-slate-700 block">${lesson.word}</span>
              <div class="mt-2.5 flex items-center justify-between w-full pt-2 border-t border-slate-100">
                <span class="text-xs font-black text-amber-600 flex items-center gap-1">
                  🪙 +${lesson.reward}
                </span>
                <span class="text-[11px] font-black text-indigo-600 group-hover:underline">
                  Yozish ✏️
                </span>
              </div>
            </div>

          </div>
        `).join('')}
      </div>

    </div>
  `;

  // Click on letter tile opens Canvas with that letter
  container.querySelectorAll('.letter-tile').forEach(tile => {
    tile.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const lesson = lessons.find(l => l.id === id);
      if (lesson) {
        if (window.soundEngine) {
          window.soundEngine.speak(`${lesson.char}. ${lesson.word}`);
        }
        state.selectTask({
          id: lesson.id,
          title: `${lesson.char} harfini yozish`,
          char: lesson.char,
          word: lesson.word,
          emoji: lesson.emoji,
          category: 'alphabet',
          reward: lesson.reward,
          guideType: 'letter'
        });
      }
    });
  });
}

window.renderLessonsMap = renderLessonsMap;
